"use client";

import { useState } from "react";
import { Star, CheckCircle, MessageSquarePlus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReviewForm from "@/components/product/ReviewForm";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

export default function ReviewsSection({
  reviews = [],
  stats,
  productId
}: ReviewsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const hasStats = stats && stats.total > 0;
  
  const handleReviewSuccess = () => {
    setShowForm(false);
    router.refresh();
  };

  return (
    <section className="border-t-2 border-[#1a1a1a] bg-white">
      <div className="flex items-center justify-between px-4 md:px-6 py-5 border-b-2 border-[#1a1a1a]">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-black">
          User Feedback / Reviews ({stats?.total || 0})
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left: Summary Stats */}
        <div className="lg:col-span-4 p-6 md:p-8 border-b-2 lg:border-b-0 lg:border-r-2 border-[#1a1a1a] bg-neutral-50/50">
          <div className="space-y-8 sticky top-32">
            <div className="flex items-baseline gap-4">
              <span className="text-7xl font-display font-black tracking-tighter text-black">
                {stats?.average?.toFixed(1) || "0.0"}
              </span>
              <div className="flex flex-col">
                <div className="flex text-brand-ascent mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(stats?.average || 0) ? "fill-current" : "text-neutral-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  {stats?.total || 0} VERIFIED REVIEWS
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const dist = stats?.distribution.find(d => d.rating === rating);
                const percentage = dist?.percentage || 0;
                return (
                  <div key={rating} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1 w-8">
                      <span>{rating}</span>
                      <Star className="w-3 h-3 fill-black text-black" />
                    </div>
                    <div className="flex-1 h-3 bg-neutral-200 border border-black overflow-hidden">
                      <div 
                        className="h-full bg-brand-ascent border-r border-black transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-black">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>

            {!showForm && productId && (
              <Button
                variant="cta"
                size="xl"
                className="w-full bg-black text-white hover:bg-brand-ascent border-2 border-black rounded-none transition-all group"
                onClick={() => setShowForm(true)}
              >
                <MessageSquarePlus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                WRITE A REVIEW
              </Button>
            )}
          </div>
        </div>

        {/* Right: Review List or Form */}
        <div className="lg:col-span-8 bg-white min-h-[400px]">
          {showForm && productId ? (
            <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <ReviewForm
                productId={productId}
                onSuccess={handleReviewSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          ) : (
            <div className="divide-y-2 divide-[#1a1a1a]">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-neutral-400 mb-6">No user feedback yet</p>
                  <Button 
                    variant="outline" 
                    className="rounded-none border-2 border-black font-black uppercase tracking-widest text-[10px] h-12 px-8"
                    onClick={() => setShowForm(true)}
                  >
                    Be the first to review
                  </Button>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-6 md:p-8 hover:bg-neutral-50 transition-colors group">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-brand-ascent text-white font-black text-sm shrink-0">
                          {review.author[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-[11px] uppercase tracking-widest text-black">{review.author}</p>
                            {review.verified && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-tighter text-brand-ascent bg-brand-ascent/10 px-1.5 py-0.5 border border-brand-ascent/20">
                                <CheckCircle className="w-2.5 h-2.5" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex text-brand-ascent">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-3 h-3",
                                  i < review.rating ? "fill-current" : "text-neutral-300"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400">{review.date}</span>
                    </div>
                    
                    {review.title && (
                      <h3 className="font-black text-lg uppercase tracking-tighter mb-2 text-black group-hover:text-brand-ascent transition-colors">
                        {review.title}
                      </h3>
                    )}
                    <p className="text-sm font-medium text-neutral-600 leading-relaxed mb-6 max-w-2xl">{review.content}</p>
                    
                    {(review.helpful_count ?? 0) > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-neutral-100 border border-black/10 text-[9px] font-black uppercase tracking-widest text-neutral-500">
                          {review.helpful_count} {review.helpful_count === 1 ? 'Person' : 'People'} Found This Helpful
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
