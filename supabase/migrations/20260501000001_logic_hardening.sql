-- Logic Hardening: 20260501000001_logic_hardening.sql
-- Description: Centralizes stock management in inventory_levels and implements sync triggers for legacy columns.

-- 1. CONSOLIDATE STOCK DATA MIGRATION
-- (Moves simple product stock to inventory_levels if not already there)
DO $$
DECLARE
    default_loc_id UUID;
BEGIN
    SELECT id INTO default_loc_id FROM public.inventory_locations WHERE is_default = TRUE LIMIT 1;
    
    IF default_loc_id IS NOT NULL THEN
        INSERT INTO public.inventory_levels (location_id, product_id, available)
        SELECT default_loc_id, id, stock
        FROM public.products p
        WHERE stock > 0 
          AND NOT EXISTS (SELECT 1 FROM public.product_variants v WHERE v.product_id = p.id)
          AND NOT EXISTS (SELECT 1 FROM public.inventory_levels il WHERE il.product_id = p.id AND il.variant_id IS NULL)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 2. STOCK SYNC FUNCTION
-- Automatically keeps products.stock and product_variants.stock updated
CREATE OR REPLACE FUNCTION public.sync_inventory_to_legacy_columns()
RETURNS TRIGGER AS $$
DECLARE
    v_product_id UUID;
BEGIN
    -- Update Product Variant stock if variant_id is present
    IF NEW.variant_id IS NOT NULL THEN
        UPDATE public.product_variants
        SET 
            stock = (SELECT COALESCE(SUM(available), 0) FROM public.inventory_levels WHERE variant_id = NEW.variant_id),
            inventory_quantity = (SELECT COALESCE(SUM(available), 0) FROM public.inventory_levels WHERE variant_id = NEW.variant_id),
            updated_at = NOW()
        WHERE id = NEW.variant_id
        RETURNING product_id INTO v_product_id;
    END IF;

    -- Determine which product_id to update
    v_product_id := COALESCE(NEW.product_id, v_product_id);

    -- Update Product stock (Sum of all its variants or its direct inventory level)
    IF v_product_id IS NOT NULL THEN
        UPDATE public.products
        SET 
            stock = (
                SELECT COALESCE(SUM(available), 0) 
                FROM public.inventory_levels 
                WHERE product_id = v_product_id 
                   OR variant_id IN (SELECT id FROM public.product_variants WHERE product_id = v_product_id)
            ),
            updated_at = NOW()
        WHERE id = v_product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. SYNC TRIGGER
CREATE TRIGGER trg_sync_inventory_to_legacy
AFTER INSERT OR UPDATE OR DELETE ON public.inventory_levels
FOR EACH ROW EXECUTE FUNCTION sync_inventory_to_legacy_columns();

