"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Truck, Zap } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { outlinedPanel } from "@/lib/outline";

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
            <h2 className="text-xl font-display font-black tracking-tighter uppercase mb-8 border-b-2 border-[#1a1a1a] pb-4 text-brand-ascent">
                SHIPPING METHOD
            </h2>

            <RadioGroup value={selectedMethod} onValueChange={onSelect} className="space-y-4">

                {/* STANDARD SHIPPING */}
                <div className={cn(
                    "relative p-6 flex cursor-pointer transition-all",
                    outlinedPanel,
                    selectedMethod === "standard" ? "bg-neutral-50" : "hover:bg-neutral-50/70"
                )}>
                    <RadioGroupItem value="standard" id="shipping-standard" className="mt-1" />
                    <Label htmlFor="shipping-standard" className="flex-1 ml-4 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-sm uppercase tracking-widest text-black">STANDARD DELIVERY</span>
                            <span className={cn("font-black text-lg", isStandardFree ? "text-brand-ascent" : "text-black")}>
                                {isStandardFree ? "FREE" : formatCurrency(standard.price)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-black mb-2 tracking-widest">
                            <Truck className="w-4 h-4 text-brand-ascent" />
                            <span>{standard.time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-500 leading-relaxed tracking-widest">
                            {standard.description}
                        </p>
                    </Label>
                </div>

                {/* EXPRESS SHIPPING */}
                <div className={cn(
                    "relative p-6 flex cursor-pointer transition-all",
                    outlinedPanel,
                    selectedMethod === "express" ? "bg-neutral-50" : "hover:bg-neutral-50/70"
                )}>
                    <RadioGroupItem value="express" id="shipping-express" className="mt-1" />
                    <Label htmlFor="shipping-express" className="flex-1 ml-4 cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-sm uppercase tracking-widest text-black">EXPRESS DELIVERY</span>
                            <span className="font-black text-lg text-black">{formatCurrency(express.price)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-brand-ascent mb-2 tracking-widest">
                            <Zap className="w-4 h-4 fill-current" />
                            <span>{express.time}</span>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-500 leading-relaxed tracking-widest">
                            {express.description}
                        </p>
                    </Label>
                </div>

            </RadioGroup>
        </div>
    );
}
