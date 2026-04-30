"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Shared IntersectionObserver Pool ───────────────────────────────────
// Instead of creating one IntersectionObserver per hook call (6+ on homepage),
// we share a single observer per unique (threshold, rootMargin) config.
// This is the same pattern Shopify Dawn uses for scroll-triggered animations.

type ObserverCallback = (entry: IntersectionObserverEntry) => void;

interface ObserverPoolEntry {
    observer: IntersectionObserver;
    callbacks: Map<Element, ObserverCallback>;
    refCount: number;
}

const observerPool = new Map<string, ObserverPoolEntry>();

function getObserverKey(threshold: number | number[], rootMargin: string): string {
    const t = Array.isArray(threshold) ? threshold.join(",") : String(threshold);
    return `${t}|${rootMargin}`;
}

function getSharedObserver(
    threshold: number | number[],
    rootMargin: string
): ObserverPoolEntry {
    const key = getObserverKey(threshold, rootMargin);
    const existing = observerPool.get(key);
    if (existing) {
        existing.refCount++;
        return existing;
    }

    const callbacks = new Map<Element, ObserverCallback>();

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                const cb = callbacks.get(entry.target);
                if (cb) cb(entry);
            }
        },
        { threshold, rootMargin }
    );

    const entry: ObserverPoolEntry = { observer, callbacks, refCount: 1 };
    observerPool.set(key, entry);
    return entry;
}

function releaseSharedObserver(threshold: number | number[], rootMargin: string) {
    const key = getObserverKey(threshold, rootMargin);
    const entry = observerPool.get(key);
    if (!entry) return;
    entry.refCount--;
    if (entry.refCount <= 0) {
        entry.observer.disconnect();
        entry.callbacks.clear();
        observerPool.delete(key);
    }
}

// ─── Hook ───────────────────────────────────────────────────────────────

interface ScrollRevealOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
}

export function useScrollReveal({
    threshold = 0.1,
    rootMargin = "0px",
    triggerOnce = true
}: ScrollRevealOptions = {}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const poolEntry = getSharedObserver(threshold, rootMargin);

        const callback: ObserverCallback = (entry) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (triggerOnce) {
                    poolEntry.observer.unobserve(element);
                    poolEntry.callbacks.delete(element);
                }
            } else if (!triggerOnce) {
                setIsVisible(false);
            }
        };

        poolEntry.callbacks.set(element, callback);
        poolEntry.observer.observe(element);

        return () => {
            poolEntry.observer.unobserve(element);
            poolEntry.callbacks.delete(element);
            releaseSharedObserver(threshold, rootMargin);
        };
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isVisible };
}