-- 4. REFACTORED ORDER CREATION (ONLY USES inventory_levels)
CREATE OR REPLACE FUNCTION public.create_order_secure(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_order_id UUID;
    customer_id UUID;
    item JSONB;
    v_id UUID;
    p_id UUID;
    req_qty INT;
    inv_record RECORD;
    needed_qty INT;
    current_qty INT;
    total_avail INT;
    cust_data JSONB;
    cust_email TEXT;
BEGIN
    -- [1] CUSTOMER IDENTIFICATION/CREATION (Refined & Race-Condition Safe)
    cust_data := payload->'shipping_address';
    cust_email := payload->>'email';

    -- Try finding by user_id first
    IF (payload->>'user_id') IS NOT NULL AND (payload->>'user_id') <> 'null' THEN
        SELECT id INTO customer_id FROM public.customers WHERE user_id = (payload->>'user_id')::UUID LIMIT 1;
    END IF;

    -- Upsert customer to handle race conditions on email
    IF customer_id IS NULL AND cust_email IS NOT NULL THEN
        INSERT INTO public.customers (
            user_id, email, phone, first_name, last_name,
            address1, city, zip, country
        ) VALUES (
            NULLIF(payload->>'user_id', 'null')::UUID,
            cust_email,
            payload->>'phone',
            cust_data->>'first_name',
            cust_data->>'last_name',
            cust_data->>'address1',
            cust_data->>'city',
            cust_data->>'zip',
            COALESCE(cust_data->>'country', 'PAKISTAN')
        )
        ON CONFLICT (email) DO UPDATE SET
            user_id = COALESCE(customers.user_id, EXCLUDED.user_id),
            first_name = COALESCE(EXCLUDED.first_name, customers.first_name),
            last_name = COALESCE(EXCLUDED.last_name, customers.last_name),
            updated_at = NOW()
        RETURNING id INTO customer_id;
    END IF;

    -- Final fallback if still null
    IF customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer identification failed' USING ERRCODE = 'P0002';
    END IF;

    -- [2] ORDER HEADER
    INSERT INTO public.orders (
        customer_id, email, phone, status, fulfillment_status, payment_status,
        subtotal, shipping_total, tax_total, total, shipping_address, billing_address,
        payment_method, payment_proof_url, transaction_id, source
    ) VALUES (
        customer_id, cust_email, payload->>'phone',
        COALESCE(payload->>'status', 'pending'),
        COALESCE(payload->>'fulfillment_status', 'unfulfilled'),
        COALESCE(payload->>'payment_status', 'pending'),
        (payload->>'subtotal')::NUMERIC,
        (payload->>'shipping_total')::NUMERIC,
        (payload->>'tax_total')::NUMERIC,
        (payload->>'total')::NUMERIC,
        payload->'shipping_address',
        payload->'billing_address',
        payload->>'payment_method',
        payload->>'payment_proof_url',
        payload->>'transaction_id',
        'web'
    ) RETURNING id INTO new_order_id;

    -- [3] ITEMS & CONSOLIDATED INVENTORY
    FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'items', '[]'::jsonb))
    LOOP
        p_id := NULLIF(item->>'product_id', 'null')::UUID;
        v_id := NULLIF(item->>'variant_id', 'null')::UUID;
        req_qty := (item->>'quantity')::INT;

        -- Check availability across all locations (including simple products)
        SELECT COALESCE(SUM(available), 0) INTO total_avail 
        FROM public.inventory_levels 
        WHERE (variant_id = v_id AND v_id IS NOT NULL)
           OR (product_id = p_id AND v_id IS NULL AND variant_id IS NULL);

        IF total_avail < req_qty THEN
            RAISE EXCEPTION 'Insufficient stock for product % variant %', p_id, v_id USING ERRCODE = 'P0001';
        END IF;

        needed_qty := req_qty;
        
        -- Deduct from inventory_levels with FOR UPDATE locking
        FOR inv_record IN 
            SELECT id, available 
            FROM public.inventory_levels 
            WHERE (variant_id = v_id AND v_id IS NOT NULL)
               OR (product_id = p_id AND v_id IS NULL AND variant_id IS NULL)
            ORDER BY available DESC 
            FOR UPDATE
        LOOP
            EXIT WHEN needed_qty <= 0;
            IF inv_record.available >= needed_qty THEN
                UPDATE public.inventory_levels SET available = available - needed_qty WHERE id = inv_record.id;
                needed_qty := 0;
            ELSE
                UPDATE public.inventory_levels SET available = 0 WHERE id = inv_record.id;
                needed_qty := needed_qty - inv_record.available;
            END IF;
        END LOOP;

        IF needed_qty > 0 THEN
            RAISE EXCEPTION 'Insufficient stock (concurrent update) for product %', p_id USING ERRCODE = 'P0001';
        END IF;

        INSERT INTO public.order_items (
            order_id, product_id, variant_id, title, variant_title, sku, image_url,
            quantity, unit_price, total_price, requires_shipping
        ) VALUES (
            new_order_id, p_id, v_id, item->>'title', item->>'variant_title', item->>'sku', item->>'image_url',
            req_qty, (item->>'unit_price')::NUMERIC, (item->>'total_price')::NUMERIC,
            COALESCE((item->>'requires_shipping')::BOOLEAN, true)
        );
    END LOOP;

    RETURN (SELECT row_to_json(o) FROM public.orders o WHERE id = new_order_id);
END;
$$;

-- 5. REFACTORED STOCK RESTORATION
CREATE OR REPLACE FUNCTION public.restore_order_stock(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    item RECORD;
    inv RECORD;
    needed_qty INT;
    default_loc_id UUID;
BEGIN
    SELECT id INTO default_loc_id FROM public.inventory_locations WHERE is_default = TRUE LIMIT 1;

    FOR item IN SELECT product_id, variant_id, quantity FROM public.order_items WHERE order_id = p_order_id
    LOOP
        needed_qty := item.quantity;
        
        -- Try to restore to existing locations
        FOR inv IN 
            SELECT id, available 
            FROM public.inventory_levels 
            WHERE (variant_id = item.variant_id AND item.variant_id IS NOT NULL)
               OR (product_id = item.product_id AND item.variant_id IS NULL AND variant_id IS NULL)
            ORDER BY available ASC 
            FOR UPDATE
        LOOP
            EXIT WHEN needed_qty <= 0;
            UPDATE public.inventory_levels SET available = available + needed_qty WHERE id = inv.id;
            needed_qty := 0;
        LOOP_RESTORE: EXIT; -- Exit inner loop after restoration
        END LOOP;

        -- If no locations exist, create one at default
        IF needed_qty > 0 AND default_loc_id IS NOT NULL THEN
            INSERT INTO public.inventory_levels (location_id, variant_id, product_id, available)
            VALUES (default_loc_id, item.variant_id, item.product_id, needed_qty);
        END IF;
    END LOOP;
END;
$$;

-- 6. ATOMIC CANCEL ORDER
CREATE OR REPLACE FUNCTION public.cancel_order_secure(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_order_status TEXT;
    v_result JSONB;
BEGIN
    -- 1. Check order existence and status
    SELECT status INTO v_order_status FROM public.orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0002';
    END IF;

    IF v_order_status = 'cancelled' THEN
        RAISE EXCEPTION 'Order already cancelled' USING ERRCODE = 'P0003';
    END IF;

    -- 2. Restore Stock
    PERFORM public.restore_order_stock(p_order_id);

    -- 3. Update Order
    UPDATE public.orders
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW()
    WHERE id = p_order_id
    RETURNING row_to_json(public.orders.*) INTO v_result;

    RETURN v_result;
END;
$$;

