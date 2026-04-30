
import { Product, ProductVariant } from "@/lib/types";

// ==========================================
// PRICE LOGIC
// ==========================================

export function calculateProductPrice(product: Product | Partial<Product>): {
    price: number;
    salePrice: number | null;
    isOnSale: boolean;
    finalPrice: number;
    discountPercentage: number;
} {
    const price = product.price || 0;
    const salePrice = product.sale_price || null;
    const isOnSale = salePrice !== null && salePrice < price && salePrice >= 0;

    return {
        price,
        salePrice,
        isOnSale,
        finalPrice: isOnSale ? salePrice! : price,
        discountPercentage: isOnSale ? Math.round(((price - salePrice!) / price) * 100) : 0
    };
}

// ==========================================
// STOCK LOGIC
// Stock is now stored in inventory_levels, not on products.
// These functions accept an optional inventory parameter.
// ==========================================

export function isOutOfStock(product: Product | Partial<Product>, inventoryAvailable?: number): boolean {
    // If inventory is provided, use it; otherwise assume out of stock
    return (inventoryAvailable ?? 0) <= 0;
}

export function hasSufficientStock(product: Product | Partial<Product>, quantity: number = 1, inventoryAvailable?: number): boolean {
    return (inventoryAvailable ?? 0) >= quantity;
}

// ==========================================
// VALIDATION LOGIC
// ==========================================

export type ProductValidationResult = {
    isValid: boolean;
    error?: string;
};

export function validateProductData(data: {
    title?: string;
    slug?: string;
    price?: number;
}): ProductValidationResult {
    if (data.title && data.title.trim().length < 2) {
        return { isValid: false, error: "Product title must be at least 2 characters" };
    }

    if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
        return { isValid: false, error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only." };
    }

    if (data.price !== undefined && data.price < 0) {
        return { isValid: false, error: "Price cannot be negative" };
    }

    return { isValid: true };
}
