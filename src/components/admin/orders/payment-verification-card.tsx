"use client";

import { Order } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, AlertCircle, ExternalLink, CreditCard } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { updateOrderStatusAction } from "@/app/admin/(dashboard)/orders/actions";
import { toast } from "sonner";

interface PaymentVerificationCardProps {
    order: Order;
}

export function PaymentVerificationCard({ order }: PaymentVerificationCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleVerify = async (approved: boolean) => {
        if (!confirm(approved ? "Approve this payment and mark order as PAID?" : "Reject this payment?")) return;

        setIsUpdating(true);
        try {
            const result = await updateOrderStatusAction(
                order.id,
                approved ? 'processing' : 'pending', // Move to processing if paid, else back to pending
                approved ? 'paid' : 'pending' // pending_verification -> paid or pending
            );

            if (result.success) {
                toast.success(approved ? "Payment Verified" : "Payment Rejected");
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsUpdating(false);
        }
    };

    if (order.payment_method === 'COD') {
        return (
            <Card className="bg-neutral-900 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                        <CreditCard className="w-4 h-4 text-white/40" /> Payment Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                        <span className="text-xs uppercase text-white/60">Method</span>
                        <span className="font-mono text-xs text-white">Cash on Delivery</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-neutral-900 border-white/5">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                    <CreditCard className="w-4 h-4 text-white/40" /> Payment Verification
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded space-y-1">
                        <span className="text-[10px] uppercase text-white/40 tracking-wider">Method</span>
                        <p className="font-mono text-sm text-white uppercase">{order.payment_method?.replace('_', ' ')}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded space-y-1">
                        <span className="text-[10px] uppercase text-white/40 tracking-wider">Transaction ID</span>
                        <p className="font-mono text-sm text-white select-all">{order.transaction_id || "N/A"}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <span className="text-[10px] uppercase text-white/40 tracking-wider">Payment Proof</span>
                    {order.payment_proof_url && order.payment_proof_url.length > 5 ? (
                        <div className="relative aspect-video w-full h-64 sm:h-80 bg-black rounded border border-white/10 overflow-hidden group">
                            <Image
                                src={order.payment_proof_url}
                                alt="Payment Proof"
                                fill
                                className="object-contain bg-black/50" // Darken bg to see boundaries
                                unoptimized={true} // Skip Next.js optimization to avoid processing issues
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="secondary" size="sm" asChild>
                                    <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" /> View Original
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-white/10 rounded flex flex-col items-center justify-center text-white/40 gap-2">
                            <AlertCircle className="w-6 h-6" />
                            <span className="text-xs">No proof uploaded</span>
                        </div>
                    )}
                </div>

                <Separator className="bg-white/10" />

                {order.payment_status === 'pending_verification' && (
                    <div className="flex gap-3">
                        <Button
                            variant="destructive"
                            className="flex-1 bg-red-950/30 hover:bg-red-950/50 text-red-500 border border-red-500/20"
                            onClick={() => handleVerify(false)}
                            disabled={isUpdating}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button
                            className="flex-1 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-500 border border-emerald-500/20"
                            onClick={() => handleVerify(true)}
                            disabled={isUpdating}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Verify & Approve
                        </Button>
                    </div>
                )}

                {order.payment_status === 'paid' && (
                    <div className="flex items-center gap-2 text-emerald-500 text-xs bg-emerald-500/10 p-3 rounded border border-emerald-500/20">
                        <CheckCircle className="w-4 h-4" />
                        Payment Verified
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

