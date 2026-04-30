# Admin Panel Integration Report: Homepage

This report outlines the current status of the homepage components, their dynamic capabilities, and what is required to fully connect them to the Admin Panel.

## 1. Current Status Overview
The homepage is built to be **dynamic-first**. Data fetching logic (`src/lib/theme.ts`) is designed to pull from Supabase (`site_config`, `collections`, `products`), falling back to code defaults only if database records are missing.

### Dynamic Components (Connected)
These components already fetch data from the database. To update them, you modify the corresponding tables or use existing Admin Forms.

| Component | Source of Truth | Admin Management |
| :--- | :--- | :--- |
| **Hero Section** | `site_config` (Key: `hero`) | **Partial**. Admin Settings has a basic config form, but `hero` JSON needs a dedicated UI. |
| **Brand Identity** | `site_config` (Key: `brand`) | **Yes**. `/admin/settings` allows changing Name, Tagline, Primary Color. |
| **Featured Products** | `products` table | **Yes**. Products marked `is_featured: true` in `/admin/products` automatically appear here. |
| **Category Grid** | `collections` table | **Partial**. Collections exist in DB, but a dedicated "Featured Collections" toggle or ordering UI is needed. |
| **Footer** | `site_config` (Key: `footer`) | **No**. Currently relies on defaults or raw JSON editing. |

---

## 2. Required Admin Features
To make the homepage fully controllable without code changes, the following Admin features need to be built:

### A. Homepage Builder (`/admin/design/homepage`)
Instead of hardcoding "Hero -> Categories -> Favorites", allow Admins to:
- **Reorder Sections**: Drag-and-drop ordering.
- **Toggle Visibility**: Turn sections on/off (e.g., hide "Benefits Strip" during sales).
- **Configure Stats**: Update `hero.heading`, `hero.image`, etc. via a GUI.

**Schema Requirement:**
- Update `site_config` to store a `homepage_layout` JSON array:
```json
[
  { "id": "hero", "type": "hero", "order": 0, "settings": { ... } },
  { "id": "categories", "type": "categories", "order": 1, "settings": { "limit": 4 } }
]
```

### B. Navigation Manager (`/admin/design/navigation`)
Currently, the Navbar links ("Collection", "About", etc.) are hardcoded in `Navbar.tsx` or `theme.ts` defaults.
- **Requirement**: Build a Menu Builder similar to Shopify.
- **Table**: `navigation_menus` (Handle, Title, JSON Items).

### C. CMS / Pages (`/admin/pages`)
The "Journal" (NewsSection) fetches from `blog_posts`, but there is no Admin UI to write/publish posts.
- **Requirement**: A rich-text editor for Blog Posts and Pages (About, Terms).

---

## 3. Immediate "Low-Hanging Fruit"
To improve control right now without a full builder:

1.  **Enhanced Settings Form**: Add a "Hero" tab to `/admin/settings` to edit the Heading and Image URL.
2.  **Collection Sorting**: Add a `sort_order` field to Collections in Admin to control their grid order.
3.  **Benefits Editor**: Add a simple form to edit the 4 benefits items (Icon + Text).

## 4. Technical Roadmap
1.  **Schema Update**: Ensure `site_config` can handle structured JSON for layout.
2.  **Admin UI**: Build the "Design" section in Admin Sidebar.
3.  **Frontend**: Update `page.tsx` to iterate over `layout_config` instead of hardcoded `StickySection` order.
