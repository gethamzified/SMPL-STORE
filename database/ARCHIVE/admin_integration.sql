-- 1. Navigation Menus Table
CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb, -- Array of {label, url, children}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for navigation_menus
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON navigation_menus
  FOR SELECT USING (true);

CREATE POLICY "Admin full access" ON navigation_menus
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'service_role' OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 2. Add sort_order to collections
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'collections' AND column_name = 'sort_order') THEN
        ALTER TABLE collections ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Seed Homepage Layout Config
INSERT INTO site_config (key, value)
VALUES 
('homepage_layout', '[
  {"id": "hero", "type": "hero", "enabled": true, "order": 0},
  {"id": "categories", "type": "categories", "enabled": true, "order": 1},
  {"id": "featured", "type": "featured-products", "enabled": true, "order": 2},
  {"id": "benefits", "type": "benefits", "enabled": true, "order": 3},
  {"id": "news", "type": "news", "enabled": true, "order": 4}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 4. Seed Main Menu if empty
INSERT INTO navigation_menus (handle, title, items)
VALUES 
('main-menu', 'Main Menu', '[
  {"label": "Collection", "url": "/collection"},
  {"label": "Product", "url": "/product"},
  {"label": "About", "url": "/about"},
  {"label": "Journal", "url": "/news"}
]'::jsonb)
ON CONFLICT (handle) DO NOTHING;
