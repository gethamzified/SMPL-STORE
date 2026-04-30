"use client";

import { ArrowUp } from "lucide-react";

/**
 * ScrollToTopButton - Client Component Island
 * 
 * Minimal client component for scroll-to-top interactivity.
 * Extracted from Footer to allow Footer to be a Server Component.
 */
export function ScrollToTopButton() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors group"
        >
            Back to Top
            <ArrowUp className="w-3 h-3 group-hover:-translate-y-1 transition-transform" />
        </button>
    );
}
