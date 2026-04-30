-- ==========================================
-- 05. ORDERS & COMMERCE (Routes: /checkout, /admin/orders)
-- Run this sixth
-- ==========================================

-- Orders Table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number SERIAL UNIQUE,
  
  -- Customer Info (nullable for guest orders)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Order Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'voided', 'failed')),
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
  
  -- Financial Breakdown
  currency TEXT DEFAULT 'PKR',
  subtotal NUMERIC(10,2) NOT NULL,
  discount_total NUMERIC(10,2) DEFAULT 0,
  shipping_total NUMERIC(10,2) DEFAULT 0,
  tax_total NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  
  -- Address Snapshots (stored as JSONB for history)
  shipping_address JSONB,
  billing_address JSONB,
  
  -- Fulfillment Details
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Applied Discounts
  discount_codes JSONB DEFAULT '[]',
  
  -- Notes & Meta
  customer_note TEXT,
  internal_note TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  source TEXT DEFAULT 'web',
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  cancelled_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Order Line Items
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Product References (can be NULL if product deleted)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Product Info Snapshot (for historical accuracy)
  title TEXT NOT NULL,
  variant_title TEXT,
  sku TEXT,
  image_url TEXT,
  
  -- Pricing & Quantity
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  
  -- Fulfillment
  fulfilled_quantity INTEGER DEFAULT 0,
  requires_shipping BOOLEAN DEFAULT true,
  
  -- Custom Properties (e.g., engraving text)
  properties JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Auto-update Order Timestamps
CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Customer Metrics Update Function
CREATE OR REPLACE FUNCTION update_customer_order_metrics()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update customer metrics when order is paid
CREATE TRIGGER order_update_customer_metrics
AFTER INSERT OR UPDATE OF payment_status ON orders
FOR EACH ROW
WHEN (NEW.payment_status = 'paid')
EXECUTE FUNCTION update_customer_order_metrics();

SELECT 'Orders & Commerce tables ready!' as status;
