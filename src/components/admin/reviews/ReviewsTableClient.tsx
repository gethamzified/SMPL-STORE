"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Check, X, Trash2, MessageSquare, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { updateReviewStatus, deleteReview } from "@/lib/api/reviews";
import { toast } from "sonner";

interface Review {
    id: string;
    product_id: string;
    rating: number;
    title?: string;
    content?: string;
    reviewer_name?: string;
    reviewer_email?: string;
    status: 'pending' | 'approved' | 'rejected' | 'spam';
    is_verified_purchase?: boolean;
    helpful_count?: number;
    admin_response?: string;
    created_at: string;
    product?: {
        id: string;
        title: string;
        slug: string;
        cover_image?: string;
    };
}

interface ReviewsTableClientProps {
    reviews: Review[];
}

const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    spam: "bg-gray-100 text-gray-600 border-border",
};

export function ReviewsTableClient({ reviews }: ReviewsTableClientProps) {
    const router = useRouter();
    const [filter, setFilter] = React.useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    const filteredReviews = React.useMemo(() => {
        if (filter === 'all') return reviews;
        return reviews.filter(r => r.status === filter);
    }, [reviews, filter]);

    const pendingCount = reviews.filter(r => r.status === 'pending').length;

    const handleApprove = async (reviewId: string) => {
        const result = await updateReviewStatus(reviewId, 'approved');
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Review Approved", { description: "The review is now visible on the product page." });
            router.refresh();
        }
    };

    const handleReject = async (reviewId: string) => {
        const result = await updateReviewStatus(reviewId, 'rejected');
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Review Rejected", { description: "The review has been rejected." });
            router.refresh();
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review? This cannot be undone.")) return;
        const result = await deleteReview(reviewId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Review Deleted", { description: "The review has been permanently deleted." });
            router.refresh();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-border pb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        filter === 'all' ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    )}
                >
                    All ({reviews.length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                        filter === 'pending' ? "bg-yellow-500 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    )}
                >
                    Pending
                    {pendingCount > 0 && (
                        <span className={cn(
                            "px-2 py-0.5 text-xs rounded-full",
                            filter === 'pending' ? "bg-white/20" : "bg-yellow-500 text-white"
                        )}>
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        filter === 'approved' ? "bg-green-500 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    )}
                >
                    Approved
                </button>
                <button
                    onClick={() => setFilter('rejected')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                        filter === 'rejected' ? "bg-red-500 text-white" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    )}
                >
                    Rejected
                </button>
            </div>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reviews found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-xl p-6 border border-border hover:border-input transition-colors shadow-sm"
                        >
                            <div className="flex gap-6">
                                {/* Product Image */}
                                {review.product?.cover_image && (
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                        <Image
                                            src={review.product.cover_image}
                                            alt={review.product.title}
                                            width={64}
                                            height={64}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                )}

                                {/* Review Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {review.reviewer_name || "Anonymous"}
                                                </span>
                                                <Badge className={cn("text-xs", statusColors[review.status])}>
                                                    {review.status}
                                                </Badge>
                                                {review.is_verified_purchase && (
                                                    <Badge variant="outline" className="text-xs border-green-200 text-green-700">
                                                        Verified Purchase
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={cn(
                                                                "w-3 h-3",
                                                                star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <span>•</span>
                                                <span>{formatDate(review.created_at)}</span>
                                                {review.product && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate max-w-[200px]">{review.product.title}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {review.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(review.id)}
                                                        className="bg-green-500 hover:bg-green-600 text-white"
                                                    >
                                                        <Check className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReject(review.id)}
                                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white border-border">
                                                    {review.status !== 'approved' && (
                                                        <DropdownMenuItem onClick={() => handleApprove(review.id)} className="text-green-600">
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    )}
                                                    {review.status !== 'rejected' && (
                                                        <DropdownMenuItem onClick={() => handleReject(review.id)} className="text-amber-600">
                                                            <X className="w-4 h-4 mr-2" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDelete(review.id)} className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {review.title && (
                                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                                    )}
                                    {review.content && (
                                        <p className="text-gray-600 text-sm leading-relaxed">{review.content}</p>
                                    )}

                                    {review.admin_response && (
                                        <div className="mt-4 pl-4 border-l-2 border-border">
                                            <p className="text-xs text-gray-500 mb-1">Store Response:</p>
                                            <p className="text-gray-600 text-sm">{review.admin_response}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


