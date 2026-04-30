import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Premium CSS-only Magnetic Button
 * Uses standard hover metrics to simulate the magnetic pull.
 */
export const MagneticButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group/magnetic relative inline-flex items-center justify-center transition-all duration-300 ease-out-expo active:scale-95 hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
      {...props}
    >
      <span className="relative z-10 block transition-transform duration-300 group-hover/magnetic:scale-105">
        {children}
      </span>
    </button>
  );
});

MagneticButton.displayName = "MagneticButton";