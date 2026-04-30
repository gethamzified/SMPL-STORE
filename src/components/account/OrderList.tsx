'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Order } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, ChevronRight, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { useFormatCurrency } from '@/context/StoreConfigContext';

export default function OrderList({ initialOrders }: { initialOrders: Order[] }) {
    const formatCurrency = useFormatCurrency();
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const supabase = createClient();

    useEffect(() => {
        // Subscribe to realtime updates
        const channel = supabase
            .channel('orders-channel')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for all events (INSERT, UPDATE, DELETE) - though mostly UPDATE
                    schema: 'public',
                    table: 'orders',
                    filter: `customer_id=eq.${initialOrders[0]?.customer_id || ''}` // Filter by user if possible, or handle in callback
                },
                (payload) => {
                    console.log('Order update received:', payload);
                    if (payload.eventType === 'UPDATE') {
                        setOrders((prev) => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } as Order : o));
                    } else if (payload.eventType === 'INSERT') {
                        setOrders((prev) => [payload.new as Order, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, initialOrders]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'shipped': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'processing': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-neutral-50 text-neutral-700 border-neutral-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'shipped': return <Truck className="w-3.5 h-3.5" />;
            case 'processing': return <Package className="w-3.5 h-3.5" />;
            case 'cancelled': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return <Clock className="w-3.5 h-3.5" />;
        }
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-neutral-50/30 border border-dashed border-neutral-200 rounded-3xl">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center border border-neutral-100 mb-6 shadow-sm">
                    <Package className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="text-2xl font-light text-neutral-800 tracking-tight">No orders yet</h3>
                <p className="text-neutral-500 mt-2 mb-10 max-w-sm font-light">Your order history will appear here once you've made your first purchase.</p>
                <Button asChild size="lg" className="rounded-full px-10 font-bold text-xs uppercase tracking-widest bg-black text-white">
                    <Link href="/collection">Start Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="space-y-8">
                {orders.map((order, idx) => (
                    <div
                        key={order.id}
                        className="group relative bg-white border border-neutral-100 rounded-[2rem] overflow-hidden hover:border-neutral-200 hover:shadow-2xl hover:shadow-black/5 transition-all outline-none animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                        style={{ animationDelay: `${idx * 100}ms`, animationDuration: '600ms' }}
                    >
                        <div className="p-8 md:p-10">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400">Order ID</span>
                                        <span className="text-lg font-mono text-black font-medium tracking-tighter">#{order.id.slice(0, 8).toUpperCase()}</span>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border ${getStatusStyles(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-400 font-light italic">
                                        Placed on {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">Grand Total</p>
                                    <p className="text-4xl font-light text-black tracking-tighter">{formatCurrency(order.total)}</p>
                                </div>
                            </div>

                            {/* Refined Tracking Visualization */}
                            {['pending', 'processing', 'shipped', 'delivered'].includes(order.status) && (
                                <div className="mb-10 group/progress">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-300 mb-3">
                                        <span className={order.status !== 'pending' ? 'text-black' : ''}>Ordered</span>
                                        <span className={['processing', 'shipped', 'delivered'].includes(order.status) ? 'text-black' : ''}>Confirmed</span>
                                        <span className={['shipped', 'delivered'].includes(order.status) ? 'text-black' : ''}>Shipped</span>
                                        <span className={order.status === 'delivered' ? 'text-emerald-600' : ''}>Delivered</span>
                                    </div>
                                    <div className="relative h-1 bg-neutral-100 rounded-full overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-black group-hover/progress:bg-neutral-800 transition-all duration-1000 ease-out"
                                            style={{
                                                width: order.status === 'delivered' ? '100%' :
                                                    order.status === 'shipped' ? '75%' :
                                                        order.status === 'processing' ? '50%' : '25%'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Admin Notification */}
                            {order.admin_message && (
                                <div className="bg-neutral-50 rounded-2xl p-6 mb-10 border border-neutral-100 flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-neutral-100 shadow-sm">
                                        <AlertCircle className="w-4 h-4 text-black" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-black uppercase tracking-[0.2em] mb-1">Merchant Note</h4>
                                        <p className="text-sm text-neutral-600 font-light leading-relaxed italic">"{order.admin_message}"</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-neutral-50">
                                <div className="flex -space-x-4 self-start sm:self-center pl-2">
                                    {order.items?.slice(0, 5).map((item, i) => (
                                        <div
                                            key={i}
                                            className="w-14 h-14 rounded-full border-[3px] border-white bg-neutral-100 overflow-hidden relative shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                                            style={{ zIndex: 10 - i }}
                                        >
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package className="w-5 h-5 text-neutral-300" />
                                            )}
                                        </div>
                                    ))}
                                    {order.items && order.items.length > 5 && (
                                        <div className="w-14 h-14 rounded-full border-[3px] border-white bg-black flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ zIndex: 0 }}>
                                            +{order.items.length - 5}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="hidden md:block text-right mr-4">
                                        <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">Payment</p>
                                        <p className="text-xs font-medium text-black uppercase">{order.payment_status}</p>
                                    </div>
                                    <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-full font-bold text-xs uppercase tracking-[0.2em] border-neutral-200 hover:border-black hover:bg-black hover:text-white transition-all duration-300" asChild>
                                        <Link href={`/account/orders/${order.id}`}>
                                            Order Details <ChevronRight className="w-3 h-3 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

