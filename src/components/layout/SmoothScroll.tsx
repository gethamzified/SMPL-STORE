"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

/**
 * SmoothScroll - Client Component
 * 
 * Provides "buttery" inertial scrolling using Lenis.
 * Desktop-only: mobile devices already have native momentum scrolling,
 * and Lenis adds ~10KB JS + can degrade INP on touch devices.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check once on mount — no need for resize listener since layout doesn't change device type
    setIsDesktop(window.matchMedia('(min-width: 1024px)').matches);
  }, []);

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1,
        infinite: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
