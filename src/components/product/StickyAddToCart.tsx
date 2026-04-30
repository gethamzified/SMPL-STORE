import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useCart } from "@/context/CartContext";

interface StickyAddToCartProps {
    productName: string;
    price: number;
    salePrice?: number | null;
    isOutOfStock: boolean;
    onAddToCart: () => void;
    isPending?: boolean;
}

export function StickyAddToCart({
    productName,
    price,
    salePrice,
    isOutOfStock,
    onAddToCart,
    isPending = false
}: StickyAddToCartProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const formatCurrency = useFormatCurrency();
    const { isCartOpen } = useCart();
    const displayPrice = salePrice && salePrice < price ? salePrice : price;

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            // Show after scrolling past 400px (typically past the main Add to Cart button)
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted || isCartOpen) return null;

    return createPortal(
        <div
            className={cn(
                "fixed bottom-0 left-0 right-0 z-[999] md:hidden",
                "bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
                "transform transition-transform duration-300 ease-out",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
            style={{ willChange: 'transform' }} // Optimization
        >
            <div className="flex items-center gap-4 px-4 py-3 safe-area-bottom">
                {/* Price Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 truncate">
                        {productName}
                    </p>
                    <p className="font-bold text-lg tracking-tight">
                        {formatCurrency(displayPrice)}
                    </p>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={onAddToCart}
                    disabled={isOutOfStock || isPending}
                    className={cn(
                        "flex items-center justify-center gap-2 px-6 py-3",
                        "bg-black text-white text-xs font-bold uppercase tracking-widest",
                        "active:scale-95 transition-all disabled:opacity-50",
                        "min-w-[140px]"
                    )}
                >
                    <ShoppingBag className="w-4 h-4" />
                    {isPending ? "Adding..." : isOutOfStock ? "Sold Out" : "Add to Bag"}
                </button>
            </div>
        </div>,
        document.body
    );
}
