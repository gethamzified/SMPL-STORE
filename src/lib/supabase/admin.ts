import { createClient } from '@supabase/supabase-js'
import type { Database } from '../database.types'

export async function createAdminClient() {
  // Uses the Service Role Key to bypass RLS for admin actions
  // This allows the admin panel to work without a traditional login session
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Ensure a storage bucket exists. Creates the bucket if it doesn't exist.
 * Uses the service role key so it can be invoked from server actions.
 */
export async function ensureBucketExists(bucketId: string, opts?: { public?: boolean; fileSizeLimit?: number; allowedMimeTypes?: string[] }) {
  const supabase = await createAdminClient()

  try {
    const { data, error } = await supabase.storage.createBucket(bucketId, {
      public: opts?.public ?? true,
      fileSizeLimit: opts?.fileSizeLimit ?? 6291456,
      allowedMimeTypes: opts?.allowedMimeTypes ?? ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    })

    // If an error occurred that isn't "already exists", rethrow
    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (!msg.includes('already exists')) {
        throw error
      }
    }

    return data
  } catch (err) {
    // If the createBucket API is not permitted, surface a friendly error
    console.error('ensureBucketExists error:', err)
    throw err
  }
}
