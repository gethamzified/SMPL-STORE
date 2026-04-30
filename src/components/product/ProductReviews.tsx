import { createClient } from "@/lib/supabase/server";
import ReviewsSection from "@/components/sections/ReviewsSection";
import type { Review } from "@/lib/types";

interface ProductReviewsProps {
  productId: string;
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
  const supabase = await createClient();

  // Fetch approved reviews for this product
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      customers:customer_id (
        first_name,
        last_name
      )
    `)
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(10);

  // Calculate review stats
  const totalReviews = reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  // Calculate rating distribution
  const distribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews?.filter(r => r.rating === rating).length || 0;
    return {
      rating,
      count,
      percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    };
  });

  // Transform reviews for the component
  const formattedReviews = reviews?.map(review => ({
    id: review.id,
    author: review.customers
      ? `${review.customers.first_name} ${review.customers.last_name?.charAt(0) || ''}.`
      : 'Anonymous',
    rating: review.rating,
    date: formatRelativeDate(new Date(review.created_at)),
    title: review.title || '',
    content: review.content,
    verified: review.verified_purchase,
    helpful_count: review.helpful_count || 0,
  })) || [];

  return (
    <ReviewsSection
      reviews={formattedReviews}
      stats={{
        average: averageRating,
        total: totalReviews,
        distribution
      }}
      productId={productId}
    />
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
