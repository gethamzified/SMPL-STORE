"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

export default function ShopSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const [isSearching, setIsSearching] = useState(false);

    // Initial sync
    useEffect(() => {
        setQuery(searchParams.get("q") || "");
    }, [searchParams]);

    // Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only push if different (and handle empty case)
            const currentQ = searchParams.get("q") || "";
            if (query !== currentQ) {
                setIsSearching(true);
                const newParams = new URLSearchParams(searchParams.toString());
                if (query) {
                    newParams.set("q", query);
                } else {
                    newParams.delete("q");
                }
                router.push(`/shop?${newParams.toString()}`);
                // We don't have a callback for "navigation complete" easily in app dir
                // but we can infer filtering is happening.
                // Actually, isSearching serves as a visual cue.
                setTimeout(() => setIsSearching(false), 500);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query, router, searchParams]);

    return (
        <div className="relative w-full max-w-xl mx-auto mb-10">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full px-5 py-4 pl-12 bg-white border border-neutral-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-neutral-300 transition-all text-lg placeholder:text-neutral-400"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />

                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-neutral-400" />
                    </button>
                )}

                {isSearching && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                    </div>
                )}
            </div>

        </div>
    );
}
