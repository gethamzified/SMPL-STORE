import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-[#1a1a1a] bg-background hover:bg-neutral-50 hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-neutral-50 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-brand-ascent text-white font-black tracking-[0.2em] uppercase text-[11px] hover:bg-brand-ascent/90 transition-all",
        ctaOutline: "border border-[#1a1a1a] bg-transparent text-brand-ascent font-black tracking-[0.2em] uppercase text-[11px] hover:bg-brand-ascent hover:text-white transition-all",
        ctaHero: "bg-white text-black font-black tracking-[0.2em] uppercase text-[11px] hover:bg-white/90 transition-all",
        ctaHeroOutline: "border border-white bg-transparent text-white font-black tracking-[0.2em] uppercase text-[11px] hover:bg-white hover:text-black transition-all",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
