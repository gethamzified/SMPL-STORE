/**
 * DELETE /api/uploads/cleanup
 * 
 * Removes an uploaded image from Supabase storage.
 * Called when:
 * - Admin removes an image before saving product
 * - Admin cancels product creation (cleanup orphaned uploads)
 * - Admin replaces an image
 * 
 * Accepts JSON body: { url: string } or { urls: string[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const urls: string[] = [];

    if (body.url && typeof body.url === 'string') {
      urls.push(body.url);
    }
    if (Array.isArray(body.urls)) {
      urls.push(...body.urls.filter((u: unknown): u is string => typeof u === 'string'));
    }

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs provided' },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const results: { url: string; deleted: boolean; error?: string }[] = [];

    for (const url of urls) {
      try {
        // Extract the storage path from the public URL
        // URL format: https://{project}.supabase.co/storage/v1/object/public/products/products/{filename}
        const storagePath = extractStoragePath(url);
        if (!storagePath) {
          results.push({ url, deleted: false, error: 'Invalid URL format' });
          continue;
        }

        const { error } = await supabase.storage
          .from('products')
          .remove([storagePath]);

        if (error) {
          console.error(`Failed to delete ${storagePath}:`, error);
          results.push({ url, deleted: false, error: error.message });
        } else {
          results.push({ url, deleted: true });
        }
      } catch (err) {
        console.error(`Error deleting ${url}:`, err);
        results.push({ url, deleted: false, error: 'Unexpected error' });
      }
    }

    const allDeleted = results.every(r => r.deleted);

    return NextResponse.json(
      {
        message: allDeleted ? 'All images deleted' : 'Some deletions failed',
        results,
      },
      { status: allDeleted ? 200 : 207 }
    );

  } catch (err) {
    console.error('Cleanup API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract the storage path from a Supabase public URL.
 * The path after the bucket name is what we need for the remove() call.
 * 
 * Example URL: https://xxx.supabase.co/storage/v1/object/public/products/products/slug-123-abc.webp
 * Storage path: products/slug-123-abc.webp
 */
function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    // Path looks like: /storage/v1/object/public/products/products/{filename}
    const parts = url.pathname.split('/');

    // Find "products" bucket in the path, then take everything after
    const bucketIndex = parts.indexOf('products');
    if (bucketIndex === -1) return null;

    // The storage path is everything after the bucket name
    const storagePath = parts.slice(bucketIndex + 1).join('/');
    return storagePath || null;
  } catch {
    // Fallback: try to extract filename from simple URL
    try {
      const parts = publicUrl.split('/');
      const fileName = parts[parts.length - 1];
      if (fileName && fileName.includes('.')) {
        return `products/${fileName}`;
      }
    } catch {
      // ignore
    }
    return null;
  }
}
