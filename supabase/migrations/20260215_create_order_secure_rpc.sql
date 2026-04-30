-- Migration: 20260215_create_order_secure_rpc.sql
-- Description: Adds a secure, atomic RPC function to handle order creation and stock deduction.

CREATE OR REPLACE FUNCTION create_order_secure(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id UUID;
    customer_id UUID;
    item JSONB;
    v_id UUID;
    req_qty INT;
    
    -- Inventory variables
    inv_record RECORD;
    needed_qty INT;
    current_qty INT;
    
    -- Customer variables
    cust_data JSONB;
    cust_email TEXT;
BEGIN
    -- 1. Identify or Create Customer
    cust_data := payload->'shipping_address';
    cust_email := payload->>'email';
    
    -- Try to find by user_id first
    IF (payload->>'customer_id') IS NOT NULL AND (payload->>'customer_id') != 'null' THEN
         customer_id := (payload->>'customer_id')::UUID;
    ELSE
         -- Try to find by email
         SELECT id INTO customer_id FROM customers WHERE email = cust_email LIMIT 1;
    END IF;

    IF customer_id IS NOT NULL THEN
        -- Update existing customer address info
        UPDATE customers 
        SET 
            first_name = COALESCE(cust_data->>'first_name', first_name),
            last_name = COALESCE(cust_data->>'last_name', last_name),
            phone = COALESCE(payload->>'phone', phone),
            address1 = COALESCE(cust_data->>'address1', address1),
            city = COALESCE(cust_data->>'city', city),
            zip = COALESCE(cust_data->>'zip', zip),
            country = COALESCE(cust_data->>'country', country),
            updated_at = NOW()
        WHERE id = customer_id;
    ELSE
        -- Create new customer
        INSERT INTO customers (
            email, 
            phone, 
            first_name, 
            last_name, 
            address1, 
            city, 
            zip, 
            country,
            user_id
        ) VALUES (
            cust_email,
            payload->>'phone',
            cust_data->>'first_name',
            cust_data->>'last_name',
            cust_data->>'address1',
            cust_data->>'city',
            cust_data->>'zip',
            cust_data->>'country',
            (payload->>'user_id')::UUID -- May be null
        ) RETURNING id INTO customer_id;
    END IF;

    -- 2. Insert Order Header
    INSERT INTO orders (
        customer_id,
        email,
        phone,
        status,
        fulfillment_status,
        payment_status,
        subtotal,
        shipping_total,
        tax_total,
        total,
        shipping_address,
        billing_address,
        payment_method,
        payment_proof_url,
        transaction_id,
        source
    ) VALUES (
        customer_id,
        cust_email,
        payload->>'phone',
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

    -- 3. Process Items & Deduct Stock
    FOR item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        v_id := (item->>'variant_id')::UUID;
        req_qty := (item->>'quantity')::INT;

        -- A. Validate Variant Availability (Locking)
        IF v_id IS NOT NULL THEN
            needed_qty := req_qty;
            
            -- Iterate through inventory levels for this variant, locking them
            -- Order by available DESC to take from largest pool first (Greedy)
            FOR inv_record IN 
                SELECT id, available 
                FROM inventory_levels 
                WHERE variant_id = v_id 
                ORDER BY available DESC
                FOR UPDATE
            LOOP
                IF needed_qty <= 0 THEN
                    EXIT; -- Done
                END IF;

                current_qty := inv_record.available;

                IF current_qty > 0 THEN
                    IF current_qty >= needed_qty THEN
                        -- This location has enough
                        UPDATE inventory_levels 
                        SET available = available - needed_qty 
                        WHERE id = inv_record.id;
                        
                        needed_qty := 0;
                    ELSE
                        -- Take what we can
                        UPDATE inventory_levels 
                        SET available = 0 
                        WHERE id = inv_record.id;
                        
                        needed_qty := needed_qty - current_qty;
                    END IF;
                END IF;
            END LOOP;

             -- If we still need quantity after checking all locations, FAIL
            IF needed_qty > 0 THEN
                RAISE EXCEPTION 'Insufficient stock for variant % (Missing %)', v_id, needed_qty 
                USING ERRCODE = 'P0001'; -- Custom error code
            END IF;

             -- Legacy inventory_quantity field on product_variants REMOVED
             -- We strictly use inventory_levels now.

        ELSE
             -- Handle "Product-only" stock (if legacy architecture exists)
             -- Assuming SMPL is variant-first based on schema, but safe to ignore if undefined
             -- If product has no variants, we might check 'products.stock'
             -- BUT strict rule: Stock lives at Variant Level.
             -- If v_id is null, it's likely a digital item or unmanaged.
             NULL; 
        END IF;

        -- B. Insert Order Item
        INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            title,
            variant_title,
            sku,
            image_url,
            quantity,
            unit_price,
            total_price,
            requires_shipping
        ) VALUES (
            new_order_id,
            (item->>'product_id')::UUID,
            v_id,
            item->>'title',
            item->>'variant_title',
            item->>'sku',
            item->>'image_url',
            req_qty,
            (item->>'unit_price')::NUMERIC,
            (item->>'total_price')::NUMERIC,
            COALESCE((item->>'requires_shipping')::BOOLEAN, true)
        );

    END LOOP;

    -- 4. Return the full order object
    RETURN (
        SELECT row_to_json(o) 
        FROM orders o 
        WHERE id = new_order_id
    );

EXCEPTION WHEN OTHERS THEN
    -- Propagate error to client
    RAISE;
END;
$$;
