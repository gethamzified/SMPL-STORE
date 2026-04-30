"use client";

import { Button } from "@/components/ui/button";
import { Printer, Package } from "lucide-react";
import { toast } from "sonner";

interface OrderActionsProps {
    orderId: string;
    trackingNumber?: string | null;
}

export function OrderActions({ orderId, trackingNumber }: OrderActionsProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleTrack = () => {
        if (trackingNumber) {
            // In a real app, you'd generate the carrier URL
            window.open(`https://www.google.com/search?q=${trackingNumber}`, '_blank');
        } else {
            toast("Tracking Unavailable", {
                description: "Your order is being processed. Tracking will be available once shipped.",
            });
        }
    };

    return (
        <div className="flex gap-4 print:hidden">
            <Button
                variant="outline"
                onClick={handlePrint}
                className="h-12 border-2 border-neutral-100 hover:border-black rounded-xl font-bold text-xs uppercase tracking-widest px-8 transition-colors"
            >
                <Printer className="w-4 h-4 mr-2" /> Invoice
            </Button>
            <Button
                onClick={handleTrack}
                disabled={!trackingNumber}
                className="h-12 bg-black text-white hover:bg-neutral-800 rounded-xl font-bold text-xs uppercase tracking-widest px-8 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {trackingNumber ? "Track Order" : "Processing"}
            </Button>
        </div>
    );
}
