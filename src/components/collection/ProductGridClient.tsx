"use client";


import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/types";

interface ProductGridClientProps {
    products: Product[];
}

export function ProductGridClient({ products }: ProductGridClientProps) {
    return (
        <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 gap-x-3 md:gap-x-4"
        >
            {products.map((product, index) => (
                <div
                    key={product.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                    <ProductCard
                        {...product}
                        priority={index < 3}
                    />
                </div>
            ))}
        </div>
    );
}
