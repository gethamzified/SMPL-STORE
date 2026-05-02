"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Package, LogOut, LayoutDashboard, ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { outlinedBorder } from "@/lib/outline";

export function AccountSidebar() {
    const pathname = usePathname();
    const { wishlistCount } = useWishlist();

    return (
        <aside className="w-full lg:w-64 shrink-0 space-y-8 lg:border-r lg:border-[#1a1a1a] lg:pr-8 mb-8 lg:mb-0">
            <div className="hidden lg:block">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Menu</h2>
            </div>

            <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
                <Link
                    href="/account"
                    className={cn(
                        `flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${outlinedBorder}`,
                        pathname === "/account"
                            ? "bg-black text-white border-black"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                    )}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    Overview
                </Link>

                <Link
                    href="/account/orders"
                    className={cn(
                        `flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${outlinedBorder}`,
                        pathname.startsWith("/account/orders")
                            ? "bg-black text-white border-black"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                    )}
                >
                    <Package className="w-4 h-4" />
                    Orders
                </Link>

                <Link
                    href="/account/wishlist"
                    className={cn(
                        `flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${outlinedBorder}`,
                        pathname === "/account/wishlist"
                            ? "bg-black text-white border-black"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                    )}
                >
                    <Heart className="w-4 h-4" />
                    Wishlist
                    {wishlistCount > 0 && (
                        <span className="ml-auto bg-black text-white text-xs font-bold px-2 py-0.5 border border-black">
                            {wishlistCount}
                        </span>
                    )}
                </Link>
            </nav>

            <div className="hidden lg:block pt-8 border-t border-[#1a1a1a]">
                <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Shopping</h2>
                <Link
                    href="/shop"
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 hover:text-black transition-colors ${outlinedBorder}`}
                >
                    <ShoppingBag className="w-4 h-4" />
                    Continue Shopping
                </Link>
            </div>

            <div className="hidden lg:block pt-4">
                <form action="/api/auth/signout" method="post">
                    <button className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors ${outlinedBorder}`}>
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </form>
            </div>
        </aside>
    );
}
