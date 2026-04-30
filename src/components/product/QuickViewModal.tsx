"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { toast } from "sonner";
import { useState } from "react";

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const { addItem } = useCart();
    const [selectedSize, setSelectedSize] = useState<string>("");

    // Derived state for inventory handling
    const hasSizes = product?.variants && product.variants.length > 0;
    const isOutOfStock = product?.stock === 0;
    const canAddToCart = !isOutOfStock && (!hasSizes || (hasSizes && selectedSize !== ""));

    if (!isOpen || !product) return null;

    const handleAddToCart = () => {
        if (hasSizes && !selectedSize) {
            toast.error("Please select a size");
            return;
        }

        const variantId = product.variants?.find(v => v.size === selectedSize)?.id;
        const cartItemId = variantId ? `${product.id}-${variantId}` : product.id;

        addItem({
            id: cartItemId,
            productId: product.id,
            variantId: variantId,
            name: product.title,
            slug: product.slug,
            price: product.price,
            image: product.cover_image || "",
            size: selectedSize || undefined
        });

        toast.success("Added to cart");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 ease-out"
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out-expo">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full hover:bg-black hover:text-white transition-all shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Image */}
                <div className="w-full md:w-1/2 bg-neutral-100 relative h-[40vh] md:h-auto overflow-hidden">
                    {product.cover_image ? (
                        <Image
                            src={product.cover_image}
                            alt={product.title}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            No image
                        </div>
                    )}
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
                    <div className="mb-2">
                        {product.product_type && (
                            <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                                {product.product_type}
                            </span>
                        )}
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{product.title}</h2>
                        <p className="text-xl text-neutral-600 mt-2">{formatCurrency(product.price)}</p>
                    </div>

                    <div className="prose prose-sm text-neutral-500 mt-6 max-h-[150px] overflow-y-auto custom-scrollbar">
                        <p>{product.description}</p>
                    </div>

                    {/* Size Selection */}
                    {hasSizes && (
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-black">Size</span>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {product.variants?.map((variant) => {
                                    const isAvailable = (variant.inventory_quantity || variant.stock || 0) > 0;
                                    return (
                                        <button
                                            key={variant.id}
                                            disabled={!isAvailable}
                                            onClick={() => setSelectedSize(variant.size || "")}
                                            className={`py-3 text-xs font-medium uppercase tracking-wider border transition-all ${selectedSize === variant.size
                                                ? 'border-black bg-black text-white'
                                                : isAvailable
                                                    ? 'border-neutral-200 text-neutral-900 hover:border-black'
                                                    : 'border-neutral-100 text-neutral-300 cursor-not-allowed bg-neutral-50 relative overflow-hidden'
                                                }`}
                                        >
                                            {variant.size}
                                            {!isAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-[1px] bg-neutral-200 rotate-45 transform origin-center" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stock Warning */}
                    {(product.stock || 0) > 0 && (product.stock || 0) <= 5 && (
                        <p className="text-xs text-orange-600 font-medium mt-4 flex items-center gap-1.5 bg-orange-50 px-3 py-2 rounded-md border border-orange-100 w-fit">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            Only {product.stock} items left
                        </p>
                    )}

                    <div className="mt-auto pt-8">
                        <button
                            onClick={handleAddToCart}
                            disabled={!canAddToCart}
                            className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${canAddToCart
                                ? 'bg-black text-white hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98]'
                                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                }`}
                        >
                            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
