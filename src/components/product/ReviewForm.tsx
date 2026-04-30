"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createReview } from "@/lib/api/reviews";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewFormProps {
    productId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [reviewerName, setReviewerName] = useState("");
    const [reviewerEmail, setReviewerEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Please select a rating", {
                description: "Click on the stars to rate this product",
            });
            return;
        }

        if (!content.trim()) {
            toast.error("Please write a review", {
                description: "Share your experience with this product",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createReview({
                product_id: productId,
                rating,
                title: title.trim() || undefined,
                content: content.trim(),
                reviewer_name: reviewerName.trim() || undefined,
                reviewer_email: reviewerEmail.trim() || undefined,
            });

            if (result.error) {
                toast.error("Error", {
                    description: result.error,
                });
                return;
            }

            toast.success("Review Submitted!", {
                description: result.message || "Thank you for your review! It will be visible after approval.",
            });

            // Reset form
            setRating(0);
            setTitle("");
            setContent("");
            setReviewerName("");
            setReviewerEmail("");

            onSuccess?.();
        } catch (error) {
            toast.error("Error", {
                description: "Failed to submit review. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-neutral-50 rounded-xl">
            <div className="space-y-2">
                <Label className="text-sm font-medium">Your Rating *</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={cn(
                                    "w-7 h-7 transition-colors",
                                    (hoverRating || rating) >= star
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-neutral-300"
                                )}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reviewer_name" className="text-sm font-medium">
                        Your Name
                    </Label>
                    <Input
                        id="reviewer_name"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="John Doe"
                        className="bg-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reviewer_email" className="text-sm font-medium">
                        Your Email
                    </Label>
                    <Input
                        id="reviewer_email"
                        type="email"
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="bg-white"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="review_title" className="text-sm font-medium">
                    Review Title
                </Label>
                <Input
                    id="review_title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Sum up your experience"
                    className="bg-white"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="review_content" className="text-sm font-medium">
                    Your Review *
                </Label>
                <Textarea
                    id="review_content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="bg-white resize-none"
                />
            </div>

            <div className="flex gap-3">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 uppercase tracking-widest"
                >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="uppercase tracking-widest"
                    >
                        Cancel
                    </Button>
                )}
            </div>

            <p className="text-xs text-neutral-500 text-center">
                Your review will be published after it has been reviewed by our team.
            </p>
        </form>
    );
}
