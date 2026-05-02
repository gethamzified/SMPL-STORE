"use client";

import { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Minus,
    Plus,
    Heart,
    Share2,
    Ruler,
    Truck,
    Clock,
    Zap,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { cn, getColorValue } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { StickyAddToCart } from "./StickyAddToCart";
import { SizeGuideModal } from "./SizeGuideModal";
import { STANDARD_SIZES } from "@/lib/logic/variant-generator";

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const formatCurrency = useFormatCurrency();
    const router = useRouter();

    // State
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [isDescOpen, setIsDescOpen] = useState(false);


    const { addItem } = useCart();

    // Realtime Product State
    const [liveProduct, setLiveProduct] = useState(product);

    // Initial sync
    useEffect(() => {
        setLiveProduct(product);
    }, [product]);

    // Supabase Realtime Subscription for Inventory
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase.channel(`product-inventory-${product.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'inventory_levels'
                },
                (payload) => {
                    const newStock = payload.new as { variant_id: string; available: number };

                    setLiveProduct((current) => {
                        // Check if update is relevant to this product
                        const isRelevant = current.variants?.some(v => v.id === newStock.variant_id);
                        if (!isRelevant) return current;

                        // Update specific variant inventory
                        const updatedVariants = current.variants?.map(v => {
                            if (v.id === newStock.variant_id) {
                                return { ...v, inventory_quantity: newStock.available };
                            }
                            return v;
                        });

                        return { ...current, variants: updatedVariants };
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [product.id]);

    // Initial Stock Fetch (Client-side) to ensure freshness
    useEffect(() => {
        const fetchStock = async () => {
            if (!product.variants || product.variants.length === 0) return;

            const supabase = createClient();
            const variantIds = product.variants.map(v => v.id);

            const { data, error } = await supabase
                .from('inventory_levels')
                .select('variant_id, available')
                .in('variant_id', variantIds);

            if (error || !data) {
                console.error('Error fetching initial stock:', error);
                return;
            }

            // Aggregate stock by variant_id
            const stockMap: Record<string, number> = {};
            for (const record of data) {
                stockMap[record.variant_id] = (stockMap[record.variant_id] || 0) + (record.available || 0);
            }

            setLiveProduct(current => {
                const updatedVariants = current.variants?.map(v => ({
                    ...v,
                    inventory_quantity: stockMap[v.id] ?? v.inventory_quantity ?? 0
                }));
                return { ...current, variants: updatedVariants };
            });
        };

        fetchStock();
    }, [product.id, product.variants]);

    // Default Options - supports both legacy options and new clothing variants
    useEffect(() => {
        if (Object.keys(selectedOptions).length > 0) return;

        const defaults: Record<string, string> = {};

        // New clothing variant system
        if (product.enable_color_variants && product.available_colors?.length) {
            defaults['Color'] = product.available_colors[0];
        }
        if (product.enable_size_variants && product.available_sizes?.length) {
            defaults['Size'] = product.available_sizes[0];
        }

        // Legacy options system (fallback)
        if (Object.keys(defaults).length === 0 && product.options) {
            product.options.forEach(opt => {
                if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
            });
        }

        if (Object.keys(defaults).length > 0) {
            setSelectedOptions(defaults);
        }
    }, [product.options, product.available_colors, product.available_sizes]);

    // Derived State (Variants, Price, Stock)
    const selectedVariant = useMemo(() => {
        if (!liveProduct.variants || liveProduct.variants.length === 0) return null;

        // New clothing variant system (color/size fields)
        if (liveProduct.enable_color_variants || liveProduct.enable_size_variants) {
            return liveProduct.variants.find(v => {
                // Resilient matching: If a flag is enabled but the variant lacks the corresponding data, 
                // we treat it as a match to prevent hard-locking the UI due to configuration errors.
                const colorMatch = !product.enable_color_variants ||
                    !v.color ||
                    v.color === selectedOptions['Color'] ||
                    !selectedOptions['Color'];

                const sizeMatch = !product.enable_size_variants ||
                    !v.size ||
                    v.size === selectedOptions['Size'] ||
                    !selectedOptions['Size'];

                const isActive = v.status !== 'disabled';
                return colorMatch && sizeMatch && isActive;
            }) || null;
        }

        // Legacy option system (option1/2/3 fields)
        return liveProduct.variants.find(v => {
            const match1 = !v.option1_name || v.option1_value === selectedOptions[v.option1_name];
            const match2 = !v.option2_name || v.option2_value === selectedOptions[v.option2_name];
            const match3 = !v.option3_name || v.option3_value === selectedOptions[v.option3_name];
            return match1 && match2 && match3;
        }) || null;
    }, [selectedOptions, liveProduct.variants, product.enable_color_variants, product.enable_size_variants]);

    // Helper to check if a specific option value is out of stock
    const isOptionOutOfStock = (optionType: 'Color' | 'Size', value: string): boolean => {
        if (!liveProduct.variants || !product.track_inventory) return false;

        const relevantVariants = liveProduct.variants.filter(v => {
            if (optionType === 'Color') {
                const colorMatch = v.color === value || (!v.color && !product.available_colors?.length);
                const sizeMatch = !product.enable_size_variants || v.size === selectedOptions['Size'] || !v.size;
                return colorMatch && sizeMatch;
            } else {
                const sizeMatch = v.size === value || (!v.size && !product.available_sizes?.length);
                const colorMatch = !product.enable_color_variants || v.color === selectedOptions['Color'] || !v.color;
                return colorMatch && sizeMatch;
            }
        });

        if (relevantVariants.length === 0) return false;

        return relevantVariants.every(v =>
            v.status === 'disabled' || (v.inventory_quantity ?? 0) <= 0
        );
    };

    const currentPrice = selectedVariant?.price ?? product.price;
    const currentSalePrice = selectedVariant?.sale_price ?? product.sale_price;
    const hasSale = !!currentSalePrice && currentSalePrice < currentPrice;
    const currentStock = selectedVariant?.inventory_quantity ?? 0;

    // Fix: If no variant is selected, check if ANY variant has stock.
    // Otherwise it defaults to 0 and shows "Sold Out" during SSR/initial render.
    const isOutOfStock = useMemo(() => {
        if (!product.track_inventory) return false;
        if (product.allow_backorder) return false;

        if (selectedVariant) {
            return currentStock <= 0;
        }

        // No variant selected: Check if all variants are OOS
        if (liveProduct.variants && liveProduct.variants.length > 0) {
            return liveProduct.variants.every(v => (v.inventory_quantity ?? 0) <= 0);
        }

        // Fallback for simple products (though DB seems to use variants for all)
        return (product.stock ?? 0) <= 0;
    }, [product.track_inventory, product.allow_backorder, selectedVariant, currentStock, liveProduct.variants, product.stock]);

    const isLowStock = useMemo(() => {
        if (!product.track_inventory) return false;
        if (isOutOfStock) return false;
        if (selectedVariant) {
            return currentStock > 0 && currentStock <= 5;
        }
        return false;
    }, [product.track_inventory, isOutOfStock, selectedVariant, currentStock]);



    // Handlers
    const handleOptionSelect = (name: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [name]: value }));
    };

    const handleAddToCart = (openCart: boolean = true) => {
        const options = product.options || [];
        const missingOptions = options.filter(opt => !selectedOptions[opt.name]);

        if (missingOptions.length > 0) {
            toast.error(`Please select ${missingOptions[0].name}`);
            return false;
        }

        if (isOutOfStock) {
            if (isOutOfStock) {
                toast.error("Out of Stock");
                return false;
            }
        }

        // Optimistic: Set pending state immediately
        setIsPending(true);

        const variantId = selectedVariant?.id;
        const uniqueId = variantId ? `${product.id}-${variantId}` : product.id;
        const image = selectedVariant?.image_url || product.cover_image || "";

        addItem({
            id: uniqueId,
            productId: product.id,
            variantId: variantId,
            name: product.title,
            price: currentSalePrice || currentPrice,
            image: image,
            size: Object.values(selectedOptions).join(" / "),
            color: selectedOptions['Color'] || undefined,
            quantity: quantity,
            slug: product.slug,
        } as any, openCart);

        // Reset pending state after a brief delay for visual feedback
        setTimeout(() => setIsPending(false), 400);

        if (!openCart) return true; // For Buy Now logic
        return true;
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(!isFavorite ? "Saved to Wishlist" : "Removed from Wishlist");
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-500">
            {/* Title & Price Section - Compact */}
            <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-black leading-tight uppercase">
                    {product.title}
                </h1>
                
                <div className="flex items-center gap-3 pt-2 border-t-2 border-b-2 border-[#1a1a1a] py-2">
                    {hasSale ? (
                        <>
                            <span className="text-lg font-black text-brand-ascent uppercase">
                                RS. {formatCurrency(currentSalePrice).replace(/[^0-9.,]/g, '')}
                            </span>
                            <span className="text-xs text-black line-through font-bold uppercase">
                                RS. {formatCurrency(currentPrice).replace(/[^0-9.,]/g, '')}
                            </span>
                        </>
                    ) : (
                        <span className="text-lg font-black text-black uppercase">
                            RS{formatCurrency(currentPrice).replace(/[^0-9.,]/g, '')}
                        </span>
                    )}
                </div>
            </div>

            {/* Stock Status Badge - Inline */}
            <div className="flex items-center gap-2 py-2 text-[9px] font-bold uppercase tracking-widest">
                {isOutOfStock ? (
                    <>
                        <div className="w-1.5 h-1.5 bg-brand-ascent border border-[#1a1a1a]"></div>
                        <span className="text-brand-ascent">Out of Stock</span>
                    </>
                ) : isLowStock ? (
                    <>
                        <div className="w-1.5 h-1.5 bg-brand-ascent border border-[#1a1a1a]"></div>
                        <span className="text-brand-ascent">Limited ({currentStock})</span>
                    </>
                ) : (
                    <>
                        <div className="w-1.5 h-1.5 bg-brand-ascent border border-[#1a1a1a]"></div>
                        <span className="text-black">In Stock</span>
                    </>
                )}
            </div>

            {/* Short Description */}
            {product.short_description && (
                <p className="text-black text-xs font-medium leading-snug py-2 border-b border-[#1a1a1a] pb-2">
                    {product.short_description}
                </p>
            )}

            {/* Color Options - Compact Grid */}
            {product.enable_color_variants && product.available_colors && product.available_colors.length > 0 && (
                <div className="space-y-2 pt-2">
                    <span className="text-[8px] uppercase tracking-widest font-black text-black block">
                        Color: <span className="font-bold text-brand-ascent">{selectedOptions['Color']}</span>
                    </span>
                    <div className="flex flex-wrap gap-0 border-2 border-[#1a1a1a] w-fit">
                        {product.available_colors.map((color) => {
                            const outOfStock = isOptionOutOfStock('Color', color);
                            const isSelected = selectedOptions['Color'] === color;
                            const colorValue = getColorValue(color);

                            return (
                                <button
                                    key={color}
                                    onClick={() => !outOfStock && handleOptionSelect('Color', color)}
                                    disabled={outOfStock}
                                    title={color}
                                    className={cn(
                                        "w-10 h-10 transition-all duration-0 relative border-r-2 border-[#1a1a1a] last:border-r-0",
                                        isSelected ? "bg-brand-ascent p-0.5" : "hover:bg-neutral-100 p-1",
                                        outOfStock && "opacity-40 cursor-not-allowed bg-neutral-200"
                                    )}
                                >
                                    <div className="w-full h-full border border-[#1a1a1a]" style={{ backgroundColor: colorValue }} />
                                    {outOfStock && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-full h-px bg-brand-ascent -rotate-45" />
                                        </div>
                                    )}
                                    <span className="sr-only">{color}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Size Options - Compact Grid */}
            {product.enable_size_variants && product.available_sizes && product.available_sizes.length > 0 && (
                <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[8px] uppercase tracking-widest font-black text-black">Size: <span className="font-bold text-brand-ascent">{selectedOptions['Size']}</span></span>
                        <button
                            onClick={() => setShowSizeGuide(true)}
                            className="text-[8px] uppercase tracking-widest font-black text-black hover:text-brand-ascent transition-colors underline underline-offset-2"
                        >
                            Guide
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-0 border-t-2 border-l-2 border-[#1a1a1a]">
                        {STANDARD_SIZES.map((size) => {
                            const isEnabled = product.available_sizes?.includes(size);
                            if (!isEnabled) return null;
                            const outOfStock = isOptionOutOfStock('Size', size);
                            const isSelected = selectedOptions['Size'] === size;

                            return (
                                <button
                                    key={size}
                                    onClick={() => !outOfStock && handleOptionSelect('Size', size)}
                                    disabled={outOfStock}
                                    className={cn(
                                        "relative py-2 px-4 text-[9px] font-black uppercase transition-colors border-b-2 border-r-2 border-[#1a1a1a] min-w-[2.5rem] flex items-center justify-center h-10",
                                        isSelected
                                            ? "bg-brand-ascent text-white"
                                            : "bg-white text-black hover:bg-neutral-100",
                                        outOfStock && "text-neutral-400 bg-neutral-100 cursor-not-allowed"
                                    )}
                                >
                                    <span>{size}</span>
                                    {outOfStock && (
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            <svg className="w-full h-full text-brand-ascent" preserveAspectRatio="none">
                                                <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legacy Options */}
            {!(product.enable_color_variants || product.enable_size_variants) && product.options?.map((option) => (
                <div key={option.id} className="space-y-2 pt-2">
                    <div className="text-[8px] uppercase tracking-widest font-black text-black">
                        {option.name}
                    </div>
                    <div className="flex flex-wrap gap-0 border-t-2 border-l-2 border-[#1a1a1a]">
                        {option.values.map((value) => (
                            <button
                                key={value}
                                onClick={() => handleOptionSelect(option.name, value)}
                                   className={cn(
                                       "px-4 py-2 text-[9px] font-black uppercase tracking-wider transition-colors border-b-2 border-r-2 border-[#1a1a1a] min-w-[3rem]",
                                       selectedOptions[option.name] === value
                                           ? "bg-brand-ascent text-white"
                                           : "bg-white text-black hover:bg-neutral-100"
                                   )}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Quantity & CTA - Compact */}
            <div className="flex gap-3 pt-2">
                <div className="flex border-2 border-[#1a1a1a] h-10 flex-shrink-0">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                    >
                        <Minus className="w-3.5 h-3.5 text-black" />
                    </button>
                    <span className="px-4 py-2 text-center text-xs font-black border-l-2 border-r-2 border-[#1a1a1a] min-w-[3rem]">
                        {quantity}
                    </span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 hover:bg-neutral-100 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5 text-black" />
                    </button>
                </div>

                <button
                    onClick={() => handleAddToCart(true)}
                    disabled={isOutOfStock || isPending}
                    className={cn(
                        "flex-1 h-10 rounded-none uppercase tracking-widest font-black text-[9px] transition-colors border-2 border-[#1a1a1a]",
                        isOutOfStock
                            ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                            : "bg-brand-ascent text-white hover:bg-white hover:text-brand-ascent hover:border-[#1a1a1a]"
                    )}
                >
                    {isPending ? "ADDING" : isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
                </button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={toggleFavorite}
                    className="flex-1 py-2 px-3 h-10 rounded-none border-2 border-[#1a1a1a] hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Heart className={cn("w-3.5 h-3.5", isFavorite ? "fill-brand-ascent text-brand-ascent" : "text-black")} />
                    <span className="text-[8px] font-black uppercase">Save</span>
                </button>
                <button
                    className="flex-1 py-2 px-3 h-10 rounded-none border-2 border-[#1a1a1a] hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Share2 className="w-3.5 h-3.5 text-black" />
                    <span className="text-[8px] font-black uppercase">Share</span>
                </button>
            </div>

            {/* Size Guide Modal */}
            <SizeGuideModal
                isOpen={showSizeGuide}
                onClose={() => setShowSizeGuide(false)}
            />

            {/* Mobile Sticky Add to Cart */}
            <StickyAddToCart
                productName={product.title}
                price={currentPrice}
                salePrice={currentSalePrice}
                isOutOfStock={isOutOfStock === true}
                onAddToCart={() => handleAddToCart(true)}
                isPending={isPending}
            />
        </div>
    );
}
