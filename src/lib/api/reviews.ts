// ==========================================
// REVIEWS API - Server Actions
// ==========================================

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Review, CreateReviewInput, ApiResponse } from '@/lib/types'

// ==========================================
// CREATE REVIEW (Customer)
// ==========================================

export async function createReview(input: CreateReviewInput): Promise<ApiResponse<Review>> {
  try {
    const supabase = await createClient()
    
    // Validation
    if (!input.product_id) {
      return { error: 'Product ID is required' }
    }
    
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      return { error: 'Rating must be between 1 and 5' }
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if user has already reviewed this product
    if (user) {
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', input.product_id)
        .eq('customer_id', user.id)
        .single()
      
      if (existingReview) {
        return { error: 'You have already reviewed this product' }
      }
    }
    
    // Check for verified purchase
    let isVerifiedPurchase = false
    if (user) {
      const { data: order } = await supabase
        .from('order_items')
        .select('id, order:orders!inner(customer_id, payment_status)')
        .eq('product_id', input.product_id)
        .single()
      
      if (order) {
        isVerifiedPurchase = true
      }
    }
    
    const adminClient = await createAdminClient()
    
    const { data, error } = await adminClient
      .from('reviews')
      .insert({
        product_id: input.product_id,
        customer_id: user?.id || null,
        rating: input.rating,
        title: input.title?.trim() || null,
        content: input.content?.trim() || null,
        reviewer_name: input.reviewer_name?.trim() || (user ? 'Verified Customer' : 'Anonymous'),
        reviewer_email: input.reviewer_email || user?.email || null,
        status: 'pending', // Requires approval
        is_verified_purchase: isVerifiedPurchase,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Review creation error:', error)
      return { error: error.message }
    }
    
    return { 
      data: data as Review, 
      message: 'Thank you for your review! It will be visible after approval.' 
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'Failed to submit review' }
  }
}

// ==========================================
// GET PRODUCT REVIEWS (Public)
// ==========================================

export async function getProductReviews(productId: string, options?: {
  limit?: number
  offset?: number
}): Promise<ApiResponse<{ reviews: Review[]; stats: ReviewStats }>> {
  try {
    const supabase = await createClient()
    
    // Fetch reviews
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    
    if (options?.limit) {
      const offset = options.offset || 0
      query = query.range(offset, offset + options.limit - 1)
    }
    
    const { data: reviews, error } = await query
    
    if (error) {
      return { error: error.message }
    }
    
    // Calculate stats
    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved')
    
    const stats = calculateReviewStats(allReviews || [])
    
    return { 
      data: { 
        reviews: reviews as Review[], 
        stats 
      } 
    }
  } catch (error) {
    return { error: 'Failed to fetch reviews' }
  }
}

type ReviewStats = {
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}

function calculateReviewStats(reviews: { rating: number }[]): ReviewStats {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0
  
  for (const review of reviews) {
    sum += review.rating
    distribution[review.rating as keyof typeof distribution]++
  }
  
  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    distribution,
  }
}

// ==========================================
// UPDATE REVIEW STATUS (Admin)
// ==========================================

export async function updateReviewStatus(
  reviewId: string, 
  status: 'approved' | 'rejected' | 'spam'
): Promise<ApiResponse<Review>> {
  try {
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', reviewId)
      .select()
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    revalidatePath('/admin/reviews')
    
    return { data: data as Review }
  } catch (error) {
    return { error: 'Failed to update review' }
  }
}

// ==========================================
// RESPOND TO REVIEW (Admin)
// ==========================================

export async function respondToReview(
  reviewId: string, 
  response: string
): Promise<ApiResponse<Review>> {
  try {
    const supabase = await createAdminClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .update({ 
        admin_response: response.trim(),
        admin_response_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single()
    
    if (error) {
      return { error: error.message }
    }
    
    revalidatePath('/admin/reviews')
    
    return { data: data as Review }
  } catch (error) {
    return { error: 'Failed to respond to review' }
  }
}

// ==========================================
// DELETE REVIEW (Admin)
// ==========================================

export async function deleteReview(reviewId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createAdminClient()
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
    
    if (error) {
      return { error: error.message }
    }
    
    revalidatePath('/admin/reviews')
    
    return { message: 'Review deleted successfully' }
  } catch (error) {
    return { error: 'Failed to delete review' }
  }
}

// ==========================================
// GET ALL REVIEWS (Admin)
// ==========================================

export async function getAllReviews(options?: {
  status?: 'pending' | 'approved' | 'rejected' | 'spam'
  limit?: number
}): Promise<ApiResponse<Review[]>> {
  try {
    const supabase = await createAdminClient()
    
    let query = supabase
      .from('reviews')
      .select(`
        *,
        product:products(id, title, slug, cover_image)
      `)
      .order('created_at', { ascending: false })
    
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { error: error.message }
    }
    
    return { data: data as Review[] }
  } catch (error) {
    return { error: 'Failed to fetch reviews' }
  }
}

// ==========================================
// MARK REVIEW AS HELPFUL
// ==========================================

export async function markReviewHelpful(reviewId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createAdminClient()
    
    const { error } = await supabase.rpc('increment_helpful_count', {
      review_id: reviewId,
    })
    
    if (error) {
      // Fallback to manual increment
      const { data: review } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single()
      
      if (review) {
        await supabase
          .from('reviews')
          .update({ helpful_count: (review.helpful_count || 0) + 1 })
          .eq('id', reviewId)
      }
    }
    
    return { message: 'Marked as helpful' }
  } catch (error) {
    return { error: 'Failed to update' }
  }
}
