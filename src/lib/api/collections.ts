// ==========================================
// COLLECTIONS API - Server Actions
// ==========================================

'use server'

import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Collection, ApiResponse, Product } from '@/lib/types'
import { processImage, generateImageFilename } from '@/lib/image-processor'


// ==========================================
// IMAGE UPLOAD
// ==========================================

// ==========================================
// IMAGE UPLOAD
// ==========================================

// uploadImage function removed - using client-side upload

async function deleteImageFromStorage(url: string) {
  if (!url) return
  try {
    const supabase = await createAdminClient()

    // Extract filename/path from URL
    // URL: https://.../storage/v1/object/public/collections/filename.webp
    const urlObj = new URL(url)
    const parts = urlObj.pathname.split('/')
    const bucketIndex = parts.indexOf('collections') // Find bucket name in path

    let storagePath = ''
    if (bucketIndex !== -1 && bucketIndex < parts.length - 1) {
      storagePath = parts.slice(bucketIndex + 1).join('/')
    } else {
      // Fallback to filename
      storagePath = parts[parts.length - 1]
    }

    if (storagePath) {
      const { error } = await supabase.storage
        .from('collections')
        .remove([storagePath])

      if (error) {
        console.error(`Failed to delete image ${storagePath} from collections:`, error.message)
      } else {
        console.log(`Deleted old collection image: ${storagePath}`)
      }
    }
  } catch (err) {
    console.error('Error in deleteImageFromStorage:', err)
  }
}

// ==========================================
// CREATE COLLECTION
// ==========================================

