-- ==========================================
-- 06. CONTENT & CMS (Routes: /news, /about, admin settings)
-- Run this seventh
-- ==========================================

-- Blog Posts (for /news route)
CREATE TABLE blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  
  -- Author Info
  author_id UUID REFERENCES auth.users,
  author_name TEXT,
  
  -- Categories & Tags
  tags TEXT[] DEFAULT '{}',
  
  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Custom Pages (About, Contact, etc.)
CREATE TABLE pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  sections JSONB DEFAULT '[]', -- Page builder data
  template TEXT DEFAULT 'default',
  is_published BOOLEAN DEFAULT false,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Site Configuration (theme, brand, etc.)
CREATE TABLE site_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Navigation Menus (header/footer links)
CREATE TABLE navigation_menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  items JSONB DEFAULT '[]', -- Menu structure
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_blog_slug ON blog_posts(slug);
CREATE INDEX idx_blog_status ON blog_posts(status);
CREATE INDEX idx_blog_published ON blog_posts(published_at DESC);
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published);
CREATE INDEX idx_config_key ON site_config(key);
CREATE INDEX idx_menus_handle ON navigation_menus(handle);

-- Triggers
CREATE TRIGGER update_blog_posts_updated_at 
BEFORE UPDATE ON blog_posts 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at 
BEFORE UPDATE ON pages 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at 
BEFORE UPDATE ON site_config 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigation_menus_updated_at 
BEFORE UPDATE ON navigation_menus 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Content & CMS tables ready!' as status;
