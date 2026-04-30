import { Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import { Suspense } from "react";

interface AsyncProductGridProps {
    productsPromise: Promise<Product[]> | PromiseLike<Product[]>;
}

export default async function AsyncProductGrid({ productsPromise }: AsyncProductGridProps) {
    // Await the data streaming in
    const products = await productsPromise;

    if (products.length === 0) {
        return (
            <div className="py-32 text-center col-span-full">
                <p className="text-xl font-light text-foreground mb-2 tracking-wide font-display">No pieces found.</p>
                <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Try adjusting your filters</p>
            </div>
        );
    }

    // Client component wrapper for animations needs to be separated or we can just use simple CSS animation class
    // But since this is a server component, we can't directly use framer-motion here unless we make it client or wrap the grid.
    // Let's create a Client Grid Wrapper defined below or imported.
    // For simplicity in this file without creating new files unless necessary, let's keep it simple or make a small client wrapper.
    // Actually, to follow the high-quality request, I should make a Client wrapper.

    return <ProductGridClient products={products} />;
}

import { ProductGridClient } from "./ProductGridClient";

