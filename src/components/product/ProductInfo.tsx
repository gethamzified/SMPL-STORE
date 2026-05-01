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
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black leading-none uppercase">
                    {product.title}
                </h1>
                
                <div className="flex items-center gap-4 border-t border-b border-[#1a1a1a] py-4">
                    {hasSale ? (
                        <>
                            <span className="text-xl font-bold text-[#d95e32] uppercase">
                                RS. {formatCurrency(currentSalePrice).replace(/[^0-9.,]/g, '')}
                            </span>
                            <span className="text-sm text-black line-through font-medium uppercase">
                                RS. {formatCurrency(currentPrice).replace(/[^0-9.,]/g, '')}
                            </span>
                        </>
                    ) : (
                        <span className="text-xl font-bold text-black uppercase">
                            RS. {formatCurrency(currentPrice).replace(/[^0-9.,]/g, '')}
                        </span>
                    )}
                </div>
            </div>

            {/* Description Short */}
            {product.short_description && (
                <div className="text-black text-sm font-medium leading-relaxed">
                    <p>{product.short_description}</p>
                </div>
            )}

            {/* Clothing Variant Options (Color/Size) */}
            {product.enable_color_variants && product.available_colors && product.available_colors.length > 0 && (
                <div className="space-y-4">
                    <div className="text-[11px] uppercase tracking-widest font-bold text-black">
                        Color: {selectedOptions['Color']}
                    </div>
                    <div className="flex flex-wrap gap-0 border border-[#1a1a1a] w-fit">
                        {product.available_colors.map((color, index) => {
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
                                        "w-12 h-12 transition-all duration-0 relative border-r border-[#1a1a1a] last:border-r-0",
                                        isSelected ? "bg-[#1a1a1a] p-1" : "hover:bg-neutral-100 p-2",
                                        outOfStock && "opacity-40 cursor-not-allowed bg-neutral-200"
                                    )}
                                >
                                    <div className="w-full h-full border border-[#1a1a1a]" style={{ backgroundColor: colorValue }} />
                                    {outOfStock && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-full h-px bg-black -rotate-45" />
                                        </div>
                                    )}
                                    <span className="sr-only">{color}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {product.enable_size_variants && product.available_sizes && product.available_sizes.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-[11px] uppercase tracking-widest font-bold text-black">Size</span>
                        <button
                            onClick={() => setShowSizeGuide(true)}
                            className="text-[10px] uppercase tracking-widest font-bold text-black hover:text-[#d95e32] transition-colors underline underline-offset-4"
                        >
                            Size Guide
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-0 border-t border-l border-[#1a1a1a]">
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
                                        "relative py-3 px-6 text-[11px] font-bold uppercase transition-colors border-b border-r border-[#1a1a1a] min-w-[3.5rem] flex items-center justify-center h-12",
                                        isSelected
                                            ? "bg-black text-white"
                                            : "bg-white text-black hover:bg-neutral-100",
                                        outOfStock && "text-neutral-400 bg-neutral-100 cursor-not-allowed"
                                    )}
                                >
                                    <span>{size}</span>

                                    {/* Diagonal Slash for Out of Stock */}
                                    {outOfStock && (
                                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                            <svg className="w-full h-full text-[#1a1a1a]" preserveAspectRatio="none">
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
                <div key={option.id} className="space-y-4">
                    <div className="text-[11px] uppercase tracking-widest font-bold text-black">
                        {option.name}
                    </div>
                    <div className="flex flex-wrap gap-0 border-t border-l border-[#1a1a1a]">
                        {option.values.map((value) => (
                            <button
                                key={value}
                                onClick={() => handleOptionSelect(option.name, value)}
                                className={cn(
                                    "px-6 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors border-b border-r border-[#1a1a1a] min-w-[4rem]",
                                    selectedOptions[option.name] === value
                                        ? "bg-black text-white"
                                        : "bg-white text-black hover:bg-neutral-100"
                                )}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Actions */}
            <div className="flex flex-col gap-4 pt-4">
                <Button
                    onClick={() => handleAddToCart(true)}
                    disabled={isOutOfStock || isPending}
                    className={cn(
                        "w-full h-14 rounded-none uppercase tracking-widest font-bold text-[12px] transition-colors border border-[#1a1a1a]",
                        isOutOfStock
                            ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
                            : "bg-black text-white hover:bg-white hover:text-black"
                    )}
                >
                    {isPending ? "ADDING..." : isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
                </Button>

                {/* Availability Status */}
                <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-bold uppercase tracking-widest">
                    {isOutOfStock ? (
                        <>
                            <div className="w-1.5 h-1.5 bg-[#d95e32]"></div>
                            <span className="text-[#d95e32]">Out of Stock</span>
                        </>
                    ) : isLowStock ? (
                        <>
                            <div className="w-1.5 h-1.5 bg-amber-500"></div>
                            <span className="text-amber-600">
                                Limited Stock ({currentStock})
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="w-1.5 h-1.5 bg-black"></div>
                            <span className="text-black">In Stock</span>
                        </>
                    )}
                </div>
            </div>

            {/* Spacer */}
            <div className="h-4" />

            {/* Mobile Sticky Add to Cart */}
            <StickyAddToCart
                productName={product.title}
                price={currentPrice}
                salePrice={currentSalePrice}
                isOutOfStock={isOutOfStock === true}
                onAddToCart={() => handleAddToCart(true)}
                isPending={isPending}
            />

            {/* Size Guide Modal */}
            <SizeGuideModal
                isOpen={showSizeGuide}
                onClose={() => setShowSizeGuide(false)}
            />
        </div>
    );
}
