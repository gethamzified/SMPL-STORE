"use client"

import * as React from "react"

/**
 * Custom hook for responsive breakpoint detection
 * SSR-safe implementation that defaults to false on server
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = React.useState(false)

    React.useEffect(() => {
        const mediaQuery = window.matchMedia(query)

        // Set initial value
        setMatches(mediaQuery.matches)

        // Create event listener
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches)
        }

        // Add listener
        mediaQuery.addEventListener("change", handler)

        // Cleanup
        return () => {
            mediaQuery.removeEventListener("change", handler)
        }
    }, [query])

    return matches
}

/**
 * Predefined breakpoint hooks for common use cases
 */
export function useIsDesktop() {
    return useMediaQuery("(min-width: 768px)")
}

export function useIsMobile() {
    return useMediaQuery("(max-width: 767px)")
}

export function useIsLargeDesktop() {
    return useMediaQuery("(min-width: 1024px)")
}
