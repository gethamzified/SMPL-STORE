"use client";

import { useState } from "react";
import { X, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    productType?: string; // e.g., "tops", "bottoms", "shoes"
}

// Size data
const SIZE_DATA = {
    tops: {
        headers: ["Size", "Chest (in)", "Length (in)", "Shoulder (in)"],
        rows: [
            ["XS", "34-36", "26", "16"],
            ["S", "36-38", "27", "17"],
            ["M", "38-40", "28", "18"],
            ["L", "40-42", "29", "19"],
            ["XL", "42-44", "30", "20"],
            ["XXL", "44-46", "31", "21"],
        ]
    },
    bottoms: {
        headers: ["Size", "Waist (in)", "Length (in)", "Hip (in)"],
        rows: [
            ["28", "28", "40", "36"],
            ["30", "30", "40", "38"],
            ["32", "32", "41", "40"],
            ["34", "34", "41", "42"],
            ["36", "36", "42", "44"],
            ["38", "38", "42", "46"],
        ]
    }
} as const;

export function SizeGuideModal({ isOpen, onClose, productType = "tops" }: SizeGuideModalProps) {
    const [activeTab, setActiveTab] = useState<"tops" | "bottoms">((productType as any) === "bottoms" ? "bottoms" : "tops");
    const sizeData = SIZE_DATA[activeTab];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300"
            />

            {/* Modal Container */}
            <div
                className="bg-white max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl pointer-events-auto relative z-10 m-4 animate-in fade-in zoom-in-95 duration-300 ease-out-expo"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                        <Ruler className="w-5 h-5" />
                        <h2 className="text-lg font-bold tracking-tight">Size Guide</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center hover:bg-neutral-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-100">
                    <button
                        onClick={() => setActiveTab("tops")}
                        className={cn(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors relative",
                            activeTab === "tops"
                                ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black"
                                : "text-neutral-400 hover:text-neutral-600"
                        )}
                    >
                        Tops
                    </button>
                    <button
                        onClick={() => setActiveTab("bottoms")}
                        className={cn(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors relative",
                            activeTab === "bottoms"
                                ? "text-black after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-black"
                                : "text-neutral-400 hover:text-neutral-600"
                        )}
                    >
                        Bottoms
                    </button>
                </div>

                {/* Table */}
                <div className="p-6 overflow-auto max-h-[50vh]">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-200">
                                {(sizeData.headers as unknown as string[]).map((header, i) => (
                                    <th
                                        key={header}
                                        className={cn(
                                            "py-3 text-[10px] uppercase tracking-[0.1em] font-bold text-neutral-500",
                                            i === 0 ? "text-left" : "text-center"
                                        )}
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(sizeData.rows as unknown as string[][]).map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-b border-neutral-100 last:border-0"
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className={cn(
                                                "py-3",
                                                cellIndex === 0
                                                    ? "font-bold text-black"
                                                    : "text-center text-neutral-600"
                                            )}
                                        >
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Note */}
                <div className="p-6 bg-neutral-50 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 leading-relaxed">
                        All measurements are in inches. For the best fit, measure a similar garment
                        you already own and compare to our size chart.
                    </p>
                </div>
            </div>
        </div>
    );
}
