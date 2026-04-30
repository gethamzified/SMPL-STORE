"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { QuickViewProvider } from "@/context/QuickViewContext";
import dynamic from "next/dynamic";

const DiscountPopup = dynamic(() => import("@/components/layout/DiscountPopup").then(mod => mod.DiscountPopup), {
    ssr: false
});

export function StoreProviders({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <WishlistProvider>
                <QuickViewProvider>
                    {children}
                    <DiscountPopup />
                </QuickViewProvider>
            </WishlistProvider>
        </CartProvider>
    );
}
