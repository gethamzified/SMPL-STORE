-- =============================================
-- DATABASE SECURITY HARDENING
-- Target: Function Search Path, Extension Schema, & RLS Scoping
-- =============================================

-- 0. PREPARE EXTENSIONS SCHEMA
CREATE SCHEMA IF NOT EXISTS extensions;

-- 1. HARDEN FUNCTION SEARCH PATHS
-- Setting search_path explicitly prevents search_path shadowing attacks.

-- create_order
CREATE OR REPLACE FUNCTION public.create_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    new_order_id UUID;
    customer_id UUID;
    item JSONB;
    p_stock INT;
    v_stock INT;
    v_id UUID;
    p_id UUID;
    req_qty INT;
    cust_data JSONB;
BEGIN
    -- 1. Customer Upsert Logic
    IF (payload->>'user_id') IS NOT NULL THEN
        SELECT id INTO customer_id FROM customers WHERE user_id = (payload->>'user_id')::UUID;
    END IF;

    cust_data := payload->'shipping_address';

    IF customer_id IS NOT NULL THEN
        -- Update existing customer
        UPDATE customers 
        SET 
            first_name = COALESCE(cust_data->>'first_name', first_name),
            last_name = COALESCE(cust_data->>'last_name', last_name),
            phone = COALESCE(payload->>'phone', phone),
            address1 = COALESCE(cust_data->>'address1', address1),
            city = COALESCE(cust_data->>'city', city),
            zip = COALESCE(cust_data->>'zip', zip),
            country = COALESCE(cust_data->>'country', country)
        WHERE id = customer_id;
    ELSE
        -- Insert new customer
        INSERT INTO customers (
            user_id, 
            email, 
            phone, 
            first_name, 
            last_name, 
            address1, 
            city, 
            zip, 
            country
        ) VALUES (
            (payload->>'user_id')::UUID, 
            payload->>'email',
            payload->>'phone',
            cust_data->>'first_name',
            cust_data->>'last_name',
            cust_data->>'address1',
            cust_data->>'city',
            cust_data->>'zip',
            cust_data->>'country'
        ) RETURNING id INTO customer_id;
    END IF;

    -- 2. Insert Order
    INSERT INTO orders (
        customer_id, email, phone, status, fulfillment_status, payment_status,
        subtotal, shipping_total, tax_total, total,
        shipping_address, billing_address, payment_method, payment_proof, source
    ) VALUES (
        customer_id, payload->>'email', payload->>'phone', payload->>'status',
        payload->>'fulfillment_status', payload->>'payment_status',
        (payload->>'subtotal')::NUMERIC, (payload->>'shipping_total')::NUMERIC,
        (payload->>'tax_total')::NUMERIC, (payload->>'total')::NUMERIC,
        payload->'shipping_address', payload->'billing_address',
        payload->>'payment_method', payload->'payment_proof', 'web'
    ) RETURNING id INTO new_order_id;

    -- 3. Process Items
    FOR item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        p_id := (item->>'product_id')::UUID;
        IF item->>'variant_id' IS NULL OR item->>'variant_id' = 'null' THEN
            v_id := NULL;
        ELSE
            v_id := (item->>'variant_id')::UUID;
        END IF;

        req_qty := (item->>'quantity')::INT;

        IF v_id IS NOT NULL THEN
            SELECT inventory_quantity INTO v_stock FROM product_variants WHERE id = v_id FOR UPDATE;
            IF v_stock < req_qty THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
            UPDATE product_variants SET inventory_quantity = inventory_quantity - req_qty WHERE id = v_id;
        ELSE
            SELECT stock INTO p_stock FROM products WHERE id = p_id FOR UPDATE;
            IF p_stock < req_qty THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
            UPDATE products SET stock = stock - req_qty WHERE id = p_id;
        END IF;

        INSERT INTO order_items (
            order_id, product_id, variant_id, title, variant_title, sku, image_url,
            quantity, unit_price, total_price, requires_shipping
        ) VALUES (
            new_order_id, p_id, v_id, item->>'title', item->>'variant_title',
            item->>'sku', item->>'image_url', req_qty,
            (item->>'unit_price')::NUMERIC, (item->>'total_price')::NUMERIC,
            (item->>'requires_shipping')::BOOLEAN
        );
    END LOOP;

    RETURN (SELECT row_to_json(o) FROM orders o WHERE id = new_order_id);
END;
$$;

-- decrement_stock
CREATE OR REPLACE FUNCTION public.decrement_stock(p_id uuid, qty integer)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    UPDATE products SET stock = stock - qty WHERE id = p_id AND stock >= qty;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', p_id;
    END IF;
END;
$$;

-- increment_stock
CREATE OR REPLACE FUNCTION public.increment_stock(product_id UUID, quantity INT, variant_id UUID DEFAULT NULL) 
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF variant_id IS NOT NULL THEN
    UPDATE product_variants SET inventory_quantity = inventory_quantity + quantity WHERE id = variant_id;
  ELSE
    UPDATE products SET stock = stock + quantity WHERE id = product_id;
  END IF;
END;
$$;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- update_customer_order_metrics
CREATE OR REPLACE FUNCTION public.update_customer_order_metrics()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL AND NEW.payment_status = 'paid' THEN
        UPDATE customers
        SET 
            total_spent = total_spent + NEW.total,
            total_orders = total_orders + 1,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$;


-- 2. RELOCATE EXTENSIONS
-- Moving extensions out of public schema for security.
ALTER EXTENSION "pg_trgm" SET SCHEMA extensions;
ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;


-- 3. HARDEN RLS POLICIES
-- Restricting the "Service role can manage OTPs" policy strictly to service_role.

DROP POLICY IF EXISTS "Service role can manage OTPs" ON public.user_otps;
CREATE POLICY "Service role can manage OTPs" ON public.user_otps
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 4. VERIFY
SELECT 'SUCCESS! Security hardening applied.' as status;