export async function createCollection(formData: FormData): Promise<ApiResponse<Collection>> {
  try {
    const supabase = await createAdminClient()

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const isVisible = formData.get('is_visible') === 'on'
    const seoTitle = formData.get('seo_title') as string
    const seoDescription = formData.get('seo_description') as string

    // New: Accept URL directly from client-side upload
    const imageUrl = formData.get('image_url') as string
    const blurDataURL = formData.get('blurDataURL') as string
    const sortOrder = parseInt(formData.get('sort_order') as string) || 0;

    // Customization
    const showProductGrid = formData.get('show_product_grid') === 'on';
    const tagline = formData.get('tagline') as string;

    // Validation
    if (!title || title.trim().length < 2) {
      return { error: 'Collection title must be at least 2 characters' }
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' }
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return { error: 'A collection with this slug already exists' }
    }

    // Construct metadata
    const metadata: Record<string, any> = {
      show_product_grid: showProductGrid,
      tagline: tagline || "Explore The Collection"
    };

    if (blurDataURL && imageUrl) {
      metadata.blurDataUrls = { [imageUrl]: blurDataURL };
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        title: title.trim(),
        slug: slug.toLowerCase().trim(),
        description: description?.trim() || null,
        image_url: imageUrl || null,
        is_visible: isVisible,
        sort_order: sortOrder,
        metadata: metadata,
        seo_title: seoTitle?.trim() || null,
        seo_description: seoDescription?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error)
      return { error: error.message }
    }

    revalidatePath('/admin/collections');
    revalidatePath('/collection');
    revalidatePath('/shop');
    revalidatePath('/');
    revalidateTag('collections', 'max');

    return { data: data as Collection }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// UPDATE COLLECTION
// ==========================================

export async function updateCollection(formData: FormData): Promise<ApiResponse<Collection>> {
  try {
    const supabase = await createAdminClient()

    const id = formData.get('id') as string
    if (!id) {
      return { error: 'Collection ID is required' }
    }

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const description = formData.get('description') as string
    const isVisible = formData.get('is_visible') === 'on'
    const seoTitle = formData.get('seo_title') as string
    const seoDescription = formData.get('seo_description') as string
    const existingImage = formData.get('existing_image') as string // Original image URL before edit

    // New: Accept URL directly from client-side upload
    const imageUrl = formData.get('image_url') as string
    const blurDataURL = formData.get('blurDataURL') as string
    const sortOrder = parseInt(formData.get('sort_order') as string) || 0;

    // Customization
    const showProductGrid = formData.get('show_product_grid') === 'on';
    const tagline = formData.get('tagline') as string;

    // Validation
    if (!title || title.trim().length < 2) {
      return { error: 'Collection title must be at least 2 characters' }
    }

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { error: 'Invalid slug format' }
    }

    // Check for duplicate slug (excluding current collection)
    const { data: duplicate } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (duplicate) {
      return { error: 'A collection with this slug already exists' }
    }

    // Fetch existing collection to merge metadata
    const { data: existingCollection } = await supabase
      .from('collections')
      .select('metadata')
      .eq('id', id)
      .single();

    const existingMetadata = (existingCollection?.metadata as Record<string, any>) || {};

    // Prepare new metadata
    const newMetadata: Record<string, any> = {
      ...existingMetadata,
      show_product_grid: showProductGrid,
      tagline: tagline || "Explore The Collection"
    };

    // Handle blurDataURL merge
    if (blurDataURL && imageUrl) {
      const existingBlurData = (existingMetadata.blurDataUrls as Record<string, string>) || {};
      newMetadata.blurDataUrls = {
        ...existingBlurData,
        [imageUrl]: blurDataURL
      };
    }

    const updatePayload: Record<string, any> = {
      title: title.trim(),
      slug: slug.toLowerCase().trim(),
      description: description?.trim() || null,
      image_url: imageUrl || null,
      is_visible: isVisible,
      sort_order: sortOrder,
      seo_title: seoTitle?.trim() || null,
      seo_description: seoDescription?.trim() || null,
      metadata: newMetadata
    };

    const { data, error } = await supabase
      .from('collections')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    // If we successfully updated with a new image, delete the old one
    if (existingImage && imageUrl !== existingImage) {
      await deleteImageFromStorage(existingImage)
    }

    revalidatePath('/admin/collections');
    revalidatePath(`/admin/collections/${id}`);
    revalidatePath('/collection');
    revalidatePath('/shop');
    revalidatePath('/');
    revalidateTag('collections', 'max');

    return { data: data as Collection }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

// ==========================================
// DELETE COLLECTION
// ==========================================

export async function deleteCollection(id: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createAdminClient()

    // Fetch the collection first to get the image URL
    const { data: collection } = await supabase
      .from('collections')
      .select('image_url')
      .eq('id', id)
      .single()

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    // If deletion from DB was successful, delete the image from storage
    if (collection?.image_url) {
      await deleteImageFromStorage(collection.image_url)
    }

    revalidatePath('/admin/collections');
    revalidatePath('/collection');
    revalidatePath('/shop');
    revalidatePath('/');
    revalidateTag('collections', 'max');

    return { message: 'Collection deleted successfully' }
  } catch (error) {
    return { error: 'Failed to delete collection' }
  }
}

// ==========================================
// GET COLLECTIONS (Cached)
// ==========================================

export const getCollections = unstable_cache(
  async (options?: {
    visible?: boolean
    limit?: number
  }): Promise<ApiResponse<Collection[]>> => {
    try {
      const supabase = createStaticClient()

      let query = supabase
        .from('collections')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true })

      if (options?.visible !== undefined) {
        query = query.eq('is_visible', options.visible)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        return { error: error.message }
      }

      return { data: data as Collection[] }
    } catch (error) {
      return { error: 'Failed to fetch collections' }
    }
  },
  ['collections-list'], // Key parts
  { tags: ['collections'], revalidate: 3600 }
)

// ==========================================
// GET SINGLE COLLECTION (Cached)
// ==========================================

export const getCollection = unstable_cache(
  async (slug: string): Promise<ApiResponse<Collection & { products: unknown[] }>> => {
    try {
      const supabase = createStaticClient()

      const { data: collection, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) {
        return { error: error.message }
      }

      // Fetch products in this collection - REMOVED for performance (fetched by page via ProductService)
      // const { data: products } = await supabase
      //   .from('products')
      //   .select('*')
      //   .eq('category_id', collection.id)
      //   .eq('status', 'active')
      //   .order('created_at', { ascending: false })
      //   .limit(20)


      return {
        data: {
          ...collection,
          products: [] // products || []
        } as Collection & { products: unknown[] }
      }
    } catch (error) {
      return { error: 'Failed to fetch collection' }
    }
  },
  ['collection-by-slug'], // Key parts
  { tags: ['collections'], revalidate: 3600 } // Invalidate if collection changes (removed products tag dependency)
)

// Reorder collections (batch update)
export async function reorderCollections(items: { id: string; sort_order: number }[]) {
  const supabase = await createAdminClient();

  // Perform updates in parallel
  const updates = items.map(item =>
    supabase
      .from('collections')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id)
  );

  await Promise.all(updates);

  revalidateTag('collections', 'max');
  revalidateTag('featured-collections', 'max');
  revalidatePath('/', 'page');
  revalidatePath('/admin/collections', 'page');

  return { success: true };
}
