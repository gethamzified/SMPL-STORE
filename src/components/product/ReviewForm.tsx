"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
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
            toast.error("RATING REQUIRED", {
                description: "PLEASE SELECT A STAR RATING.",
            });
            return;
        }

        if (!content.trim()) {
            toast.error("REVIEW REQUIRED", {
                description: "PLEASE SHARE YOUR EXPERIENCE.",
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
                toast.error("ERROR", {
                    description: result.error,
                });
                return;
            }

            toast.success("REVIEW SUBMITTED", {
                description: "THANK YOU! YOUR FEEDBACK IS UNDER REVIEW.",
            });

            // Reset form
            setRating(0);
            setTitle("");
            setContent("");
            setReviewerName("");
            setReviewerEmail("");

            onSuccess?.();
        } catch (error) {
            toast.error("ERROR", {
                description: "FAILED TO SUBMIT REVIEW. PLEASE TRY AGAIN.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-8">
                <h3 className="text-xl font-black uppercase tracking-tighter text-black">Submit Feedback</h3>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="p-2 hover:bg-neutral-100 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase tracking-widest text-black">Overall Rating *</Label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="transition-transform active:scale-90"
                        >
                                <Star
                                    className={cn(
                                        "w-8 h-8 transition-all duration-200",
                                        (hoverRating || rating) >= star
                                            ? "fill-brand-ascent text-brand-ascent scale-110"
                                            : "text-black fill-none"
                                    )}
                                />
                        </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-brand-ascent flex items-center">
                        {rating} / 5 STARS
                      </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="reviewer_name" className="text-[11px] font-black uppercase tracking-widest text-black">
                        Display Name
                    </Label>
                    <Input
                        id="reviewer_name"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="E.G. JOHN D."
                        className="rounded-none border-2 border-black h-12 font-black uppercase text-xs tracking-widest placeholder:text-neutral-300 focus:border-brand-ascent focus:ring-0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reviewer_email" className="text-[11px] font-black uppercase tracking-widest text-black">
                        Email Address
                    </Label>
                    <Input
                        id="reviewer_email"
                        type="email"
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                        placeholder="EMAIL@EXAMPLE.COM"
                        className="rounded-none border-2 border-black h-12 font-black uppercase text-xs tracking-widest placeholder:text-neutral-300 focus:border-brand-ascent focus:ring-0"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="review_title" className="text-[11px] font-black uppercase tracking-widest text-black">
                    Review Headline
                </Label>
                <Input
                    id="review_title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.G. PERFECT FIT / HIGH QUALITY"
                    className="rounded-none border-2 border-black h-12 font-black uppercase text-xs tracking-widest placeholder:text-neutral-300 focus:border-brand-ascent focus:ring-0"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="review_content" className="text-[11px] font-black uppercase tracking-widest text-black">
                    Your Experience *
                </Label>
                <Textarea
                    id="review_content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="SHARE YOUR DETAILED FEEDBACK..."
                    rows={5}
                    className="rounded-none border-2 border-black font-black uppercase text-xs tracking-widest placeholder:text-neutral-300 focus:border-brand-ascent focus:ring-0 resize-none"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="cta"
                    size="xl"
                    className="flex-1 bg-black text-white hover:bg-brand-ascent border-2 border-black rounded-none"
                >
                    {isSubmitting ? "PROCESSING..." : "PUBLISH REVIEW"}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="rounded-none border-2 border-black font-black uppercase tracking-widest h-14"
                    >
                        DISCARD
                    </Button>
                )}
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center border-t border-neutral-100 pt-6">
                * FEEDBACK WILL BE VISIBLE AFTER MANUAL VERIFICATION
            </p>
        </form>
    );
}
