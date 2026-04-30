"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckoutProgressProps {
    currentStep: number;
    steps: { label: string; description?: string }[];
}

export function CheckoutProgress({ currentStep, steps }: CheckoutProgressProps) {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between relative">
                {/* Progress Line Background */}
                <div className="absolute left-0 right-0 top-4 h-[2px] bg-neutral-200" />

                {/* Progress Line Filled */}
                <div
                    className="absolute left-0 top-4 h-[2px] bg-black transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
                />

                {/* Step Indicators */}
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                        <div
                            key={step.label}
                            className="relative flex flex-col items-center z-10"
                        >
                            {/* Circle */}
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                    "text-xs font-bold",
                                    isCompleted
                                        ? "bg-black text-white"
                                        : isCurrent
                                            ? "bg-black text-white ring-4 ring-black/10"
                                            : "bg-neutral-200 text-neutral-500"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "mt-2 text-[10px] uppercase tracking-[0.1em] font-bold transition-colors duration-300",
                                    isCurrent || isCompleted ? "text-black" : "text-neutral-400"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
