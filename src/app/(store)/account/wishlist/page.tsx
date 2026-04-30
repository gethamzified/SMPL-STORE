"use client";

import { useWishlist } from "@/context/WishlistContext";
import { FadeInView } from "@/components/animations/FadeInView";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
    const { items, removeItem, isLoading } = useWishlist();
    const formatCurrency = useFormatCurrency();
    const { addItem } = useCart();

    const handleAddToCart = (item: any) => {
        const product = item.product;
        if (!product) return;

        addItem({
            id: product.id,
            productId: product.id,
            name: product.title,
            price: product.sale_price || product.price,
            image: product.cover_image || "",
            size: "",
            quantity: 1,
            slug: product.slug,
        } as any, true);
    };

    const handleRemove = (productId: string, productTitle: string) => {
        removeItem(productId, productTitle);
    };

    if (isLoading) {
        return (
            <FadeInView>
                <div className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-2">
                        My Wishlist
                    </h1>
                    <p className="text-neutral-500 font-medium">Loading your saved items...</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-[3/4] bg-neutral-100 rounded-lg mb-4" />
                            <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-neutral-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </FadeInView>
        );
    }

    return (
        <FadeInView>
            <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-2">
                    My Wishlist
                </h1>
                <p className="text-neutral-500 font-medium">
                    {items.length === 0
                        ? "Your wishlist is empty"
                        : `${items.length} ${items.length === 1 ? "item" : "items"} saved`}
                </p>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 rounded-2xl">
                    <Heart className="w-16 h-16 mx-auto text-neutral-300 mb-6" />
                    <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
                    <p className="text-neutral-500 mb-8">
                        Save items you love by clicking the heart icon on products
                    </p>
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-neutral-800 transition-colors"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {items.map((item) => {
                        const product = item.product;
                        if (!product) return null;

                        const isSale = !!(product.sale_price && product.sale_price < product.price);

                        return (
                            <div key={item.id} className="group relative">
                                {/* Product Image */}
                                <div className="relative aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden mb-4">
                                    <Link href={`/product/${product.slug}`}>
                                        {product.cover_image ? (
                                            <Image
                                                src={product.cover_image}
                                                alt={product.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 50vw, 33vw"
                                                placeholder={(() => { const b = (product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined; return b?.[product.cover_image] ? "blur" as const : "empty" as const; })()}
                                                blurDataURL={((product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined)?.[product.cover_image]}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                                                <ShoppingBag className="w-8 h-8 text-neutral-400" />
                                            </div>
                                        )}
                                    </Link>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(product.id, product.title)}
                                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        aria-label="Remove from wishlist"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Quick Add to Cart */}
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-neutral-800"
                                    >
                                        Add to Cart
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div className="text-center">
                                    <Link href={`/product/${product.slug}`}>
                                        <h3 className="font-medium text-sm uppercase tracking-wide text-neutral-800 line-clamp-2 hover:opacity-60 transition-opacity">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <div className="mt-1.5 flex items-center justify-center gap-2 text-sm">
                                        {isSale ? (
                                            <>
                                                <span className="text-neutral-500 line-through">
                                                    {formatCurrency(product.price)}
                                                </span>
                                                <span className="font-bold text-black">
                                                    {formatCurrency(product.sale_price!)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="font-medium text-neutral-800">
                                                {formatCurrency(product.price)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </FadeInView>
    );
}
