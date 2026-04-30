import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin, ArrowLeft, CheckCircle, Truck, Clock, AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { OrderCancelButton } from "@/components/orders/OrderCancelButton";

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params;
    const user = await requireAuth();

    const supabase = await createAdminClient();
    const [{ data: order }, storeConfig] = await Promise.all([
        supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('id', id)
            .eq('email', user.email)
            .single(),
        StoreConfigService.getStoreConfig()
    ]);

    if (!order) {
        notFound();
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle };
            case 'shipped': return { bg: 'bg-blue-50', text: 'text-blue-700', icon: Truck };
            case 'processing': return { bg: 'bg-amber-50', text: 'text-amber-700', icon: Package };
            case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-700', icon: AlertCircle };
            default: return { bg: 'bg-neutral-100', text: 'text-neutral-700', icon: Clock };
        }
    };

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="max-w-4xl mx-auto px-4 pb-24">
            {/* Minimal Header */}
            <header className="py-8 border-b border-neutral-200 mb-12">
                <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 hover:text-black transition-colors mb-8"
                >
                    <ArrowLeft className="w-3 h-3" /> Orders
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-2">
                            Order Placed {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
                            #{order.id.slice(0, 8).toUpperCase()}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 ${statusConfig.bg} ${statusConfig.text} text-[10px] font-bold uppercase tracking-[0.1em]`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {order.status}
                        </div>
                        <OrderCancelButton
                            orderId={order.id}
                            orderStatus={order.status}
                            createdAt={order.created_at}
                        />
                    </div>
                </div>
            </header>

            {/* Tracking Banner */}
            {order.tracking_number && (
                <div className="bg-black text-white p-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-white/50 mb-1">Tracking Number</p>
                        <p className="font-mono text-lg font-bold">{order.tracking_number}</p>
                    </div>
                    <Link
                        href="#"
                        className="text-[10px] font-bold uppercase tracking-[0.15em] border-b border-white/50 hover:border-white transition-colors pb-0.5"
                    >
                        Track Shipment →
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Main Content - Items */}
                <div className="lg:col-span-3 space-y-8">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 pb-4 border-b border-neutral-100">
                        Items Ordered
                    </h2>

                    <div className="space-y-0 divide-y divide-neutral-100">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex gap-6 py-6 first:pt-0">
                                <div className="relative w-20 h-24 bg-neutral-100 flex-shrink-0 overflow-hidden">
                                    {item.image_url ? (
                                        <Image
                                            src={item.image_url}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                            <Package className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <h3 className="font-bold text-sm tracking-tight text-black truncate">{item.title}</h3>
                                        {item.variant_title && (
                                            <p className="text-xs text-neutral-500 mt-0.5">{item.variant_title}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                                            Qty: {item.quantity}
                                        </span>
                                        <span className="font-bold text-sm text-black">
                                            {formatCurrency(item.total_price, storeConfig.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Summary */}
                    <div className="bg-neutral-50 p-6 space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 pb-3 border-b border-neutral-200">
                            Summary
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Subtotal</span>
                                <span className="font-medium">{formatCurrency(order.subtotal, storeConfig.currency)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Shipping</span>
                                <span className="font-medium">
                                    {order.shipping_total === 0 ? 'Free' : formatCurrency(order.shipping_total, storeConfig.currency)}
                                </span>
                            </div>
                            {order.tax_total > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Tax</span>
                                    <span className="font-medium">{formatCurrency(order.tax_total, storeConfig.currency)}</span>
                                </div>
                            )}
                        </div>
                        <Separator className="bg-neutral-200" />
                        <div className="flex justify-between items-end pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">Total</span>
                            <span className="text-xl font-bold tracking-tight">{formatCurrency(order.total, storeConfig.currency)}</span>
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                            <CreditCard className="w-3 h-3" /> Payment
                        </h3>
                        <div className="p-4 border border-neutral-200 text-sm">
                            <span className="font-medium capitalize">{order.payment_method?.replace('_', ' ') || 'N/A'}</span>
                            <span className="text-neutral-400 ml-2">• {order.payment_status}</span>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Shipping Address
                        </h3>
                        <div className="p-4 border border-neutral-200 text-sm space-y-1">
                            <p className="font-bold text-black">
                                {order.shipping_address?.first_name || order.shipping_address?.firstName} {order.shipping_address?.last_name || order.shipping_address?.lastName}
                            </p>
                            <p className="text-neutral-600">{order.shipping_address?.address1}</p>
                            {order.shipping_address?.address2 && <p className="text-neutral-600">{order.shipping_address?.address2}</p>}
                            <p className="text-neutral-600">
                                {order.shipping_address?.city}, {order.shipping_address?.postal_code || order.shipping_address?.zip}
                            </p>
                            <p className="text-neutral-500 text-xs uppercase tracking-wider pt-1">
                                {order.shipping_address?.country}
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="text-sm text-neutral-500 pt-4 border-t border-neutral-100 space-y-1">
                        <p>{order.email}</p>
                        {order.phone && <p>{order.phone}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
