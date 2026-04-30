"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to = "/", children, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = typeof pathname === "string" && (pathname === to || (to !== "/" && pathname.startsWith(to)));

    return (
      <Link href={to} legacyBehavior>
        <a ref={ref} className={cn(className, isActive && activeClassName)} {...props}>
          {children}
        </a>
      </Link>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
