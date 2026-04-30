export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          properties: Json | null
          quantity: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          properties?: Json | null
          quantity?: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          properties?: Json | null
          quantity?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          currency: string | null
          customer_id: string | null
          discount_code: string | null
          expires_at: string | null
          id: string
          session_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          discount_code?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          discount_code?: string | null
          expires_at?: string | null
          id?: string
          session_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_visible: boolean | null
          metadata: Json | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          metadata?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean | null
          metadata?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_type: string | null
          address1: string
          address2: string | null
          city: string
          company: string | null
          country: string
          country_code: string | null
          created_at: string
          customer_id: string
          first_name: string | null
          id: string
          is_default: boolean | null
          label: string | null
          last_name: string | null
          phone: string | null
          postal_code: string
          province: string | null
          province_code: string | null
          updated_at: string
          zip: string | null
        }
        Insert: {
          address_type?: string | null
          address1: string
          address2?: string | null
          city: string
          company?: string | null
          country?: string
          country_code?: string | null
          created_at?: string
          customer_id: string
          first_name?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code: string
          province?: string | null
          province_code?: string | null
          updated_at?: string
          zip?: string | null
        }
        Update: {
          address_type?: string | null
          address1?: string
          address2?: string | null
          city?: string
          company?: string | null
          country?: string
          country_code?: string | null
          created_at?: string
          customer_id?: string
          first_name?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string
          province?: string | null
          province_code?: string | null
          updated_at?: string
          zip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          accepts_marketing: boolean | null
          address1: string | null
          address2: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          marketing_updated_at: string | null
          metadata: Json | null
          notes: string | null
          phone: string | null
          province: string | null
          tags: string[] | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
          user_id: string | null
          zip: string | null
        }
        Insert: {
          accepts_marketing?: boolean | null
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_updated_at?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          province?: string | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Update: {
          accepts_marketing?: boolean | null
          address1?: string | null
          address2?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_updated_at?: string | null
          metadata?: Json | null
          notes?: string | null
          phone?: string | null
          province?: string | null
          tags?: string[] | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      discounts: {
        Row: {
          applicable_ids: string[] | null
          applies_to: string | null
          can_combine: boolean | null
          code: string
          created_at: string
          ends_at: string | null
          exclude_sale_items: boolean | null
          id: string
          is_active: boolean | null
          minimum_purchase: number | null
          minimum_quantity: number | null
          starts_at: string
          title: string | null
          type: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          usage_limit_per_customer: number | null
          value: number
        }
        Insert: {
          applicable_ids?: string[] | null
          applies_to?: string | null
          can_combine?: boolean | null
          code: string
          created_at?: string
          ends_at?: string | null
          exclude_sale_items?: boolean | null
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          minimum_quantity?: number | null
          starts_at: string
          title?: string | null
          type: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          value: number
        }
        Update: {
          applicable_ids?: string[] | null
          applies_to?: string | null
          can_combine?: boolean | null
          code?: string
          created_at?: string
          ends_at?: string | null
          exclude_sale_items?: boolean | null
          id?: string
          is_active?: boolean | null
          minimum_purchase?: number | null
          minimum_quantity?: number | null
          starts_at?: string
          title?: string | null
          type?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          usage_limit_per_customer?: number | null
          value?: number
        }
        Relationships: []
      }
      inventory_levels: {
        Row: {
          available: number | null
          id: string
          incoming: number | null
          location_id: string
          product_id: string | null
          reserved: number | null
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          available?: number | null
          id?: string
          incoming?: number | null
          location_id: string
          product_id?: string | null
          reserved?: number | null
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          available?: number | null
          id?: string
          incoming?: number | null
          location_id?: string
          product_id?: string | null
          reserved?: number | null
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_levels_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_levels_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          address: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      navigation_menus: {
        Row: {
          created_at: string
          handle: string
          id: string
          items: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          handle: string
          id?: string
          items?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          handle?: string
          id?: string
          items?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          status: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          status?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          discount_amount: number | null
          fulfilled_quantity: number | null
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          properties: Json | null
          quantity: number
          requires_shipping: boolean | null
          sku: string | null
          title: string
          total_price: number
          unit_price: number
          variant_id: string | null
          variant_title: string | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          fulfilled_quantity?: number | null
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          properties?: Json | null
          quantity: number
          requires_shipping?: boolean | null
          sku?: string | null
          title: string
          total_price: number
          unit_price: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          fulfilled_quantity?: number | null
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          properties?: Json | null
          quantity?: number
          requires_shipping?: boolean | null
          sku?: string | null
          title?: string
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_message: string | null
          billing_address: Json | null
          cancelled_at: string | null
          closed_at: string | null
          created_at: string
          currency: string | null
          customer_id: string | null
          customer_note: string | null
          delivered_at: string | null
          discount_codes: Json | null
          discount_total: number | null
          email: string
          fulfillment_status: string | null
          id: string
          internal_note: string | null
          order_number: number
          payment_method: string | null
          payment_proof: Json | null
          payment_proof_url: string | null
          payment_reference: string | null
          payment_status: string | null
          phone: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_total: number | null
          source: string | null
          status: string | null
          subtotal: number
          tax_total: number | null
          total: number
          tracking_number: string | null
          tracking_url: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          admin_message?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          customer_note?: string | null
          delivered_at?: string | null
          discount_codes?: Json | null
          discount_total?: number | null
          email: string
          fulfillment_status?: string | null
          id?: string
          internal_note?: string | null
          order_number?: number
          payment_method?: string | null
          payment_proof?: Json | null
          payment_proof_url?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_total?: number | null
          source?: string | null
          status?: string | null
          subtotal: number
          tax_total?: number | null
          total: number
          tracking_number?: string | null
          tracking_url?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_message?: string | null
          billing_address?: Json | null
          cancelled_at?: string | null
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          customer_note?: string | null
          delivered_at?: string | null
          discount_codes?: Json | null
          discount_total?: number | null
          email?: string
          fulfillment_status?: string | null
          id?: string
          internal_note?: string | null
          order_number?: number
          payment_method?: string | null
          payment_proof?: Json | null
          payment_proof_url?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          phone?: string | null
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_total?: number | null
          source?: string | null
          status?: string | null
          subtotal?: number
          tax_total?: number | null
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean | null
          sections: Json | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          template: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          sections?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          template?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          sections?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          template?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_options: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number | null
          product_id: string
          values: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number | null
          product_id: string
          values?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number | null
          product_id?: string
          values?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          inventory_quantity: number | null
          option1_name: string | null
          option1_value: string | null
          option2_name: string | null
          option2_value: string | null
          option3_name: string | null
          option3_value: string | null
          position: number | null
          price: number | null
          product_id: string
          sale_price: number | null
          size: string | null
          sku: string | null
          status: string | null
          stock: number | null
          title: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_quantity?: number | null
          option1_name?: string | null
          option1_value?: string | null
          option2_name?: string | null
          option2_value?: string | null
          option3_name?: string | null
          option3_value?: string | null
          position?: number | null
          price?: number | null
          product_id: string
          sale_price?: number | null
          size?: string | null
          sku?: string | null
          status?: string | null
          stock?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_quantity?: number | null
          option1_name?: string | null
          option1_value?: string | null
          option2_name?: string | null
          option2_value?: string | null
          option3_name?: string | null
          option3_value?: string | null
          position?: number | null
          price?: number | null
          product_id?: string
          sale_price?: number | null
          size?: string | null
          sku?: string | null
          status?: string | null
          stock?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          available_colors: string[] | null
          available_sizes: string[] | null
          barcode: string | null
          category_id: string | null
          cost_per_item: number | null
          cover_image: string | null
          created_at: string
          description: string | null
          enable_color_variants: boolean | null
          enable_size_variants: boolean | null
          id: string
          images: Json | null
          is_featured: boolean | null
          metadata: Json | null
          price: number
          product_type: string | null
          published_at: string | null
          sale_price: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string | null
          slug: string
          status: string | null
          stock: number | null
          tags: string[] | null
          title: string
          track_inventory: boolean | null
          updated_at: string
          vendor: string | null
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          allow_backorder?: boolean | null
          available_colors?: string[] | null
          available_sizes?: string[] | null
          barcode?: string | null
          category_id?: string | null
          cost_per_item?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          enable_color_variants?: boolean | null
          enable_size_variants?: boolean | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          metadata?: Json | null
          price?: number
          product_type?: string | null
          published_at?: string | null
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          status?: string | null
          stock?: number | null
          tags?: string[] | null
          title: string
          track_inventory?: boolean | null
          updated_at?: string
          vendor?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          allow_backorder?: boolean | null
          available_colors?: string[] | null
          available_sizes?: string[] | null
          barcode?: string | null
          category_id?: string | null
          cost_per_item?: number | null
          cover_image?: string | null
          created_at?: string
          description?: string | null
          enable_color_variants?: boolean | null
          enable_size_variants?: boolean | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          metadata?: Json | null
          price?: number
          product_type?: string | null
          published_at?: string | null
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          status?: string | null
          stock?: number | null
          tags?: string[] | null
          title?: string
          track_inventory?: boolean | null
          updated_at?: string
          vendor?: string | null
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_response: string | null
          admin_response_at: string | null
          content: string | null
          created_at: string
          customer_id: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          reviewer_email: string | null
          reviewer_name: string | null
          status: string | null
          title: string | null
          updated_at: string
          verified_order_item_id: string | null
        }
        Insert: {
          admin_response?: string | null
          admin_response_at?: string | null
          content?: string | null
          created_at?: string
          customer_id?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          reviewer_email?: string | null
          reviewer_name?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          verified_order_item_id?: string | null
        }
        Update: {
          admin_response?: string | null
          admin_response_at?: string | null
          content?: string | null
          created_at?: string
          customer_id?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          reviewer_email?: string | null
          reviewer_name?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string
          verified_order_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_verified_order_item_id_fkey"
            columns: ["verified_order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_cart: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          quantity: number
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          quantity?: number
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_code: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: Json | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: { Args: { payload: Json }; Returns: Json }
      create_order_secure: { Args: { payload: Json }; Returns: Json }
      decrement_stock: {
        Args: { p_id: string; qty: number }
        Returns: undefined
      }
      increment_stock: {
        Args: { product_id: string; quantity: number; variant_id?: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
