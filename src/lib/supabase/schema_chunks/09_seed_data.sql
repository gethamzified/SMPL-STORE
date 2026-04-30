-- ==========================================
-- 09. SEED DATA (Default configuration)
-- Run this last
-- ==========================================

-- Default Site Configuration
INSERT INTO site_config (key, value) VALUES 
('brand', '{
  "name": "SMPL",
  "tagline": "Timeless Wardrobe, Everyday Power",
  "announcement": "Free shipping on orders over Rs. 10,000",
  "showAnnouncement": true
}'::jsonb),
('hero', '{
  "heading": "Winter Collection",
  "subheading": "Discover the new trends",
  "image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
  "ctaText": "Shop Now",
  "ctaLink": "/collection"
}'::jsonb),
('theme', '{
  "primaryColor": "#000000",
  "secondaryColor": "#ffffff",
  "backgroundColor": "#ffffff",
  "foregroundColor": "#000000",
  "font": "manrope",
  "borderRadius": "0.5rem"
}'::jsonb),
('social', '{
  "instagram": "",
  "twitter": "",
  "facebook": "",
  "tiktok": ""
}'::jsonb),
('store', '{
  "currency": "PKR",
  "currencySymbol": "$",
  "taxRate": 0,
  "taxIncluded": false
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Default Navigation Menus
INSERT INTO navigation_menus (handle, title, items) VALUES
('main-menu', 'Main Menu', '[
  {"label": "Collection", "url": "/collection"},
  {"label": "About", "url": "/about"},
  {"label": "Journal", "url": "/news"}
]'::jsonb),
('footer-menu', 'Footer Menu', '[
  {"label": "About Us", "url": "/about"},
  {"label": "Contact", "url": "/contact"},
  {"label": "Shipping", "url": "/shipping"},
  {"label": "Returns", "url": "/returns"}
]'::jsonb)
ON CONFLICT (handle) DO NOTHING;

-- Example Collection
INSERT INTO collections (title, slug, description, is_visible) VALUES
('Winter Collection', 'winter-collection', 'Discover our latest winter styles', true)
ON CONFLICT (slug) DO NOTHING;

-- Example Blog Post
INSERT INTO blog_posts (title, slug, content, status, published_at) VALUES
('Welcome to SMPL', 'welcome-to-smpl', 'Welcome to our new online store! We''re excited to share our curated collection of timeless pieces with you.', 'published', NOW())
ON CONFLICT (slug) DO NOTHING;

-- Example Page
INSERT INTO pages (title, slug, content, is_published) VALUES
('About Us', 'about', 'SMPL represents the intersection of timeless style and modern sensibility. Our carefully curated collections feature pieces that transcend seasonal trends.', true)
ON CONFLICT (slug) DO NOTHING;

SELECT 'Seed data inserted successfully!' as status;
