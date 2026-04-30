"use client";

import { useState } from "react";
import { Star, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReviewForm from "@/components/product/ReviewForm";
import { useRouter } from "next/navigation";

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified?: boolean;
  helpful_count?: number;
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

interface ReviewsSectionProps {
  reviews?: ReviewItem[];
  stats?: ReviewStats;
  productId?: string;
}

// Default mock data for when no reviews exist
const defaultReviews: ReviewItem[] = [
  {
    id: "1",
    author: "Alex M.",
    rating: 5,
    date: "2 weeks ago",
    title: "Perfect fit and feel",
    content: "I absolutely love this jacket. The linen is high quality and breathable. Fits true to size.",
  },
  {
    id: "2",
    author: "Sarah J.",
    rating: 4,
    date: "1 month ago",
    title: "Great summer staple",
    content: "Really nice material. The sleeves are a bit long for me but easily rolled up. Would recommend.",
  },
  {
    id: "3",
    author: "David K.",
    rating: 5,
    date: "1 month ago",
    title: "Worth the price",
    content: "You can feel the quality instantly. It's become my go-to for evening outings.",
  },
];

const defaultStats: ReviewStats = {
  average: 4.8,
  total: 128,
  distribution: [
    { rating: 5, count: 90, percentage: 70 },
    { rating: 4, count: 26, percentage: 20 },
    { rating: 3, count: 6, percentage: 5 },
    { rating: 2, count: 4, percentage: 3 },
    { rating: 1, count: 2, percentage: 2 },
  ]
};

export default function ReviewsSection({
  reviews = defaultReviews,
  stats = defaultStats,
  productId
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;
  const displayStats = stats.total > 0 ? stats : defaultStats;

  const handleReviewSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  return (
    <section className="py-16 border-t">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Summary */}
        <div className="lg:col-span-4 space-y-6">
          <h2 className="text-2xl font-display uppercase tracking-wider">Reviews</h2>

          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-medium">{displayStats.average.toFixed(1)}</span>
            <div className="flex flex-col">
              <div className="flex text-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(displayStats.average) ? 'fill-current' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Based on {displayStats.total} reviews</span>
            </div>
          </div>

          <div className="space-y-2">
            {displayStats.distribution.map(({ rating, percentage }) => (
              <div key={rating} className="flex items-center gap-3 text-sm">
                <span className="w-3">{rating}</span>
                <Star className="w-3 h-3" />
                <Progress value={percentage} className="h-2" />
                <span className="w-8 text-right text-muted-foreground">
                  {percentage}%
                </span>
              </div>
            ))}
          </div>

          {productId && (
            <Button
              variant="outline"
              className="w-full uppercase tracking-widest"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Write a Review"}
            </Button>
          )}
        </div>

        {/* Review Form or List */}
        <div className="lg:col-span-8 space-y-8">
          {/* Review Form */}
          {showForm && productId && (
            <ReviewForm
              productId={productId}
              onSuccess={handleReviewSuccess}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Review List */}
          {!showForm && (
            <>
              {displayReviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                displayReviews.map((review) => (
                  <div key={review.id} className="border-b pb-8 last:border-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{review.author}</p>
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                                <CheckCircle className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex text-primary mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    {review.title && <h3 className="font-medium mb-2">{review.title}</h3>}
                    <p className="text-muted-foreground text-sm leading-relaxed">{review.content}</p>
                    {(review.helpful_count ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground mt-3">
                        {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
                      </p>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
