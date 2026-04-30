"use client";

import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/context/CartContext";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useState, useEffect, useCallback } from "react";
// import { useDebounce } from "@/hooks/use-debounce"; // Removed unused import

function DebouncedCartItem({ item }: { item: CartItem }) {
    const { updateQuantity, removeItem } = useCart();
    const formatCurrency = useFormatCurrency();
    const [quantity, setQuantity] = useState(item.quantity);

    // Sync from prop if external change happens
    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);

    // Debounce the update call
    useEffect(() => {
        if (quantity === item.quantity) return;

        const timer = setTimeout(() => {
            updateQuantity(item.id, item.size, quantity);
        }, 500);

        return () => clearTimeout(timer);
    }, [quantity, item.id, item.size, item.quantity, updateQuantity]);

    const handleIncrement = () => setQuantity(q => q + 1);
    const handleDecrement = () => setQuantity(q => (q > 1 ? q - 1 : 1));

    return (
        <div className="flex gap-4">
            <div className="relative w-20 h-24 bg-secondary/30 flex-shrink-0 overflow-hidden">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                    />
                ) : (
                    <div className="w-full h-full bg-neutral-200" />
                )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-body font-black text-[11px] uppercase tracking-widest leading-tight">{item.name}</h3>
                        {item.size && (
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Size: {item.size}</p>
                        )}
                    </div>
                    <p className="font-body font-black text-sm">{formatCurrency(item.price)}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center border border-input">
                    <button
                        onClick={handleDecrement}
                        className="p-1 hover:bg-secondary transition-colors"
                        disabled={quantity <= 1}
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-mono">{quantity}</span>
                    <button
                        onClick={handleIncrement}
                        className="p-1 hover:bg-secondary transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
                <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export function CartContents({ onClose }: { onClose: () => void }) {
    const formatCurrency = useFormatCurrency();
    const { items, cartTotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
                <ShoppingBag className="w-16 h-16 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground text-lg">Your bag is empty</p>
                <Button variant="outline" onClick={onClose} className="uppercase tracking-widest">
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <>
            <ScrollArea className="flex-1 -mx-6 px-6 my-4">
                <div className="space-y-6">
                    {items.map((item: CartItem) => (
                        <DebouncedCartItem key={`${item.id}-${item.size}`} item={item} />
                    ))}
                </div>
            </ScrollArea>

            <div className="space-y-4 pt-4 mt-auto">
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="font-body font-black uppercase tracking-widest text-xs">Subtotal</span>
                    <span className="font-body font-black text-lg">{formatCurrency(cartTotal)}</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">
                    Shipping and taxes calculated at checkout.
                </p>
                <Button variant="cta" size="xl" className="w-full" asChild>
                    <Link href="/checkout" onClick={onClose}>
                        Continue to Checkout
                    </Link>
                </Button>

                <Button
                    variant="cta"
                    size="xl"
                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center gap-2 border-none"
                    asChild
                >
                    <a
                        href={`https://wa.me/923294194144?text=${encodeURIComponent(
                            `Hi SMPL! I'd like to order:\n${items.map(item => `- ${item.name} (${item.size || 'No Size'}) x ${item.quantity}`).join('\n')}\n\nTotal: ${formatCurrency(cartTotal)}\n\nPlease help me complete my order.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Order on WhatsApp
                    </a>
                </Button>
            </div>
        </>
    );
}
