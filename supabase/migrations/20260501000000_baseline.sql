-- Baseline Migration: 20260501000000_baseline.sql
-- Description: Consolidated schema baseline for the SMPL project.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";

-- 2. TABLES

-- Users (Auth managed but synced to public for profile data)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    address JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers (Linked to users or guest emails)
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province TEXT,
    zip TEXT,
    country TEXT DEFAULT 'PAKISTAN',
    country_code TEXT DEFAULT 'PK',
    total_spent NUMERIC DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    accepts_marketing BOOLEAN DEFAULT FALSE,
    marketing_updated_at TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    short_description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    sale_price NUMERIC,
    cost_per_item NUMERIC,
    cover_image TEXT,
    images JSONB DEFAULT '[]'::JSONB,
    sku TEXT UNIQUE,
    barcode TEXT,
    stock INTEGER DEFAULT 0,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorder BOOLEAN DEFAULT FALSE,
    weight NUMERIC,
    weight_unit TEXT DEFAULT 'kg',
    tags TEXT[] DEFAULT '{}'::TEXT[],
    vendor TEXT,
    product_type TEXT,
    status TEXT DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    enable_color_variants BOOLEAN DEFAULT FALSE,
    enable_size_variants BOOLEAN DEFAULT FALSE,
    available_colors TEXT[] DEFAULT '{}'::TEXT[],
    available_sizes TEXT[] DEFAULT '{}'::TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- Product Variants
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    color TEXT,
    size TEXT,
    status TEXT DEFAULT 'active',
    option1_name TEXT DEFAULT 'Size',
    option1_value TEXT,
    option2_name TEXT DEFAULT 'Color',
    option2_value TEXT,
    option3_name TEXT,
    option3_value TEXT,
    price NUMERIC,
    sale_price NUMERIC,
    sku TEXT UNIQUE,
    barcode TEXT,
    stock INTEGER DEFAULT 0,
    inventory_quantity INTEGER DEFAULT 0,
    image_url TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory
