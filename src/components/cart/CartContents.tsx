"use client";

import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/context/CartContext";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

function DebouncedCartItem({ item }: { item: CartItem }) {
    const { updateQuantity, removeItem } = useCart();
    const formatCurrency = useFormatCurrency();
    const [quantity, setQuantity] = useState(item.quantity);

    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);

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
        <div className="grid grid-cols-[100px_1fr] border border-[#1a1a1a] bg-white group overflow-hidden">
            {/* Image Section */}
            <div className="relative aspect-[4/5] border-r border-[#1a1a1a] bg-neutral-50 overflow-hidden">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="100px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] uppercase font-black opacity-20">No Image</div>
                )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col">
                <div className="flex-1 p-3 sm:p-4">
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-[11px] font-black uppercase tracking-tighter leading-tight line-clamp-2">{item.name}</h3>
                        <button
                            onClick={() => removeItem(item.id, item.size)}
                            className="text-black hover:text-brand-ascent transition-colors shrink-0"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    {item.size && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-ascent">SIZE: {item.size}</span>
                    )}
                    <p className="text-[13px] font-black tracking-tighter mt-2">{formatCurrency(item.price)}</p>
                </div>

                {/* Quantity Controls - Fixed Bottom */}
                <div className="grid grid-cols-3 border-t border-[#1a1a1a] h-[40px]">
                    <button
                        onClick={handleDecrement}
                        className="flex items-center justify-center hover:bg-neutral-50 transition-colors border-r border-[#1a1a1a]"
                        disabled={quantity <= 1}
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <div className="flex items-center justify-center text-[11px] font-black border-r border-[#1a1a1a]">
                        {quantity}
                    </div>
                    <button
                        onClick={handleIncrement}
                        className="flex items-center justify-center hover:bg-neutral-50 transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CartContents({ onClose }: { onClose: () => void }) {
    const formatCurrency = useFormatCurrency();
    const { items, cartTotal } = useCart();

    if (items.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 min-h-[50vh]">
                <div className="w-20 h-20 rounded-full border border-[#1a1a1a] flex items-center justify-center opacity-20">
                    <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-sm font-black uppercase tracking-widest">Your bag is empty</p>
                    <p className="text-[10px] uppercase font-bold opacity-60 max-w-[200px]">Find something that defines your minimalism.</p>
                </div>
                <button 
                    onClick={onClose} 
                    className="px-8 py-3 border border-[#1a1a1a] uppercase text-[10px] font-black tracking-[0.2em] hover:bg-black hover:text-white transition-all"
                >
                    Explore Shop
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="flex flex-col gap-4 py-4">
                    {items.map((item: CartItem) => (
                        <DebouncedCartItem key={`${item.id}-${item.size}`} item={item} />
                    ))}
                </div>
            </ScrollArea>

            <div className="shrink-0 pt-6 border-t border-[#1a1a1a] space-y-4">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Subtotal</span>
                        <span className="text-2xl font-black tracking-tighter">{formatCurrency(cartTotal)}</span>
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-40">
                        Shipping and taxes calculated at checkout.
                    </p>
                </div>

                <div className="flex flex-col gap-2 pb-6">
                    <Link 
                        href="/checkout" 
                        onClick={onClose}
                        className="w-full h-14 bg-black text-white flex items-center justify-center text-[11px] font-black tracking-[0.3em] uppercase hover:bg-brand-ascent transition-colors"
                    >
                        Checkout Now
                    </Link>
                    
                    <a
                        href={`https://wa.me/923294194144?text=${encodeURIComponent(
                            `Hi SMPL! I'd like to order:\n${items.map(item => `- ${item.name} (${item.size || 'No Size'}) x ${item.quantity}`).join('\n')}\n\nTotal: ${formatCurrency(cartTotal)}\n\nPlease help me complete my order.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-14 border border-[#1a1a1a] flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase hover:bg-neutral-50 transition-colors"
                    >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp Order
                    </a>
                </div>
            </div>
        </div>
    );
}
