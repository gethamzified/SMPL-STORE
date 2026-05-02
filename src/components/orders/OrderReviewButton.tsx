"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ReviewForm from "@/components/product/ReviewForm";
import { MessageSquarePlus } from "lucide-react";

interface OrderReviewButtonProps {
    productId: string;
    productTitle: string;
}

export function OrderReviewButton({ productId, productTitle }: OrderReviewButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 rounded-none border-[#1a1a1a] text-[9px] font-bold uppercase tracking-widest hover:bg-brand-ascent hover:text-white hover:border-brand-ascent transition-colors mt-2 sm:mt-0">
                    <MessageSquarePlus className="w-3 h-3 mr-1.5" />
                    Review Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 border-2 border-black rounded-none shadow-2xl">
                <div className="sr-only">
                    <DialogTitle>Review {productTitle}</DialogTitle>
                </div>
                <ReviewForm 
                    productId={productId} 
                    onSuccess={() => setOpen(false)}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
