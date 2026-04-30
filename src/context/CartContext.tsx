"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { validateCartItems } from "@/lib/api/products";
import { CartValidationItem } from "@/lib/types";
import { checkVariantStock } from "@/actions/stock";

export type CartItem = {
  id: string; // Unique key for cart (e.g. "prod_1-var_2")
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  slug: string;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, openCart?: boolean) => void;
  removeItem: (id: string, size?: string) => void;
  updateQuantity: (id: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ... imports
import { validateCart } from "@/actions/stock";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initial load and deferred validation
  useEffect(() => {
    setIsMounted(true);
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedItems: CartItem[] = JSON.parse(savedCart);
        setItems(parsedItems);

        // Defer non-critical validation to after LCP (3 seconds)
        // Checks strictly against server stock
        if (parsedItems.length > 0) {
          const timeoutId = setTimeout(async () => {
            // Validate against stock
            const validationParams = parsedItems.map(i => ({
              id: i.id,
              variantId: i.variantId, // Ensure mapped correctly
              quantity: i.quantity
            }));

            const { isValid, errors } = await validateCart(validationParams);

            if (!isValid) {
              // Adjust quantities or remove items
              let toastMessage = "";
              const updatedItems = parsedItems.map(item => {
                const error = errors.find(e => e.itemId === item.id);
                if (error) {
                  if (error.available === 0) {
                    toastMessage += `${item.name} is now out of stock. `;
                    return null; // Remove
                  } else {
                    toastMessage += `${item.name} quantity adjusted to ${error.available}. `;
                    return { ...item, quantity: error.available };
                  }
                }
                return item;
              }).filter(Boolean) as CartItem[];

              setItems(updatedItems);
              if (toastMessage) {
                toast.error("Cart Adjusted", { description: toastMessage });
              }
            }

            // Also re-validate prices if needed via separate API, but stock is priority here.
          }, 3000);

          return () => clearTimeout(timeoutId);
        }
      } catch (e) {
        console.error("Failed to parse cart from local storage");
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  const addItem = useCallback(async (newItem: Omit<CartItem, "quantity">, openCart: boolean = true) => {
    const currentItem = items.find(
      (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
    );
    const currentQty = currentItem ? currentItem.quantity : 0;
    const nextQty = currentQty + 1;

    try {
      if (newItem.variantId) {
        const stock = await checkVariantStock(newItem.variantId, nextQty);

        if (!stock.isAvailable) {
          toast.error("Out of Stock", {
            description: `Sorry, only ${stock.available} available.`
          });
          return;
        }
      }
    } catch (e) {
      console.error("Stock check failed", e);
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prevItems, { ...newItem, quantity: 1 }];
    });

    if (openCart) {
      setIsCartOpen(true);
      toast.success("Added to cart", {
        description: `${newItem.name} has been added to your cart.`
      });
    }
  }, [items]);

  const removeItem = useCallback((id: string, size?: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.size === size))
    );
  }, []);

  const updateQuantity = useCallback(async (id: string, size: string | undefined, quantity: number) => {
    if (quantity < 1) {
      removeItem(id, size);
      return;
    }

    // New: Check stock before increasing
    const currentItem = items.find(i => i.id === id && i.size === size);
    if (currentItem && quantity > currentItem.quantity) {
      // Increasing
      if (currentItem.variantId) {
        try {
          const stock = await checkVariantStock(currentItem.variantId, quantity);
          if (!stock.isAvailable) {
            toast.error("Limit Reached", {
              description: `Only ${stock.available} available in stock.`
            });
            return; // Do not update
          }
        } catch (e) { console.error(e); }
      }
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.size === size ? { ...item, quantity } : item
      )
    );
  }, [removeItem, items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const cartTotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);

  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  }), [items, addItem, removeItem, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
