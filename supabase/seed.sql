-- Idempotent Seed Data for SMPL
-- Ensures configuration and default collections exist without duplicating data.

-- 1. Seed Site Configuration
INSERT INTO public.site_config (key, value) 
VALUES (
  'homepage_layout', 
  '{
    "sections": [
      {"id": "hero-main", "type": "hero", "order": 1, "enabled": true, "content": {"heading": "A NEW ERA", "subheading": "BRUTALIST ARCHIVE", "ctaText": "DISCOVER", "ctaLink": "/collections/all"}},
      {"id": "collections", "type": "categories", "order": 2, "enabled": true},
      {"id": "featured", "type": "featured-products", "order": 3, "enabled": true, "content": {"title": "New Arrivals"}}
    ]
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Seed Default Collections
INSERT INTO public.collections (id, title, slug, description, is_visible, sort_order)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Summer Essentials', 'summer-essentials', 'Lightweight core garments for the season.', true, 1),
  ('22222222-2222-2222-2222-222222222222', 'Brutalist Tech', 'brutalist-tech', 'Technical fabrics meeting harsh lines.', true, 2),
  ('33333333-3333-3333-3333-333333333333', 'Capsule 01', 'capsule-01', 'The inaugural limited run.', true, 3)
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_visible = EXCLUDED.is_visible,
  sort_order = EXCLUDED.sort_order;
