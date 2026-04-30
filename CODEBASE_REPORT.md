# SMPL — Complete Codebase Architecture Report

> **Generated:** February 9, 2026  
> **Framework:** Next.js 16 (App Router) · React 19 · TypeScript 5.8  
> **Database:** Supabase (PostgreSQL) with custom JWT auth  
> **Styling:** Tailwind CSS 3.4 + Radix UI + shadcn/ui  
> **Deployment Target:** Production e-commerce store for pakistani streetwear brand

---

## Table of Contents

1. [Tech Stack & Dependencies](#1-tech-stack--dependencies)
2. [Project Structure Overview](#2-project-structure-overview)
3. [Routing Architecture](#3-routing-architecture)
4. [API Routes](#4-api-routes)
5. [Server Actions](#5-server-actions)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Component Inventory](#7-component-inventory)
8. [Context Providers & State Management](#8-context-providers--state-management)
9. [Services Layer (Backend Logic)](#9-services-layer-backend-logic)
10. [Client-Side API Layer](#10-client-side-api-layer)
11. [Authentication System](#11-authentication-system)
12. [Admin Panel](#12-admin-panel)
13. [Database Schema](#13-database-schema)
14. [Middleware](#14-middleware)
15. [Configuration & Theming](#15-configuration--theming)
16. [Email System](#16-email-system)
17. [Image & Media Handling](#17-image--media-handling)
18. [Third-Party Libraries](#18-third-party-libraries)
19. [Known Issues & Schema Drift](#19-known-issues--schema-drift)

---

## 1. Tech Stack & Dependencies

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.1 | App Router framework (RSC, Server Actions) |
| React | 19.2.3 | UI library |
| TypeScript | 5.8.3 | Type safety |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Supabase | 2.89.0 | PostgreSQL database + storage + auth |

### Key Libraries
| Library | Purpose |
|---|---|
| `@tanstack/react-query` | Client-side server state (user session, wishlist) |
| `@tanstack/react-table` | Admin data tables (products, orders, collections) |
| `framer-motion` / `motion` | Animations (both installed — potential duplication) |
| `react-hook-form` + `zod` | Form handling + validation |
| `jose` | JWT creation/verification for custom auth |
| `nodemailer` | Transactional emails (OTP, order confirmation) |
| `sharp` | Server-side image optimization |
| `recharts` | Admin analytics charts |
| `embla-carousel-react` | Carousels (hero, product gallery) |
| `swiper` | Additional carousel (potential duplication with embla) |
| `lenis` | Smooth scrolling |
| `@dnd-kit/*` | Drag-and-drop (admin: homepage builder, menu builder) |
| `react-easy-crop` | Image cropping in admin |
| `cmdk` | Command palette (admin ⌘K search) |
| `vaul` | Drawer component |
| `sonner` | Toast notifications (alongside Radix toast — duplication) |
| `date-fns` | Date formatting |
| `input-otp` | OTP input component |

### UI Component System
- **shadcn/ui** (Radix primitives): 50+ UI components in `src/components/ui/`
- Components include: Accordion, Alert Dialog, Badge, Button, Calendar, Card, Carousel, Chart, Checkbox, Command, Dialog, Drawer, Dropdown Menu, Form, Input, Label, Navigation Menu, Pagination, Popover, Progress, Radio Group, Select, Sheet, Sidebar, Skeleton, Slider, Switch, Table, Tabs, Textarea, Toast, Toggle, Tooltip

---

## 2. Project Structure Overview

```
SMPL/
├── src/
│   ├── app/                    # Next.js App Router (pages + API routes)
│   │   ├── (store)/            # Public storefront (route group)
│   │   ├── admin/              # Admin panel (protected)
│   │   ├── api/                # REST API endpoints
│   │   ├── auth/               # Auth callback routes
│   │   ├── login/              # Login page
│   │   ├── register/           # Register page
│   │   ├── actions/            # Page-level server actions (theme)
│   │   ├── layout.tsx          # Root layout (fonts, themes, providers)
│   │   ├── globals.css         # Global styles
│   │   ├── sitemap.ts          # Dynamic sitemap generation
│   │   ├── loading.tsx         # Global loading skeleton
│   │   └── not-found.tsx       # 404 page
│   │
│   ├── components/             # Reusable React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── layout/             # Navbar, Footer, Providers, etc.
│   │   ├── sections/           # Homepage sections (Hero, Featured, etc.)
│   │   ├── product/            # Product display components
│   │   ├── checkout/           # Checkout flow components
│   │   ├── cart/               # Cart components
│   │   ├── collection/         # Collection display components
│   │   ├── shop/               # Shop page components
│   │   ├── orders/             # Order action components
│   │   ├── account/            # Account page components
│   │   ├── animations/         # Animation wrappers
│   │   ├── skeletons/          # Loading skeletons
│   │   └── ui/                 # shadcn/ui primitives (50+ files)
│   │
│   ├── context/                # React Context providers
│   │   ├── CartContext.tsx      # Client-side cart (localStorage)
│   │   ├── UserAuthContext.tsx  # User authentication state
│   │   ├── WishlistContext.tsx  # Wishlist management
│   │   ├── StoreConfigContext.tsx # Store config (currency, theme)
│   │   └── QuickViewContext.tsx # Product quick view modal
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-media-query.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── lib/                    # Core utilities & business logic
│   │   ├── api/                # Client-side API functions
│   │   ├── logic/              # Business logic (pricing, variants)
│   │   ├── supabase/           # Supabase client initialization
│   │   ├── validations/        # Zod schemas
│   │   ├── validators/         # Additional validators
│   │   ├── email-templates/    # HTML email templates
│   │   ├── types.ts            # TypeScript types (707 lines)
│   │   ├── auth.ts             # JWT auth helpers
│   │   ├── utils.ts            # General utilities
│   │   ├── fonts.ts            # Font configuration
│   │   ├── theme.ts            # Theme utilities
│   │   ├── home-data.ts        # Homepage data fetching
│   │   ├── image-compressor.ts # Client-side image compression
│   │   ├── image-utils.ts      # Image utilities
│   │   ├── image.worker.ts     # Web worker for images
│   │   ├── crop-image.ts       # Image cropping logic
│   │   └── nodemailer.ts       # SMTP transporter setup
│   │
│   ├── services/               # Server-side service layer
│   │   ├── config.ts           # StoreConfigService (cached)
│   │   ├── orders.ts           # OrderService (create, update, cancel)
│   │   ├── products.ts         # ProductService (CRUD, variants)
│   │   ├── stats.ts            # StatsService (dashboard analytics)
│   │   ├── email.ts            # EmailService (OTP, order emails)
│   │   └── errors.ts           # AppError class
│   │
│   ├── actions/                # Top-level server actions
│   │   ├── order.ts            # createOrderAction
│   │   ├── stock.ts            # checkVariantStock
│   │   └── config.ts           # updateStoreConfigAction, uploadSiteAsset
│   │
│   ├── middleware.ts           # Admin auth + Supabase session refresh
│   └── assets/                 # Static assets
│
├── database/                   # SQL schema & migrations
│   ├── schema.sql              # Full base schema
│   ├── migrations/             # Numbered migration files
│   └── ARCHIVE/                # Archived/superseded SQL scripts
│
├── supabase/
│   └── migrations/             # Supabase CLI migrations
│
├── public/                     # Static files
│   ├── robots.txt
│   └── images/
│
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

---

## 3. Routing Architecture

### Store Routes (Public — `(store)` route group)

| Route | Page File | Rendering | Description |
|---|---|---|---|
| `/` | `(store)/page.tsx` | **SSR** (revalidate: 3600s) | Homepage with dynamic sections |
| `/shop` | `(store)/shop/page.tsx` | SSR | Shop page with search/filters |
| `/product/[slug]` | `(store)/product/[slug]/page.tsx` | SSR (dynamic) | Product detail page |
| `/collection/[slug]` | `(store)/collection/[slug]/page.tsx` | SSR (dynamic) | Collection product grid |
| `/checkout` | `(store)/checkout/page.tsx` | SSR | Checkout wizard |
| `/account` | `(store)/account/page.tsx` | SSR (protected) | Account dashboard |
| `/account/orders` | `(store)/account/orders/page.tsx` | SSR | Order history list |
| `/account/orders/[id]` | `(store)/account/orders/[id]/page.tsx` | SSR | Order detail |
| `/account/profile` | `(store)/account/profile/page.tsx` | SSR | Profile settings |
| `/account/wishlist` | `(store)/account/wishlist/page.tsx` | SSR | Saved wishlist items |
| `/about` | `(store)/about/page.tsx` | SSR | About page |
| `/contact` | `(store)/contact/page.tsx` | SSR | Contact page |
| `/careers` | `(store)/careers/page.tsx` | SSR | Careers page |
| `/news` | `(store)/news/page.tsx` | SSR | Blog/news list |
| `/news/[slug]` | `(store)/news/[slug]/page.tsx` | SSR | Blog post detail |
| `/privacy` | `(store)/privacy/page.tsx` | SSR | Privacy policy |
| `/terms` | `(store)/terms/page.tsx` | SSR | Terms of service |
| `/cookies` | `(store)/cookies/page.tsx` | SSR | Cookie policy |

### Auth Routes

| Route | Page File | Description |
|---|---|---|
| `/login` | `login/page.tsx` | Customer login (OTP-based) |
| `/register` | `register/page.tsx` | Customer registration |
| `/auth/callback` | `auth/callback/` | OAuth/auth callback handler |

### Admin Routes (Protected — requires `admin_access_token` cookie)

| Route | Page File | Description |
|---|---|---|
| `/admin/login` | `admin/login/page.tsx` | Admin login page |
| `/admin` | `admin/(dashboard)/page.tsx` | Dashboard (stats, revenue, low stock) |
| `/admin/products` | `admin/(dashboard)/products/page.tsx` | Product list table |
| `/admin/products/new` | `admin/(dashboard)/products/new/page.tsx` | Create new product |
| `/admin/products/[id]` | `admin/(dashboard)/products/[id]/page.tsx` | Edit product |
| `/admin/orders` | `admin/(dashboard)/orders/page.tsx` | Orders list table |
| `/admin/orders/[id]` | `admin/(dashboard)/orders/[id]/page.tsx` | Order detail / management |
| `/admin/collections` | `admin/(dashboard)/collections/page.tsx` | Collections list |
| `/admin/collections/new` | `admin/(dashboard)/collections/new/page.tsx` | Create collection |
| `/admin/collections/[id]` | `admin/(dashboard)/collections/[id]/page.tsx` | Edit collection |
| `/admin/customers` | `admin/(dashboard)/customers/page.tsx` | Customer list |
| `/admin/analytics` | `admin/(dashboard)/analytics/page.tsx` | Analytics dashboard |
| `/admin/discount` | `admin/(dashboard)/discount/page.tsx` | Discount code management |
| `/admin/blog` | `admin/(dashboard)/blog/page.tsx` | Blog post list |
| `/admin/blog/[id]` | `admin/(dashboard)/blog/[id]/page.tsx` | Blog post editor |
| `/admin/reviews` | `admin/(dashboard)/reviews/page.tsx` | Review moderation |
| `/admin/settings` | `admin/(dashboard)/settings/page.tsx` | Store settings |
| `/admin/navigation` | `admin/(dashboard)/navigation/page.tsx` | Navigation menu list |
| `/admin/navigation/[id]` | `admin/(dashboard)/navigation/[id]/page.tsx` | Menu builder |
| `/admin/pages` | `admin/(dashboard)/pages/page.tsx` | CMS pages list |
| `/admin/pages/[id]` | `admin/(dashboard)/pages/[id]/page.tsx` | Page builder |
| `/admin/theme` | `admin/(dashboard)/theme/page.tsx` | Theme customization |
| `/admin/design/homepage` | `admin/(dashboard)/design/homepage/page.tsx` | Homepage section builder |
| `/admin/design/navigation` | `admin/(dashboard)/design/navigation/page.tsx` | Navigation designer |

---

## 4. API Routes

All API routes are under `src/app/api/`:

| Endpoint | Method(s) | File | Description |
|---|---|---|---|
| `/api/auth/me` | GET | `api/auth/me/route.ts` | Get current user session from JWT cookie |
| `/api/auth/send-otp` | POST | `api/auth/send-otp/route.ts` | Send OTP to email |
| `/api/auth/verify-otp` | POST | `api/auth/verify-otp/route.ts` | Verify OTP, issue JWT |
| `/api/auth/signout` | POST | `api/auth/signout/route.ts` | Clear auth cookie |
| `/api/cart` | GET/POST/PUT/DELETE | `api/cart/route.ts` | Cart CRUD operations |
| `/api/orders` | GET/POST | `api/orders/route.ts` | List/create orders |
| `/api/orders/[id]` | GET/PATCH | `api/orders/[id]/route.ts` | Get/update specific order |
| `/api/upload/payment-proof` | POST | `api/upload/payment-proof/route.ts` | Upload payment proof image |

---

## 5. Server Actions

### Top-Level Actions (`src/actions/`)

| Action | File | Description |
|---|---|---|
| `createOrderAction` | `actions/order.ts` | Creates order via OrderService |
| `checkVariantStock` | `actions/stock.ts` | Checks `inventory_levels` for variant availability |
| `updateStoreConfigAction` | `actions/config.ts` | Updates `site_config` key-value pairs |
| `uploadSiteAsset` | `actions/config.ts` | Uploads to `site-assets` storage bucket |

### Admin Page-Level Actions

| Action File | Description |
|---|---|
| `admin/(dashboard)/products/actions.ts` | Product CRUD operations |
| `admin/(dashboard)/orders/actions.ts` | Order status updates, payment verification |
| `admin/(dashboard)/collections/actions.ts` | Collection CRUD |
| `admin/(dashboard)/settings/actions.ts` | Store settings updates |
| `admin/(dashboard)/discount/actions.ts` | Discount code CRUD |
| `admin/(dashboard)/theme/actions.ts` | Theme configuration |
| `admin/(dashboard)/navigation/actions.ts` | Navigation menu CRUD |
| `admin/(dashboard)/pages/actions.ts` | CMS page CRUD |
| `admin/(dashboard)/design/homepage/actions.ts` | Homepage layout builder |
| `(store)/account/actions.ts` | Customer profile updates |
| `login/actions.ts` | Login form handling |
| `app/actions/theme.ts` | Theme switching action |

---

## 6. Frontend Architecture

### Layout Hierarchy

```
RootLayout (src/app/layout.tsx)
├── Loads theme from cookie (SSR) → injects CSS variables
├── Loads StoreConfig via StoreConfigService (cached)
├── Wraps children in <Providers> component
│
├── (store)/layout.tsx — Store Layout
│   ├── Footer (server-rendered with config)
│   └── Suspense boundary with FooterSkeleton
│
├── admin/(dashboard)/layout.tsx — Admin Layout
│   ├── SidebarProvider + AdminSidebar
│   ├── Top Bar (breadcrumbs, search, notifications)
│   ├── CommandPalette (⌘K)
│   └── Main content area
│
└── login/ & register/ — Standalone pages (no store layout)
```

### Provider Nesting Order

```
QueryClientProvider (React Query)
  └── StoreConfigProvider (currency, theme config)
      └── UserAuthProvider (user session via /api/auth/me)
          └── CartProvider (localStorage cart + deferred validation)
              └── WishlistProvider (API-backed, auth-dependent)
                  └── QuickViewProvider (product quick view modal)
                      └── TooltipProvider
                          └── {children}
                          └── Toaster (Radix)
                          └── Sonner (duplicate toast system)
                          └── DiscountPopup
```

### Homepage Sections (Dynamic, Admin-Configurable)

The homepage renders sections based on `site_config.homepage_layout` order:

| Section Component | Type Key | Description |
|---|---|---|
| `HeroSection` / `HeroCarousel` | `hero` | Hero banner with carousel slides |
| `TopCollectionStrip` | `categories` | Category/collection navigation strip |
| `ProductGridSection` | `featured-products` | Featured products grid |
| `OutlookSection` | `outlook` | Lookbook/editorial section |
| `TrustBar` | `benefits` | Benefits/trust strip (shipping, returns, etc.) |
| `NewsSection` | `news` | Blog posts / news articles |
| `NewsletterForm` | `newsletter` | Email subscription form |
| `FavoritesSection` | (standalone) | Favorited/trending products |
| `Featuring` | (standalone) | Featured collections showcase |
| `ReviewsSection` | (standalone) | Customer reviews |
| `StyleGallery` | (standalone) | Instagram-style image gallery |
| `CollectionShowcase` | (standalone) | Collection showcase with carousel |

---

## 7. Component Inventory

### Layout Components (`src/components/layout/` — 16 files)

| Component | Type | Description |
|---|---|---|
| `Navbar` | Client | Main navigation bar |
| `StoreHeader` | Server | Combined header with announcement + navbar |
| `AnnouncementBar` | Client | Top announcement strip |
| `Footer` | Server | Site footer with columns |
| `CartSheet` | Client | Slide-out cart drawer |
| `MobileMenuOverlay` | Client | Mobile navigation overlay |
| `NavLink` | Client | Navigation link with active state |
| `SearchModal` | Client | Full-screen search modal |
| `ScrollToTopButton` | Client | Floating scroll-to-top |
| `SmoothScroll` | Client | Lenis smooth scroll wrapper |
| `StickySection` | Client | Sticky scroll section |
| `ThemeSwitcher` | Client | Light/dark mode toggle |
| `NewsletterForm` | Client | Email newsletter subscription |
| `DiscountPopup` | Client | Global discount popup modal |
| `WhatsAppButton` | Client | Floating WhatsApp CTA |
| `Providers` | Client | All context providers wrapper |

### Product Components (`src/components/product/` — 12 files)

| Component | Type | Description |
|---|---|---|
| `ProductCard` | Client | Product card (grid item) |
| `ProductDetail` | Mixed | Full product detail page |
| `ProductFeed` | Client | Product grid feed |
| `ProductGallery` | Client | Image gallery with thumbnails |
| `ProductInfo` | Client | Product details (price, variants, add to cart) |
| `ProductReviews` | Client | Reviews section with form |
| `ProductSkeleton` | Client | Loading skeleton for product card |
| `QuickViewModal` | Client | Quick view overlay |
| `RelatedProducts` | Server/Client | Related products section |
| `ReviewForm` | Client | Submit review form |
| `SizeGuideModal` | Client | Size guide popup |
| `StickyAddToCart` | Client | Sticky mobile add-to-cart bar |

### Checkout Components (`src/components/checkout/` — 6 files)

| Component | Description |
|---|---|
| `CheckoutWizard` | Multi-step checkout container |
| `CheckoutForm` | Main checkout form |
| `CheckoutProgress` | Step progress indicator |
| `payment-method-step` | Payment method selection |
| `payment-proof-dropzone` | Payment proof upload (bank transfer) |
| `shipping-method-step` | Shipping method selection |

### Collection Components (`src/components/collection/` — 7 files)

| Component | Description |
|---|---|
| `CollectionBrowser` | Collection browsing interface |
| `CollectionCard` | Collection card display |
| `CollectionShowcase` | Featured collection showcase |
| `CollectionShowcaseCarousel` | Carousel version of showcase |
| `CategoryGrid` | Category grid layout |
| `AsyncProductGrid` | Async-loaded product grid |
| `ProductGridClient` | Client-side product grid |

### Account Components (`src/components/account/` — 3 files)

| Component | Description |
|---|---|
| `AccountSettings` | Profile settings form |
| `AccountSidebar` | Account navigation sidebar |
| `OrderList` | User order history list |

### Order Components (`src/components/orders/` — 2 files)

| Component | Description |
|---|---|
| `OrderActions` | Order action buttons |
| `OrderCancelButton` | Cancel order button |

### Animation Components (`src/components/animations/` — 2 files)

| Component | Description |
|---|---|
| `FadeInView` | Fade-in on viewport enter |
| `ScrollReveal` | Scroll-triggered reveal |

### Skeleton Components (`src/components/skeletons/` — 3 files)

| Component | Description |
|---|---|
| `CollectionShowcaseSkeleton` | Collection showcase loading state |
| `FooterSkeleton` | Footer loading state |
| `ProductGridSkeleton` | Product grid loading state |

### Admin Components (`src/components/admin/` — 30+ files)

#### Core Admin UI
| Component | Description |
|---|---|
| `AdminSidebar` | Navigation sidebar with all admin routes |
| `AdminLayoutClient` | Client-side admin layout logic |
| `AdminBreadcrumbs` | Dynamic breadcrumb navigation |
| `CommandPalette` | ⌘K search across admin |
| `DeleteButton` | Reusable delete confirmation button |

#### Admin Dashboard (`admin/dashboard/`)
| Component | Description |
|---|---|
| `Overview` | Revenue chart (Recharts bar chart) |
| `RecentSales` | Latest order/sales list |
| `LowStockAlert` | Low stock warning cards |
| `DashboardProgress` | Store completion progress |

#### Admin Products (`admin/products/`)
| Component | Description |
|---|---|
| `ProductTableClient` | Products data table with search/filter |
| `MobileProductCard` | Mobile product card layout |
| `columns.tsx` | TanStack Table column definitions |
| `VariantConfigSection` | Variant (size/color) configuration UI |
| `VariantTable` | Variant inventory management table |

#### Admin Orders (`admin/orders/`)
| Component | Description |
|---|---|
| `OrderTableClient` | Orders data table |
| `MobileOrderCard` | Mobile order card |
| `columns.tsx` | Order table column definitions |
| `order-status-selector` | Order status dropdown |
| `payment-verification-card` | Payment proof verification UI |

#### Admin Collections (`admin/collections/`)
| Component | Description |
|---|---|
| `CollectionTableClient` | Collection data table |
| `MobileCollectionCard` | Mobile collection card |

#### Admin Content
| Component | Description |
|---|---|
| `BlogEditor` | Rich blog post editor |
| `MenuBuilder` | Drag-and-drop menu builder |
| `PageBuilder` | CMS page builder |
| `ReviewsTableClient` | Reviews moderation table |
| `StoreConfigForm` | Store settings form |
| `AnalyticsDashboard` | Analytics charts/stats |

#### Admin UI Utilities (`admin/ui/`)
| Component | Description |
|---|---|
| `data-table` | Generic data table wrapper |
| `ResponsiveDataTable` | Responsive table (mobile cards) |
| `ActionDrawer` | Slide-out action drawer |
| `CardSkeleton` | Admin card loading skeleton |
| `TableSkeleton` | Table loading skeleton |

### UI Primitives (`src/components/ui/` — 52 files)

Full shadcn/ui component library including: Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer, Dropdown Menu, Form, Hover Card, Image Cropper, Input OTP, Input, Label, Magnetic Button, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Text Reveal, Textarea, Toast, Toaster, Toggle, Toggle Group, Tooltip

---

## 8. Context Providers & State Management

### CartContext (Client-Side — localStorage)
- **File:** `src/context/CartContext.tsx`
- **State:** Cart items stored in `localStorage`
- **Features:** Add/remove/update items, cart count, cart total, cart open/close state
- **Validation:** Deferred cart validation against server (3s after mount to avoid LCP blocking)
- **Note:** This is a client-side only cart. The DB has `carts`/`cart_items` and `user_cart` tables but the app primarily uses localStorage.

### UserAuthContext (React Query + API)
- **File:** `src/context/UserAuthContext.tsx`
- **State:** User session via React Query polling `/api/auth/me`
- **Methods:** `sendOTP()`, `verifyOTP()`, `logout()`, `refreshUser()`
- **Auth Flow:** Passwordless OTP via email → JWT cookie

### WishlistContext (API-Backed)
- **File:** `src/context/WishlistContext.tsx`
- **State:** Wishlist items fetched from Supabase `wishlists` table
- **Methods:** `addItem()`, `removeItem()`, `toggleItem()`, `isInWishlist()`

### StoreConfigContext (SSR → Client)
- **File:** `src/context/StoreConfigContext.tsx`
- **State:** Store configuration (currency, theme, etc.)
- **Initialized:** Server-side via `StoreConfigService.getStoreConfig()`, passed to client via props

### QuickViewContext
- **File:** `src/context/QuickViewContext.tsx`
- **State:** Currently viewed product in quick-view modal
- **Methods:** `openQuickView(product)`, `closeQuickView()`

---

## 9. Services Layer (Backend Logic)

All services use `createAdminClient()` (Supabase service role key) to bypass RLS.

### StoreConfigService (`src/services/config.ts`)
- `getStoreConfig()` — Cached via `unstable_cache`, fetches all `site_config` rows + navigation menus, merges into typed config object
- `updateConfig(key, value)` — Updates specific config key
- Returns: brand, theme, navigation, footer, social, currency, hero, benefits, homepage layout, delivery settings, global discount

### OrderService (`src/services/orders.ts`)
- `createOrder(input)` — Full transactional order creation:
  1. Validates input + fetches product prices server-side
  2. Calculates pricing securely (ignores client prices)
  3. Applies discount codes if present
  4. Calculates shipping (standard/express + free threshold)
  5. Upserts customer record
  6. Inserts order + order items
  7. Deducts stock via DB
  8. Sends confirmation email
  9. Returns created order
- `updateOrderStatus()` — Status + payment status updates
- `cancelOrder()` — Cancels + restores stock

### ProductService (`src/services/products.ts`)
- `createProduct()` — Creates product + auto-generates variants
- `updateProduct()` — Updates product fields
- `deleteProduct()` — Soft/hard delete
- `getProduct()` / `getProducts()` — Query with joins to variants/options
- `createVariant()` / `updateVariant()` / `deleteVariant()` — Variant CRUD
- Uses `unstable_cache` for product queries

### StatsService (`src/services/stats.ts`)
- `getDashboardStats()` — Total revenue, orders, products, low stock count, monthly change %
- `getMonthlyRevenue()` — Monthly revenue breakdown for chart
- `getRecentSales()` — Latest paid orders
- `getLowStockProducts()` — Products with low inventory
- All cached via `unstable_cache`

### EmailService (`src/services/email.ts`)
- `sendOTP(email, otp)` — 6-digit OTP for passwordless login
- `sendOrderConfirmation(email, order)` — Order confirmation with details
- `sendOrderStatusUpdate(email, order, adminMessage)` — Status change notification
- Uses Nodemailer with SMTP

### AppError (`src/services/errors.ts`)
- Custom error class with status codes
- Static factories: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `internal()`

---

## 10. Client-Side API Layer

### `src/lib/api/` — Client-side functions (used in components)

| File | Exported Functions |
|---|---|
| `products.ts` | `createProduct`, `updateProduct`, `deleteProduct`, `getProducts`, `getProduct`, `createVariant`, `updateVariant`, `deleteVariant`, `validateCartItems` |
| `orders.ts` | `createOrder`, `updateOrderStatus`, `getOrders`, `getOrder`, `getCustomerOrders`, `cancelOrder` |
| `collections.ts` | `createCollection`, `updateCollection`, `deleteCollection`, `getCollections`, `getCollection` |
| `reviews.ts` | `createReview`, `getProductReviews`, `updateReviewStatus`, `respondToReview`, `deleteReview`, `getAllReviews`, `markReviewHelpful` |
| `customers.ts` | `getCustomer`, `createCustomer`, `updateCustomer`, `addAddress`, `deleteAddress`, `getOrCreateCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart`, `getWishlist`, `addToWishlist`, `removeFromWishlist` |
| `blog.ts` | Blog post CRUD |
| `newsletter.ts` | Newsletter subscription |

### `src/lib/logic/` — Business Logic

| File | Description |
|---|---|
| `product-logic.ts` | Price calculation (`calculateProductPrice`) — handles sale prices, variant pricing |
| `variant-generator.ts` | Auto-generates variant combinations from size/color options |

---

## 11. Authentication System

### Architecture: Custom Passwordless JWT Auth

The app uses a **custom authentication system** (NOT Supabase Auth) with passwordless OTP login:

```
User enters email → POST /api/auth/send-otp
  → Generates 6-digit OTP
  → Stores in `user_otps` table (10min expiry)
  → Sends via Nodemailer
  
User enters OTP → POST /api/auth/verify-otp
  → Validates OTP from `user_otps`
  → Upserts user in `users` table
  → Creates JWT token (via jose)
  → Sets `auth_token` HttpOnly cookie
  → Returns user profile

Session check → GET /api/auth/me
  → Reads `auth_token` cookie
  → Verifies JWT with `jose`
  → Fetches user from `users` table
  → Returns user profile or null

Logout → POST /api/auth/signout
  → Clears `auth_token` cookie
```

### Admin Authentication

Simple cookie-based protection:
- Admin login sets `admin_access_token=true` cookie
- Middleware checks this cookie for all `/admin/*` routes (except `/admin/login`)
- No role-based access control — single admin access

### Supabase Clients

| Client | File | Key Used | Purpose |
|---|---|---|---|
| Browser Client | `lib/supabase/client.ts` | Anon Key | Client components (limited) |
| Server Client | `lib/supabase/server.ts` | Anon Key | Server components (with RLS) |
| Admin Client | `lib/supabase/admin.ts` | Service Role Key | Bypass RLS (services, actions) |
| Middleware | `lib/supabase/middleware.ts` | Anon Key | Session refresh in middleware |

---

## 12. Admin Panel

### Layout Structure
- **Sidebar:** Collapsible navigation with all admin sections
- **Top Bar:** Breadcrumbs, search trigger (⌘K), notifications bell, "View Store" link
- **Command Palette:** ⌘K global search across products, orders, collections, pages
- **Background:** Light gray (`#F6F6F7`), white cards

### Admin Features

| Feature | Route | Key Components | Data Source |
|---|---|---|---|
| **Dashboard** | `/admin` | Overview chart, RecentSales, LowStockAlert | StatsService (cached) |
| **Products** | `/admin/products` | ProductTableClient, product-form, VariantConfigSection, VariantTable | ProductService |
| **Orders** | `/admin/orders` | OrderTableClient, order-status-selector, payment-verification-card | OrderService |
| **Collections** | `/admin/collections` | CollectionTableClient, collection-form | Direct Supabase |
| **Customers** | `/admin/customers` | Customer list | Direct Supabase |
| **Analytics** | `/admin/analytics` | AnalyticsDashboard (Recharts) | StatsService |
| **Discounts** | `/admin/discount` | discount-form | Direct Supabase |
| **Blog** | `/admin/blog` | BlogEditor | Direct Supabase |
| **Reviews** | `/admin/reviews` | ReviewsTableClient | Direct Supabase |
| **Settings** | `/admin/settings` | settings-form, StoreConfigForm | StoreConfigService |
| **Navigation** | `/admin/navigation` | MenuBuilder (DnD) | Direct Supabase |
| **Pages** | `/admin/pages` | PageBuilder | Direct Supabase |
| **Theme** | `/admin/theme` | Theme customization | site_config |
| **Homepage Design** | `/admin/design/homepage` | Section builder (DnD), hero carousel editor | site_config |

### Admin Data Tables
- Built with **@tanstack/react-table**
- `ResponsiveDataTable` component handles desktop table + mobile card views
- Column definitions in `columns.tsx` files per entity
- Features: sorting, filtering, pagination, search

---

## 13. Database Schema

### Tables (25 total)

| Table | Purpose | Row Count Estimate |
|---|---|---|
| `products` | Product catalog | Core |
| `product_variants` | Size/color variants per product | ~5x products |
| `product_options` | Option definitions (Size, Color values) | ~2x products |
| `inventory_levels` | Stock per variant per location | ~5x products |
| `inventory_locations` | Warehouse/store locations | Few |
| `collections` | Product categories/collections | ~10-50 |
| `orders` | Customer orders | Growing |
| `order_items` | Line items per order | ~3x orders |
| `customers` | Customer profiles | Growing |
| `users` | Auth users (custom JWT) | = customers |
| `user_otps` | OTP codes (10min TTL) | Transient |
| `reviews` | Product reviews | Growing |
| `discounts` | Coupon/discount codes | ~10-50 |
| `wishlists` | Customer wishlists | Growing |
| `carts` | Server-side carts (Supabase Auth) | Growing |
| `cart_items` | Cart line items | ~3x carts |
| `user_cart` | Simplified cart (custom auth) — **TO BE DROPPED** | — |
| `blog_posts` | Blog/news articles | ~10-50 |
| `pages` | CMS pages (builder) | ~5-20 |
| `navigation_menus` | Menu structures (JSON) | ~3-5 |
| `site_config` | Key-value store config | ~10-15 rows |
| `shipping_zones` | Shipping zones by country | Few |
| `shipping_rates` | Shipping rate tiers | ~5-10 |
| `customer_addresses` | Legacy address table (dropped) | — |
| `newsletter_subscribers` | Newsletter signups | Growing |

### Key Database Functions (RPC)

| Function | Purpose |
|---|---|
| `create_order(payload JSONB)` | Transactional order creation with stock locking |
| `decrement_stock(p_id, qty)` | Atomic stock decrease |
| `increment_stock(product_id, qty, variant_id)` | Stock restore (on cancellation) |
| `update_updated_at_column()` | Auto-updates `updated_at` trigger |
| `update_customer_order_metrics()` | Updates `customers.total_spent/total_orders` on paid order |

### Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `products` | Yes | Product images |
| `collections` | Yes | Collection images |
| `avatars` | Yes | Customer avatars |
| `payment-proofs` | Yes | Payment proof uploads |
| `site-assets` | Yes | Site assets (logo, hero images) |

### Entity Relationship Summary

```
collections ──1:N──> products
products ──1:N──> product_variants
products ──1:N──> product_options
product_variants ──1:N──> inventory_levels
inventory_locations ──1:N──> inventory_levels

users ──1:1──> customers
customers ──1:N──> orders
orders ──1:N──> order_items
order_items ──N:1──> products
order_items ──N:1──> product_variants

products ──1:N──> reviews
customers ──1:N──> reviews
orders ──1:N──> reviews

customers ──1:N──> wishlists
wishlists ──N:1──> products

customers ──1:N──> carts
carts ──1:N──> cart_items

site_config (key-value) ── drives ── all frontend configuration
navigation_menus ── drives ── header/footer navigation
pages ── CMS content
blog_posts ── news/blog content
discounts ── coupon logic
```

---

## 14. Middleware

**File:** `src/middleware.ts`

Two responsibilities:

1. **Admin Route Protection:**
   - All `/admin/*` routes (except `/admin/login`) require `admin_access_token=true` cookie
   - Redirects to `/admin/login` if cookie missing or invalid

2. **Supabase Session Refresh:**
   - Calls `updateSession()` from `@supabase/ssr` to keep Supabase auth session alive
   - Applies to all routes except static files

**Matcher:** Excludes `_next/static`, `_next/image`, `favicon.ico`, and image files.

---

## 15. Configuration & Theming

### Site Config (`site_config` table — key/value)

| Config Key | Content |
|---|---|
| `brand` | Name, tagline, announcement bar text, logo URL |
| `hero` | Hero carousel slides (images, headings, CTAs) |
| `theme` | Colors (primary, secondary, background, foreground), font, border radius, mode |
| `social` | Social media URLs (Instagram, Twitter, Facebook, TikTok, YouTube) |
| `currency` | Currency code + symbol (e.g., "PKR" / "Rs") |
| `homepage_layout` | Ordered array of homepage sections with enabled/disabled state |
| `footer` | Footer columns, tagline, social toggle, copyright |
| `benefits` | Benefits strip items (icon + text) |
| `global_discount` | Popup discount config (percentage, image, delay, show once) |
| `delivery` | Standard/express shipping prices, free threshold |
| `category_grid` | Category grid aspect ratio |

### Theme System
- CSS variables injected server-side from cookie OR `site_config`
- HSL color values for Tailwind `hsl(var(--primary))` pattern
- Font loaded dynamically from config (Helvetica, Manrope, Inter, Playfair, Space Mono)
- Dark/light mode via `next-themes`
- Admin can customize all theme values in `/admin/theme`

---

## 16. Email System

### Stack
- **Transport:** Nodemailer with SMTP (configured via env vars)
- **Templates:** HTML email templates in `src/lib/email-templates/`

### Email Types

| Template | Trigger | File |
|---|---|---|
| OTP Code | User login | `email-templates/otp.ts` |
| Order Confirmation | Order created | `email-templates/order-confirmation.ts` |
| Order Status Update | Admin updates status | `email-templates/order-status.ts` |

---

## 17. Image & Media Handling

### Upload Flow
1. Client compresses image via `image-compressor.ts` (uses Web Worker `image.worker.ts`)
2. Image cropped via `react-easy-crop` + `crop-image.ts`
3. Uploaded to Supabase Storage bucket
4. Served via Supabase CDN or Next.js Image Optimization

### Next.js Image Config
- **Formats:** AVIF, WebP
- **Remote patterns:** Supabase, Pexels, Unsplash, Framer
- **Cache TTL:** 1 year (31536000s)
- **Device sizes:** 400-2560px range
- **Server Actions body limit:** 64MB

---

## 18. Third-Party Libraries

### UI & Animation
| Library | Usage | Notes |
|---|---|---|
| Radix UI (18 packages) | Headless UI primitives | Foundation of shadcn/ui |
| Framer Motion | Section animations, page transitions | v12.23 |
| `motion` | Additional motion library | v12.25 — **DUPLICATE** of framer-motion |
| Embla Carousel | Product gallery, hero carousel | Primary carousel |
| Swiper | Additional carousel | **POTENTIAL DUPLICATE** with Embla |
| Lenis | Smooth scrolling | Global smooth scroll |
| `@dnd-kit` (4 packages) | Drag-and-drop | Admin builders (homepage, menu) |

### Data & Forms
| Library | Usage |
|---|---|
| React Query | Server state (user session, wishlist) |
| TanStack Table | Admin data tables |
| React Hook Form | All forms |
| Zod | Validation schemas |

### Charts & Visualization
| Library | Usage |
|---|---|
| Recharts | Admin analytics charts |

### Auth & Security
| Library | Usage |
|---|---|
| Jose | JWT signing/verification |
| `@supabase/ssr` | Supabase SSR helpers |

### Other
| Library | Usage |
|---|---|
| Sharp | Server-side image processing |
| Nodemailer | SMTP email |
| date-fns | Date formatting |
| cmdk | Command palette |
| vaul | Drawer |
| tailwind-merge | Tailwind class merging |
| class-variance-authority | Component variants |

---

## 19. Known Issues & Schema Drift

### Critical Observations

1. **Dual Cart System:** 
   - The app uses **localStorage** for the cart on the frontend (`CartContext`), but the database has TWO server-side cart systems: `carts`/`cart_items` (Supabase Auth era) and `user_cart` (custom auth). Neither server-side cart is actively used by the frontend — only localStorage.

2. **Dual Auth System:**
   - Supabase Auth (`auth.users`) still exists alongside custom JWT auth (`public.users`). The app has migrated to custom JWT but some RLS policies still reference `auth.uid()`.

3. **Inventory Source of Truth Conflict:**
   - Migrations aim to make `inventory_levels` the single source of truth, but `create_order` RPC still deducts from `product_variants.inventory_quantity` and `products.stock` — not from `inventory_levels`.

4. **Schema Dump vs Migrations:**
   - `schema_dump.sql` shows columns (`color`, `size`, `stock` on variants, `user_cart` table) that phased migrations should have dropped — suggesting not all migrations have been applied to production.

5. **Duplicate Libraries:**
   - `framer-motion` AND `motion` are both installed (motion is the new name for framer-motion v12+)
   - `embla-carousel-react` AND `swiper` — two carousel libraries
   - Radix `Toast` AND `Sonner` — two toast systems active simultaneously

6. **Cookie-Based Admin Auth:**
   - Admin access is protected only by a boolean cookie (`admin_access_token=true`). No real password, JWT, or role system — trivially spoofable.

7. **Service Role Key Exposure Risk:**
   - Almost all server-side operations use `createAdminClient()` (service role key) to bypass RLS. If any of these functions are accidentally exposed to the client, the entire database is compromised.

8. **Currency Inconsistency:**
   - Base schema defaults to `'PKR'`, schema dump shows `'USD'` — the actual currency is configured in `site_config` but DB defaults conflict.

9. **`unstable_cache` Usage:**
   - Multiple services use Next.js `unstable_cache` — this API may change/break in future Next.js versions.

10. **No Rate Limiting:**
    - OTP endpoints, order creation, and other API routes have no rate limiting — vulnerable to abuse.

---

## Summary Statistics

| Category | Count |
|---|---|
| **Total Route Pages** | ~35 |
| **API Endpoints** | 8 |
| **Server Actions** | ~15 |
| **React Components** | ~120+ |
| **Context Providers** | 5 |
| **Custom Hooks** | 3 |
| **Service Classes** | 5 |
| **Database Tables** | 25 |
| **Database Functions** | 5 |
| **Storage Buckets** | 5 |
| **TypeScript Types** | ~40+ (707 lines) |
| **UI Primitives (shadcn)** | 52 |
| **npm Dependencies** | ~40 production + ~10 dev |
| **Email Templates** | 3 |

---

*This report is intended to be shared with other AI agents for optimization planning. It covers the complete architecture from frontend to backend, database schema, authentication flow, admin panel features, and known issues.*
