"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface ScrollRevealProps {
    children: React.ReactNode;
    className?: string;
    once?: boolean;
    threshold?: number;
    rootMargin?: string;
}

/**
 * ScrollReveal - Client Component
 * 
 * Uses shared IntersectionObserver pool to detect when elements enter the viewport.
 * Adds 'is-visible' class to the container when in view.
 */
export function ScrollReveal({
    children,
    className,
    once = true,
    threshold = 0.01,
    rootMargin = "0px"
}: ScrollRevealProps) {
    const { ref, isVisible } = useScrollReveal({
        threshold,
        rootMargin,
        triggerOnce: once,
    });

    return (
        <div
            ref={ref}
            className={cn(
                "scroll-reveal group/reveal",
                isVisible ? "is-visible" : "is-hidden",
                className
            )}
        >
            {children}
        </div>
    );
}
