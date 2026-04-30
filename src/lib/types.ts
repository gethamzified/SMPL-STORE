// ==========================================
// SMPL STORE TYPES
// Auto-aligned with database schema
// ==========================================

// ==========================================
// CORE ENTITIES
// ==========================================

export type Product = {
  id: string
  title: string
  slug: string
  description?: string | null
  short_description?: string | null

  // Pricing
  price: number
  sale_price?: number | null
  compare_at_price?: number | null
  cost_per_item?: number | null

  // Media
  cover_image?: string | null
  images?: string[] // JSONB array in DB

  // Inventory
  sku?: string | null
  barcode?: string | null
  stock?: number
  track_inventory?: boolean
  allow_backorder?: boolean
  weight?: number | null
  weight_unit?: string

  // Organization
  tags?: string[]
  vendor?: string | null
  product_type?: string | null

  // Status
  status?: 'draft' | 'active' | 'archived'
  is_featured?: boolean

  // Variant Configuration (Clothing-focused)
  enable_color_variants?: boolean
  enable_size_variants?: boolean
  available_colors?: string[]
  available_sizes?: string[]

  // SEO
  seo_title?: string | null
  seo_description?: string | null

  // Metadata
  metadata?: Record<string, unknown>

  // Timestamps
  created_at?: string
  updated_at?: string
  published_at?: string | null

  // Review Stats (computed fields for display)
  review_count?: number
  average_rating?: number

  // Relations (when joined)
  variants?: ProductVariant[]
  options?: ProductOption[]
  reviews?: Review[]
}


export type ProductVariant = {
  id: string
  product_id: string
  title?: string | null

  // Clothing-specific fields
  color?: string | null
  size?: string | null
  status?: 'active' | 'disabled'

  // Legacy option fields (for backward compatibility)
  option1_name?: string | null
  option1_value?: string | null
  option2_name?: string | null
  option2_value?: string | null
  option3_name?: string | null
  option3_value?: string | null

  // Pricing
  price?: number | null
  sale_price?: number | null

  // Inventory
  sku?: string | null
  barcode?: string | null
  stock?: number
  inventory_quantity?: number // Legacy alias for stock

  image_url?: string | null
  position?: number

  created_at?: string
  updated_at?: string
}

export type ProductOption = {
  id: string
  product_id: string
  name: string
  position: number
  values: string[]
  created_at?: string
}



// ==========================================
// CUSTOMERS & AUTH
// ==========================================

export type Customer = {
  id: string
  user_id?: string | null
  email: string
  first_name?: string | null
  last_name?: string | null
  phone?: string | null

  // Single Address Fields
  address1?: string | null
  address2?: string | null
  city?: string | null
  province?: string | null
  zip?: string | null
  country?: string | null
  country_code?: string | null

  total_spent: number
  total_orders: number

  accepts_marketing: boolean
  marketing_updated_at?: string | null

  notes?: string | null
  tags?: string[]

  metadata?: Record<string, unknown>

  created_at?: string
  updated_at?: string

  // Relations
  orders?: Order[]
}

// ==========================================
// ORDERS
// ==========================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'partially_refunded' | 'refunded' | 'voided' | 'failed' | 'pending_verification' | 'cod_pending' | 'proof_submitted'
export type FulfillmentStatus = 'unfulfilled' | 'partial' | 'fulfilled'
export type PaymentMethodType = 'COD' | 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'card'

export type Order = {
  id: string
  order_number: number

  customer_id?: string | null
  email: string
  phone?: string | null

  status: OrderStatus
  payment_status: PaymentStatus
  fulfillment_status: FulfillmentStatus

  currency: string
  subtotal: number
  discount_total: number
  shipping_total: number
  tax_total: number
  total: number

  shipping_address?: OrderAddress | null
  billing_address?: OrderAddress | null

  tracking_number?: string | null
  tracking_url?: string | null
  shipped_at?: string | null
  delivered_at?: string | null

  payment_method?: PaymentMethodType | null
  payment_proof_url?: string | null
  transaction_id?: string | null
  payment_reference?: string | null

  discount_codes?: DiscountApplication[]

  customer_note?: string | null
  internal_note?: string | null
  admin_message?: string | null

  source: string

  created_at: string
  updated_at: string
  cancelled_at?: string | null
  closed_at?: string | null

  // Relations
  items?: OrderItem[]
  customer?: Customer
}

