"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getWishlist, addToWishlist, removeFromWishlist } from "@/lib/api/customers";
import type { Product } from "@/lib/types";

export type WishlistItem = {
    id: string;
    product_id: string;
    product?: {
        id: string;
        title: string;
        slug: string;
        price: number;
        sale_price?: number | null;
        cover_image?: string | null;
        metadata?: Record<string, unknown>;
    };
};

interface WishlistContextType {
    items: WishlistItem[];
    isLoading: boolean;
    isInWishlist: (productId: string) => boolean;
    addItem: (productId: string, productName?: string) => Promise<void>;
    removeItem: (productId: string, productName?: string) => Promise<void>;
    toggleItem: (productId: string, productName?: string) => Promise<void>;
    wishlistCount: number;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Fetch wishlist on mount
    const fetchWishlist = useCallback(async () => {
        try {
            const result = await getWishlist();
            if (result.data) {
                setItems(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);

        // Only fetch wishlist if user is authenticated — no point fetching for anonymous visitors
        const hasAuthCookie = typeof document !== 'undefined' && document.cookie.includes('auth_token');
        if (!hasAuthCookie) {
            setIsLoading(false);
            return;
        }

        // Defer wishlist fetch to avoid blocking initial render
        const timeoutId = setTimeout(() => {
            fetchWishlist();
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [fetchWishlist]);

    const isInWishlist = useCallback((productId: string) => {
        return items.some((item) => item.product_id === productId);
    }, [items]);

    const addItem = useCallback(async (productId: string, productName?: string) => {
        // Optimistic update
        setItems((prev) => [...prev, { id: `temp-${productId}`, product_id: productId }]);

        try {
            const result = await addToWishlist(productId);
            if (result.error) {
                // Revert optimistic update
                setItems((prev) => prev.filter((item) => item.product_id !== productId));
                toast.error("Error", {
                    description: result.error,
                });
                return;
            }

            // Update with real data
            if (result.data) {
                setItems((prev) =>
                    prev.map((item) =>
                        item.product_id === productId ? result.data : item
                    )
                );
            }

            toast.success("Added to Wishlist", {
                description: productName ? `${productName} saved to your wishlist` : "Item saved to wishlist",
            });
        } catch (error) {
            // Revert optimistic update
            setItems((prev) => prev.filter((item) => item.product_id !== productId));
            toast.error("Error", {
                description: "Failed to add to wishlist",
            });
        }
    }, []);

    const removeItem = useCallback(async (productId: string, productName?: string) => {
        // Store item for potential rollback
        const removedItem = items.find((item) => item.product_id === productId);

        // Optimistic update
        setItems((prev) => prev.filter((item) => item.product_id !== productId));

        try {
            const result = await removeFromWishlist(productId);
            if (result.error) {
                // Revert optimistic update
                if (removedItem) {
                    setItems((prev) => [...prev, removedItem]);
                }
                toast.error("Error", {
                    description: result.error,
                });
                return;
            }

            toast.success("Removed from Wishlist", {
                description: productName ? `${productName} removed from wishlist` : "Item removed from wishlist",
            });
        } catch (error) {
            // Revert optimistic update
            if (removedItem) {
                setItems((prev) => [...prev, removedItem]);
            }
            toast.error("Error", {
                description: "Failed to remove from wishlist",
            });
        }
    }, [items]);

    const toggleItem = useCallback(async (productId: string, productName?: string) => {
        if (isInWishlist(productId)) {
            await removeItem(productId, productName);
        } else {
            await addItem(productId, productName);
        }
    }, [isInWishlist, addItem, removeItem]);

    const refreshWishlist = useCallback(async () => {
        setIsLoading(true);
        await fetchWishlist();
    }, [fetchWishlist]);

    const wishlistCount = items.length;

    return (
        <WishlistContext.Provider
            value={{
                items,
                isLoading,
                isInWishlist,
                addItem,
                removeItem,
                toggleItem,
                wishlistCount,
                refreshWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
