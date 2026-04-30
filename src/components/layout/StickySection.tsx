import React, { ReactNode } from "react";

interface StickySectionProps {
    children: ReactNode;
    className?: string;
}

/**
 * Simplified Sticky Section
 * Uses pure CSS `position: sticky` instead of framer motion's JS scroll calculation.
 */
export default function StickySection({
    children,
    className = ""
}: StickySectionProps) {
    return (
        <section className={`relative h-screen sticky top-0 flex items-center justify-center overflow-hidden ${className}`}>
            <div className="relative w-full h-full transform-gpu origin-top transition-transform duration-700 ease-out">
                {children}
            </div>
        </section>
    );
}