CREATE TABLE public.inventory_locations (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    name TEXT NOT NULL,
    address JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.inventory_levels (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES public.inventory_locations(id),
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    available INTEGER DEFAULT 0,
    reserved INTEGER DEFAULT 0,
    incoming INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_number SERIAL UNIQUE,
    customer_id UUID REFERENCES public.customers(id),
    email TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status = ANY (ARRAY['pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'voided', 'failed', 'pending_verification', 'cod_pending', 'proof_submitted'])),
    fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status = ANY (ARRAY['unfulfilled', 'partial', 'fulfilled'])),
    currency TEXT DEFAULT 'PKR',
    subtotal NUMERIC NOT NULL,
    discount_total NUMERIC DEFAULT 0,
    shipping_total NUMERIC DEFAULT 0,
    tax_total NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number TEXT,
    tracking_url TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    payment_method TEXT,
    payment_reference TEXT,
    payment_proof JSONB,
    payment_proof_url TEXT,
    transaction_id TEXT,
    discount_codes JSONB DEFAULT '[]'::JSONB,
    customer_note TEXT,
    internal_note TEXT,
    admin_message TEXT,
    source TEXT DEFAULT 'web',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    title TEXT NOT NULL,
    variant_title TEXT,
    sku TEXT,
    image_url TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    total_price NUMERIC NOT NULL,
    fulfilled_quantity INTEGER DEFAULT 0,
    requires_shipping BOOLEAN DEFAULT TRUE,
    properties JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CMS
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author_id UUID REFERENCES auth.users(id),
    author_name TEXT,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.pages (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    sections JSONB DEFAULT '[]'::JSONB,
    template TEXT DEFAULT 'default',
    is_published BOOLEAN DEFAULT FALSE,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.site_config (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FUNCTIONS

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.sync_product_variant_facets()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id UUID;
BEGIN
    target_product_id := COALESCE(NEW.product_id, OLD.product_id);
    UPDATE public.products
    SET
        available_colors = COALESCE((
            SELECT ARRAY(
                SELECT DISTINCT color
                FROM public.product_variants
                WHERE product_id = target_product_id
                  AND color IS NOT NULL
                  AND color <> ''
                  AND status = 'active'
            )
        ), '{}'::text[]),
        available_sizes = COALESCE((
            SELECT ARRAY(
                SELECT DISTINCT size
                FROM public.product_variants
                WHERE product_id = target_product_id
                  AND size IS NOT NULL
                  AND size <> ''
                  AND status = 'active'
            )
        ), '{}'::text[])
    WHERE id = target_product_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. TRIGGERS

CREATE TRIGGER trg_sync_product_facets AFTER INSERT OR UPDATE OR DELETE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION sync_product_variant_facets();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_levels_updated_at BEFORE UPDATE ON public.inventory_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS POLICIES

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View active products" ON public.products FOR SELECT TO public USING (status = 'active');

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View product variants" ON public.product_variants FOR SELECT TO public USING (TRUE);

ALTER TABLE public.inventory_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: View inventory levels" ON public.inventory_levels FOR SELECT TO public USING (TRUE);

-- [Previous content above]

-- [Remaining Tables]

CREATE TABLE public.user_otps (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + '00:10:00'::INTERVAL),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.user_cart (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    product_id UUID REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    product_id UUID NOT NULL REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id),
    customer_id UUID REFERENCES public.customers(id),
    order_id UUID REFERENCES public.orders(id),
    verified_order_item_id UUID REFERENCES public.order_items(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT,
    reviewer_name TEXT,
    reviewer_email TEXT,
    status TEXT DEFAULT 'pending',
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    admin_response TEXT,
    admin_response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active',
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE public.navigation_menus (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    handle TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    items JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.site_config (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [Remaining Functions]

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
    p_stock INT;
    cust_data JSONB;
    cust_email TEXT;
BEGIN
    cust_data := payload->'shipping_address';
    cust_email := payload->>'email';

    IF (payload->>'customer_id') IS NOT NULL AND (payload->>'customer_id') <> 'null' THEN
        customer_id := (payload->>'customer_id')::UUID;
    ELSIF (payload->>'user_id') IS NOT NULL AND (payload->>'user_id') <> 'null' THEN
        SELECT id INTO customer_id FROM public.customers WHERE user_id = (payload->>'user_id')::UUID LIMIT 1;
    END IF;

    IF customer_id IS NULL AND cust_email IS NOT NULL THEN
        SELECT id INTO customer_id FROM public.customers WHERE email = cust_email LIMIT 1;
    END IF;

    IF customer_id IS NOT NULL THEN
        UPDATE public.customers
        SET
            email = COALESCE(cust_email, email),
            first_name = COALESCE(cust_data->>'first_name', first_name),
            last_name = COALESCE(cust_data->>'last_name', last_name),
            phone = COALESCE(payload->>'phone', phone),
            address1 = COALESCE(cust_data->>'address1', address1),
            address2 = COALESCE(cust_data->>'address2', address2),
            city = COALESCE(cust_data->>'city', city),
            province = COALESCE(cust_data->>'province', province),
            zip = COALESCE(cust_data->>'postal_code', cust_data->>'zip', zip),
            country = COALESCE(cust_data->>'country', country),
            country_code = COALESCE(cust_data->>'country_code', country_code)
        WHERE id = customer_id;
    ELSE
        INSERT INTO public.customers (
            user_id, email, phone, first_name, last_name,
            address1, address2, city, province, zip, country, country_code
        ) VALUES (
            NULLIF(payload->>'user_id', 'null')::UUID,
            cust_email,
            payload->>'phone',
            cust_data->>'first_name',
            cust_data->>'last_name',
            cust_data->>'address1',
            cust_data->>'address2',
            cust_data->>'city',
            cust_data->>'province',
            COALESCE(cust_data->>'postal_code', cust_data->>'zip'),
            COALESCE(cust_data->>'country', 'PAKISTAN'),
            COALESCE(cust_data->>'country_code', 'PK')
        ) RETURNING id INTO customer_id;
    END IF;

    INSERT INTO public.orders (
        customer_id, email, phone, status, fulfillment_status, payment_status,
        subtotal, shipping_total, tax_total, total, shipping_address, billing_address,
        payment_method, payment_proof, payment_proof_url, transaction_id, source
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
        payload->'payment_proof',
        payload->>'payment_proof_url',
        payload->>'transaction_id',
        'web'
    ) RETURNING id INTO new_order_id;

    FOR item IN SELECT * FROM jsonb_array_elements(COALESCE(payload->'items', '[]'::jsonb))
    LOOP
        p_id := NULLIF(item->>'product_id', 'null')::UUID;
        v_id := NULLIF(item->>'variant_id', 'null')::UUID;
        req_qty := (item->>'quantity')::INT;

        IF v_id IS NOT NULL THEN
            -- [Inventory Check & Lock]
            SELECT COALESCE(SUM(available), 0) INTO total_avail FROM public.inventory_levels WHERE variant_id = v_id;
            IF total_avail < req_qty THEN
                RAISE EXCEPTION 'Insufficient stock for variant %', v_id USING ERRCODE = 'P0001';
            END IF;

            needed_qty := req_qty;
            FOR inv_record IN SELECT id, available FROM public.inventory_levels WHERE variant_id = v_id ORDER BY available DESC FOR UPDATE
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
        ELSE
            -- [Legacy Product Stock]
            UPDATE public.products SET stock = stock - req_qty WHERE id = p_id AND stock >= req_qty;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Insufficient stock for product %', p_id USING ERRCODE = 'P0001';
            END IF;
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
BEGIN
    FOR item IN SELECT product_id, variant_id, quantity FROM public.order_items WHERE order_id = p_order_id
    LOOP
        IF item.variant_id IS NOT NULL THEN
            needed_qty := item.quantity;
            FOR inv IN SELECT id, available FROM public.inventory_levels WHERE variant_id = item.variant_id ORDER BY available ASC FOR UPDATE
            LOOP
                EXIT WHEN needed_qty <= 0;
                UPDATE public.inventory_levels SET available = available + needed_qty WHERE id = inv.id;
                needed_qty := 0;
            END LOOP;
        ELSE
            UPDATE public.products SET stock = stock + item.quantity WHERE id = item.product_id;
        END IF;
    END LOOP;
END;
$$;

-- [RLS Policies]

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service: Full access users" ON public.users FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Users: Manage own profile" ON public.users FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service: Full access customers" ON public.customers FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Customer: View own profile" ON public.customers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Customer: Update own profile" ON public.customers FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service: Full access orders" ON public.orders FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Customer: View own orders" ON public.orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM customers c WHERE c.id = orders.customer_id AND c.user_id = auth.uid()));

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service: Full access order items" ON public.order_items FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Customer: View order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.id = order_items.order_id AND c.user_id = auth.uid()));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public: Subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT TO public WITH CHECK (TRUE);

