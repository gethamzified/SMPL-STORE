"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

interface OrderCancelButtonProps {
    orderId: string;
    orderStatus: string;
    createdAt: string;
}

export function OrderCancelButton({ orderId, orderStatus, createdAt }: OrderCancelButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Check if order is within 24 hours
    const createdDate = new Date(createdAt);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    const isWithin24Hours = hoursSinceCreation <= 24;

    // Check if status allows cancellation
    const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
    const canCancel = isWithin24Hours && !nonCancellableStatuses.includes(orderStatus);

    if (!canCancel) {
        return null;
    }

    const handleCancel = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Order Cancelled", {
                    description: "Your order has been cancelled and stock has been restored.",
                });
                router.refresh();
            } else {
                toast.error("Cancellation Failed", {
                    description: data.error,
                });
            }
        } catch (error) {
            toast.error("Error", {
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-12 border-2 border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest px-8 transition-all"
                >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-black">Cancel This Order?</AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-600">
                        This action cannot be undone. Your order will be cancelled and any reserved items will be released back to stock.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="font-medium">Keep Order</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Yes, Cancel Order
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
