-- Migration: 20260111_create_order_transaction.sql
-- Description: Adds a transactional RPC function to handle order creation safely.

CREATE OR REPLACE FUNCTION create_order(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (should be admin/service_role)
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
    -- If user_id is provided, try to find existing customer
    IF (payload->>'user_id') IS NOT NULL THEN
        SELECT id INTO customer_id FROM customers WHERE user_id = (payload->>'user_id')::UUID;
    END IF;

    -- If no customer found by user_id, try by email (optional, depends on business logic, sticking to Plan: user_id or new)
    -- For guest checkout, we might just create a new customer record every time or match by email. 
    -- Let's stick to the previous service logic: if user_id exists, update; else create.
    
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
            (payload->>'user_id')::UUID, -- Can be null
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
        payment_proof,
        source
    ) VALUES (
        customer_id,
        payload->>'email',
        payload->>'phone',
        payload->>'status',
        payload->>'fulfillment_status',
        payload->>'payment_status',
        (payload->>'subtotal')::NUMERIC,
        (payload->>'shipping_total')::NUMERIC,
        (payload->>'tax_total')::NUMERIC,
        (payload->>'total')::NUMERIC,
        payload->'shipping_address',
        payload->'billing_address',
        payload->>'payment_method',
        payload->'payment_proof', -- JSONB
        'web'
    ) RETURNING id INTO new_order_id;

    -- 3. Process Items (Stock Check & Insert)
    FOR item IN SELECT * FROM jsonb_array_elements(payload->'items')
    LOOP
        p_id := (item->>'product_id')::UUID;
        v_id := (item->>'variant_id')::UUID; -- Casts null to null correctly? No, 'null' string needs care.
        IF item->>'variant_id' IS NULL OR item->>'variant_id' = 'null' THEN
            v_id := NULL;
        ELSE
            v_id := (item->>'variant_id')::UUID;
        END IF;

        req_qty := (item->>'quantity')::INT;

        -- Stock Check
        IF v_id IS NOT NULL THEN
            -- Check Variant Stock
            SELECT inventory_quantity INTO v_stock FROM product_variants WHERE id = v_id FOR UPDATE;
            IF v_stock IS NULL THEN RAISE EXCEPTION 'Variant not found: %', v_id; END IF;
            IF v_stock < req_qty THEN RAISE EXCEPTION 'Insufficient stock for variant %', v_id; END IF;

            -- Deduct Stock
            UPDATE product_variants SET inventory_quantity = inventory_quantity - req_qty WHERE id = v_id;
        ELSE
            -- Check Product Stock
            SELECT stock INTO p_stock FROM products WHERE id = p_id FOR UPDATE;
            IF p_stock IS NULL THEN RAISE EXCEPTION 'Product not found: %', p_id; END IF;
            IF p_stock < req_qty THEN RAISE EXCEPTION 'Insufficient stock for product %', p_id; END IF;

            -- Deduct Stock
            UPDATE products SET stock = stock - req_qty WHERE id = p_id;
        END IF;

        -- Insert Order Item
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
            p_id,
            v_id,
            item->>'title',
            item->>'variant_title',
            item->>'sku',
            item->>'image_url',
            req_qty,
            (item->>'unit_price')::NUMERIC,
            (item->>'total_price')::NUMERIC,
            (item->>'requires_shipping')::BOOLEAN
        );
    END LOOP;

    -- Return the full order object (simulating select *)
    RETURN (SELECT row_to_json(o) FROM orders o WHERE id = new_order_id);

EXCEPTION WHEN OTHERS THEN
    -- Transaction automatically rolls back on exception
    RAISE;
END;
$$;
