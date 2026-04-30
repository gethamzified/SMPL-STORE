"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";

interface ShippingMethodStepProps {
    selectedMethod: string;
    onSelect: (method: string) => void;
    deliveryConfig: {
        standard: { price: number; time: string; description: string };
        express: { price: number; time: string; description: string };
        freeThreshold: number;
    };
    cartTotal: number;
}

export function ShippingMethodStep({ selectedMethod, onSelect, deliveryConfig, cartTotal }: ShippingMethodStepProps) {
    const formatCurrency = useFormatCurrency();
    const { standard, express, freeThreshold } = deliveryConfig;

    const isStandardFree = cartTotal >= freeThreshold;

    return (
        <div className="space-y-6">
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase mb-8 border-b border-black/5 pb-4">
                Shipping Method
            </h2>

            <RadioGroup value={selectedMethod} onValueChange={onSelect} className="space-y-4">

                {/* STANDARD SHIPPING */}
                <div className={cn(
                    "relative border p-6 flex cursor-pointer transition-all hover:bg-neutral-50",
                    selectedMethod === "standard"
                        ? "border-black bg-neutral-50 ring-1 ring-black/5"
                        : "border-neutral-200"
                )}>
                    <RadioGroupItem value="standard" id="shipping-standard" className="mt-1" />
                    <Label htmlFor="shipping-standard" className="flex-1 ml-4 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm uppercase tracking-wide">Standard Delivery</span>
                            <span className={cn("font-bold text-sm", isStandardFree && "text-green-600")}>
                                {isStandardFree ? "FREE" : formatCurrency(standard.price)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                            <Truck className="w-3 h-3" />
                            <span>{standard.time}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wide">
                            {standard.description}
                        </p>
                    </Label>
                </div>

                {/* EXPRESS SHIPPING */}
                <div className={cn(
                    "relative border p-6 flex cursor-pointer transition-all hover:bg-neutral-50",
                    selectedMethod === "express"
                        ? "border-black bg-neutral-50 ring-1 ring-black/5"
                        : "border-neutral-200"
                )}>
                    <RadioGroupItem value="express" id="shipping-express" className="mt-1" />
                    <Label htmlFor="shipping-express" className="flex-1 ml-4 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm uppercase tracking-wide">Express Delivery</span>
                            <span className="font-bold text-sm">{formatCurrency(express.price)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
                            <Zap className="w-3 h-3 fill-current" />
                            <span>{express.time}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-wide">
                            {express.description}
                        </p>
                    </Label>
                </div>

            </RadioGroup>
        </div>
    );
}
