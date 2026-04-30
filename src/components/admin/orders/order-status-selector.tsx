"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/lib/api/orders"; // Ensure this matches export in api/orders.ts
import { Loader2 } from "lucide-react";
import { OrderStatus } from "@/lib/types";

interface Props {
    orderId: string;
    currentStatus: string;
}

export function OrderStatusSelector({ orderId, currentStatus }: Props) {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    const handleStatusChange = async (value: string) => {
        setLoading(true);
        try {
            // Optimistic update
            setStatus(value);

            const result = await updateOrderStatus(orderId, { status: value as OrderStatus });

            if (result.error) {
                toast.error("Update failed", { description: result.error });
                setStatus(currentStatus); // Revert
            } else {
                toast.success("Status Updated", { description: `Order marked as ${value}` });
            }
        } catch (e) {
            toast.error("Error", { description: "Failed to update status" });
            setStatus(currentStatus);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
            <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
                <SelectTrigger className="w-[160px] h-9 text-xs uppercase tracking-widest bg-white text-gray-900 border-2 border-black hover:bg-gray-50 focus:ring-0 shadow-sm">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-black text-gray-900">
                    <SelectItem value="pending" className="text-xs uppercase tracking-wider focus:bg-gray-100 focus:text-gray-900 text-gray-700">Pending</SelectItem>
                    <SelectItem value="processing" className="text-xs uppercase tracking-wider focus:bg-gray-100 focus:text-gray-900 text-gray-700">Processing</SelectItem>
                    <SelectItem value="shipped" className="text-xs uppercase tracking-wider focus:bg-gray-100 focus:text-gray-900 text-gray-700">Shipped</SelectItem>
                    <SelectItem value="delivered" className="text-xs uppercase tracking-wider focus:bg-gray-100 focus:text-gray-900 text-gray-700">Delivered</SelectItem>
                    <SelectItem value="cancelled" className="text-xs uppercase tracking-wider focus:bg-gray-100 focus:text-gray-900 text-red-600">Cancelled</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