export type OrderAddress = {
  first_name?: string
  last_name?: string
  company?: string
  address1: string
  address2?: string
  city: string
  province?: string
  province_code?: string
  country: string
  country_code: string
  zip: string
  phone?: string
}

export type OrderItem = {
  id: string
  order_id: string

  product_id?: string | null
  variant_id?: string | null

  title: string
  variant_title?: string | null
  sku?: string | null
  image_url?: string | null

  quantity: number
  unit_price: number
  discount_amount: number
  total_price: number

  fulfilled_quantity: number
  requires_shipping: boolean

  properties?: Record<string, unknown>

  created_at?: string
}

export type DiscountApplication = {
  code: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
  amount: number
}

// ==========================================
// REVIEWS
// ==========================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'spam'

export type Review = {
  id: string
  product_id: string
  customer_id?: string | null
  order_id?: string | null
  verified_order_item_id?: string | null

  rating: number
  title?: string | null
  content?: string | null

  reviewer_name?: string | null
  reviewer_email?: string | null

  status: ReviewStatus
  is_verified_purchase: boolean

  helpful_count: number

  admin_response?: string | null
  admin_response_at?: string | null

  created_at: string
  updated_at: string
}

// ==========================================
// DISCOUNTS
// ==========================================

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
export type DiscountAppliesTo = 'all' | 'products'

export type Discount = {
  id: string
  code: string
  title?: string | null

  type: DiscountType
  value: number

  minimum_purchase: number
  minimum_quantity: number

  applies_to: DiscountAppliesTo
  applicable_ids?: string[]

  exclude_sale_items: boolean

  usage_limit?: number | null
  usage_limit_per_customer?: number | null
  usage_count: number

  starts_at: string
  ends_at?: string | null
  is_active: boolean

  can_combine: boolean

  created_at: string
  updated_at: string
}

// ==========================================
// CART
// ==========================================

export type Cart = {
  id: string
  customer_id?: string | null
  session_id?: string | null

  currency: string
  discount_code?: string | null

  created_at: string
  updated_at: string
  expires_at: string

  items?: CartItem[]
}

export type CartItem = {
  id: string
  cart_id: string
  product_id: string
  variant_id?: string | null
  quantity: number
  properties?: Record<string, unknown>

  created_at: string
  updated_at: string

  // Expanded fields
  product?: Product
  variant?: ProductVariant
}

// Client-side cart item (for local storage)
export type LocalCartItem = {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  slug: string
  variant_id?: string
}

export type CartValidationItem = {
  id: string; // Composite ID (productId-variantId or just productId)
  productId?: string;
  variantId?: string;
  quantity: number;
  currentPrice: number;
  slug: string;
  name: string;
  image: string;
  size?: string;
  color?: string;
}

// ==========================================
// WISHLIST
// ==========================================

export type WishlistItem = {
  id: string
  customer_id: string
  product_id: string
  variant_id?: string | null
  created_at: string

  product?: Product
  variant?: ProductVariant
}

// ==========================================
// CMS & CONTENT
// ==========================================

export type Page = {
  id: string
  title: string
  slug: string
  content?: string | null
  sections: PageSection[]
  template: string
  is_published: boolean
  seo_title?: string | null
  seo_description?: string | null
  created_at: string
  updated_at: string
}

export type PageSection = {
  id: string
  type: string
  settings: Record<string, unknown>
  blocks?: PageBlock[]
}

export type PageBlock = {
  id: string
  type: string
  settings: Record<string, unknown>
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  featured_image?: string | null
  author_id?: string | null
  author_name?: string | null
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  seo_title?: string | null
  seo_description?: string | null
  published_at?: string | null
  created_at: string
  updated_at: string
}

