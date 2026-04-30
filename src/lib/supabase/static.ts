import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

/**
 * Cookie-less Supabase client for ISR/static pages.
 * 
 * Uses the anon key (same as the SSR server client) but does NOT call
 * `cookies()` from next/headers, so it won't force pages into dynamic
 * rendering. Use this for public read-only queries on storefront pages
 * (products, collections, blog posts, etc.) that should be ISR-cached.
 * 
 * DO NOT use this for:
 * - User-specific data (use createClient from server.ts)
 * - Admin mutations (use createAdminClient from admin.ts)
 */
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
