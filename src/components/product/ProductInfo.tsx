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
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            {/* Header - Desktop */}
            <div className="space-y-2 hidden lg:block">
                <h1 className="text-xl md:text-2xl font-bold tracking-[0.05em] text-neutral-900 leading-tight uppercase">
                    {product.title}
                </h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                        RS.{formatCurrency(currentSalePrice || currentPrice).replace(/[^0-9.,]/g, '')}
                    </span>
                </div>
            </div>


            {/* Description Short */}
            <div className="prose prose-sm text-neutral-600 leading-relaxed">
                <p>{product.short_description || product.description?.slice(0, 150) + "..."}</p>
            </div>

            <div className="h-px bg-neutral-200" />

            {/* Clothing Variant Options (Color/Size) */}
            {product.enable_color_variants && product.available_colors && product.available_colors.length > 0 && (
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold text-neutral-900">
                        <span>Color: <span className="text-neutral-500 font-medium">{selectedOptions['Color']}</span></span>
                    </div>
                    <div className="flex flex-wrap gap-3">
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
                                        "w-8 h-8 rounded-full border border-neutral-200 transition-all duration-200 relative",
                                        isSelected
                                            ? "ring-2 ring-offset-2 ring-neutral-900 scale-110"
                                            : !outOfStock && "hover:scale-110 hover:border-neutral-400",
                                        outOfStock && "opacity-40 cursor-not-allowed",
                                        // Specific border for white/light colors to be visible
                                        (colorValue.toLowerCase() === '#ffffff' || colorValue.toLowerCase() === 'white') && "border-neutral-300"
                                    )}
                                    style={{ backgroundColor: colorValue }}
                                >
                                    {outOfStock && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-full h-px bg-neutral-400 -rotate-45" />
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
                        <span className="text-[11px] uppercase tracking-widest font-bold text-neutral-900">Select size</span>
                        <button
                            onClick={() => setShowSizeGuide(true)}
                            className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-bold text-neutral-900 hover:opacity-70 transition-opacity border-b border-black/20 pb-0.5"
                        >
                            <span className="flex gap-[1.5px] items-end h-2.5 mb-0.5">
                                <span className="w-[1px] h-1.5 bg-black"></span>
                                <span className="w-[1px] h-2.5 bg-black"></span>
                                <span className="w-[1px] h-2 bg-black"></span>
                            </span>
                            Sizing
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {STANDARD_SIZES.map((size) => {
                            const isEnabled = product.available_sizes?.includes(size);
                            const outOfStock = isEnabled && isOptionOutOfStock('Size', size);
                            const isSelected = selectedOptions['Size'] === size;

                            return (
                                <button
                                    key={size}
                                    onClick={() => isEnabled && !outOfStock && handleOptionSelect('Size', size)}
                                    disabled={!isEnabled || outOfStock}
                                    className={cn(
                                        "relative py-3 text-[11px] font-bold uppercase transition-all border min-w-[3.5rem] flex items-center justify-center h-12",
                                        isSelected
                                            ? "border-black bg-black text-white"
                                            : "border-neutral-200 hover:border-neutral-400 text-neutral-900",
                                        (!isEnabled || outOfStock) && "text-neutral-400 bg-neutral-50/50 cursor-not-allowed border-neutral-200"
                                    )}
                                >
                                    <span>{size}</span>

                                    {/* Diagonal Slash for Disabled/Out of Stock */}
                                    {(!isEnabled || outOfStock) && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <svg className="w-full h-full text-neutral-300" preserveAspectRatio="none">
                                                <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeWidth="1" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Model Info (Placeholder aesthetic) */}
                    <div className="pt-2 text-center text-[12px] text-neutral-500 italic">
                        Male Model: 6'0", wearing size M
                    </div>
                </div>
            )}

            {/* Legacy Options (fallback for products not using clothing variant system) */}
            {!(product.enable_color_variants || product.enable_size_variants) && product.options?.map((option) => (
                <div key={option.id} className="space-y-3">
                    <div className="flex justify-between items-center text-xs uppercase tracking-widest font-bold text-neutral-900">
                        <span>{option.name}: <span className="text-neutral-500 font-medium">{selectedOptions[option.name]}</span></span>
                        {option.name.toLowerCase() === 'size' && (
                            <button
                                onClick={() => setShowSizeGuide(true)}
                                className="flex items-center gap-1 hover:text-neutral-500 transition-colors underline underline-offset-4"
                            >
                                <Ruler className="w-3 h-3" /> Find Your Fit
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => (
                            <button
                                key={value}
                                onClick={() => handleOptionSelect(option.name, value)}
                                className={cn(
                                    "px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border min-w-[3rem]",
                                    selectedOptions[option.name] === value
                                        ? "border-black bg-white text-black font-bold"
                                        : "border-neutral-200 hover:border-neutral-400 text-neutral-900 bg-transparent"
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
                        "w-full h-12 rounded-none uppercase tracking-[0.2em] font-bold text-[11px] transition-all duration-300",
                        isOutOfStock
                            ? "bg-[#AFAFAF] text-white border-none cursor-not-allowed"
                            : "bg-black text-white hover:bg-neutral-800"
                    )}
                >
                    {isPending ? "Adding..." : isOutOfStock ? "SOLD OUT" : "ADD TO CART"}
                </Button>

                <p className="text-[11px] text-neutral-600 text-center">
                    <span className="underline cursor-pointer">Shipping</span> calculated at checkout.
                </p>

                {/* Availability Status */}
                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-medium uppercase tracking-wide">
                    {isOutOfStock ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-red-600">Out of Stock</span>
                        </>
                    ) : isLowStock ? (
                        <>
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </div>
                            <span className="text-amber-600">
                                Only {currentStock} left - Order Soon
                            </span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-green-600">In Stock & Ready to Ship</span>
                        </>
                    )}
                </div>
            </div>

            {/* Trust Badges */}
            <div className="space-y-4 pt-6 border-t border-neutral-100">
                <div className="flex items-center gap-4 text-neutral-700">
                    <Truck className="w-5 h-5 stroke-[1.5px]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Free shipping nationwide</span>
                </div>
                <div className="flex items-center gap-4 text-neutral-700">
                    <Zap className="w-5 h-5 stroke-[1.5px]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">Limited Drop · A One-Time Release</span>
                </div>
                {/* Availability Status */}
                <div className="flex items-center justify-center gap-2 pt-2">
                    {isOutOfStock ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-[11px] font-medium text-neutral-900">Out of stock</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-[11px] font-medium text-neutral-900">
                                {currentStock > 0 && currentStock <= 5 ? `Only ${currentStock} left` : "In stock"}
                            </span>
                        </>
                    )}
                    <button onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: product.title,
                                url: window.location.href
                            }).catch(() => { });
                        } else {
                            toast.success("Link copied to clipboard");
                            navigator.clipboard.writeText(window.location.href);
                        }
                    }}>
                        <Share2 className="w-3.5 h-3.5 text-neutral-500 ml-2 cursor-pointer hover:text-black transition-colors" />
                    </button>
                </div>
            </div>

            {/* Collapsible Tabs */}
            <div className="pt-4">
                <button
                    onClick={() => setIsDescOpen(!isDescOpen)}
                    className="w-full flex justify-between items-center py-4 border-t border-neutral-100 text-[11px] font-bold uppercase tracking-widest text-neutral-900"
                >
                    <span>Description</span>
                    <span>{isDescOpen ? "-" : "+"}</span>
                </button>
                {isDescOpen && (
                    <div className="pb-6 text-sm text-neutral-600 leading-relaxed animate-in fade-in slide-in-from-top-2">
                        {product.description || "No detailed description available."}
                    </div>
                )}
            </div>

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