export type NavigationMenu = {
  id: string
  handle: string
  title: string
  items: MenuItem[]
  created_at: string
  updated_at: string
}

export type MenuItem = {
  id?: string
  label: string
  url: string
  children?: MenuItem[]
}

// ==========================================
// SITE CONFIG
// ==========================================

export type BrandConfig = {
  name: string
  tagline?: string
  announcement?: string
  showAnnouncement?: boolean
  logoUrl?: string
}

// Hero section config (supports single image)
export type HeroConfig = {
  // Single image
  heading?: string;
  subheading?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  overlayOpacity?: number;
  mobileImage?: string;
}

export type ThemeConfig = {
  mode: 'light' | 'dark'
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  foregroundColor: string
  font: string
  borderRadius: string
}

export type SocialConfig = {
  instagram?: string
  twitter?: string
  facebook?: string
  tiktok?: string
  youtube?: string
}

export type StoreConfig = {
  currency: string
  currencySymbol: string
  taxRate: number
  taxIncluded: boolean
}

// Benefits strip items (admin-controlled)
export type BenefitItem = {
  icon: 'truck' | 'rotate' | 'shield' | 'headphones' | 'star' | 'heart' | 'gift' | 'clock'
  text: string
}

export type BenefitsConfig = {
  enabled: boolean
  items: BenefitItem[]
}

// Footer configuration
export type FooterConfig = {
  tagline?: string
  columns: {
    title: string
    handle?: string // Reference navigation_menus handle, OR use links below
    links?: { label: string; url: string }[]
  }[]
  showSocial: boolean
  copyright?: string
}

// Homepage sections ordering
export type HomepageSectionType =
  | 'hero'
  | 'featured-products'
  | 'outlook'
  | 'benefits'
  | 'news'
  | 'newsletter'
  | 'custom'

export type HomepageSection = {
  id: string
  type: HomepageSectionType
  enabled: boolean
  order: number
  config?: Record<string, unknown>
  content?: {
    title?: string
    description?: string
    image?: string
    items?: any[]
    [key: string]: any
  }
}

export type HomepageConfig = {
  sections: HomepageSection[]
}

// Global Discount Popup Config
export type GlobalDiscountConfig = {
  enabled: boolean
  title: string
  percentage: number
  imageUrl: string
  delaySeconds: number
  showOncePerSession: boolean
}

// ==========================================
// SHIPPING
// ==========================================


export type ShippingZone = {
  id: string
  name: string
  countries: string[]
  is_active: boolean
  created_at: string

  rates?: ShippingRate[]
}

export type ShippingRate = {
  id: string
  zone_id: string
  name: string
  description?: string | null

  rate_type: 'flat' | 'weight_based' | 'price_based' | 'free'
  price: number

  min_order_amount?: number | null
  max_order_amount?: number | null
  min_weight?: number | null
  max_weight?: number | null

  min_delivery_days?: number | null
  max_delivery_days?: number | null

  is_active: boolean
  created_at: string
}

// ==========================================
// API RESPONSES
// ==========================================

export type ApiResponse<T> = {
  data?: T
  error?: string
  message?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ==========================================
// FORM INPUTS
// ==========================================

export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type UpdateProductInput = Partial<CreateProductInput> & { id: string }

export type CreateOrderInput = {
  email: string
  phone?: string
  items: {
    product_id: string
    variant_id?: string
    quantity: number
  }[]
  shipping_address: OrderAddress
  billing_address?: OrderAddress
  customer_note?: string
  discount_code?: string
  shipping_method?: 'standard' | 'express'
  payment_method?: PaymentMethodType
  payment_proof_url?: string | null
  transaction_id?: string | null
  payment_proof?: Record<string, unknown> | null
}

export type CreateReviewInput = {
  product_id: string
  rating: number
  title?: string
  content?: string
  reviewer_name?: string
  reviewer_email?: string
}
