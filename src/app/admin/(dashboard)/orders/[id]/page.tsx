import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusSelector } from "@/components/admin/orders/order-status-selector"; // We will create this
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Truck, Package, CreditCard, Calendar, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaymentVerificationCard } from "@/components/admin/orders/payment-verification-card";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const [{ data: order }, storeConfig] = await Promise.all([
        supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('id', id)
            .single(),
        StoreConfigService.getStoreConfig()
    ]);

    if (!order) {
        notFound();
    }

    // Helper for Badge Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return "bg-green-100 text-green-700 border-green-200";
            case 'shipped': return "bg-blue-100 text-blue-700 border-blue-200";
            case 'processing': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'cancelled': return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-600 border-border";
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <Link href="/admin/orders" className="text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                        Order #{order.id.slice(0, 8)}
                        <Badge variant="outline" className={`${getStatusColor(order.status)} uppercase text-xs tracking-wider font-medium border`}>
                            {order.status}
                        </Badge>
                    </h1>
                    <p className="text-gray-500 text-sm font-mono mt-1">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="sm:ml-auto flex gap-3">
                    <Button variant="outline" className="text-xs uppercase tracking-widest border-border hover:bg-gray-50 text-gray-700">
                        Print Invoice
                    </Button>
                    <OrderStatusSelector orderId={order.id} currentStatus={order.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Items Card */}
                    <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <Package className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-medium uppercase tracking-widest text-gray-600">Items ({order.items.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-6 flex gap-6">
                                    <div className="relative w-20 h-24 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0 border border-border">
                                        {item.image_url && <Image src={item.image_url} alt={item.title} fill className="object-cover" />}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-gray-900 font-medium">{item.title}</h4>
                                        <p className="text-gray-500 text-sm mt-1 mb-2">{item.variant_title || 'Standard'}</p>
                                        <div className="flex items-center gap-4 text-sm font-mono text-gray-600">
                                            <span>Qty: {item.quantity}</span>
                                            <span>×</span>
                                            <span>{formatCurrency(item.unit_price, storeConfig.currency)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-900 font-medium font-mono">
                                            {formatCurrency(item.total_price, storeConfig.currency)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gray-50/50 p-6 space-y-3 border-t border-gray-100">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal, storeConfig.currency)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>{formatCurrency(order.shipping_total, storeConfig.currency)}</span>
                            </div>
                            {order.tax_total > 0 && (
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tax</span>
                                    <span>{formatCurrency(order.tax_total, storeConfig.currency)}</span>
                                </div>
                            )}
                            <Separator className="bg-gray-200 my-2" />
                            <div className="flex justify-between text-lg font-medium text-gray-900">
                                <span>Total</span>
                                <span>{formatCurrency(order.total, storeConfig.currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Notes */}
                    <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-gray-600 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" /> Order Timeline
                        </h3>
                        <div className="space-y-6 relative ml-2 border-l border-border pl-6 py-2">
                            <div className="relative">
                                <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                                <p className="text-sm text-gray-900">Order Placed</p>
                                <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            {order.status !== 'pending' && (
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                                    <p className="text-sm text-gray-900">Status updated to <span className="uppercase font-bold text-xs text-gray-700">{order.status}</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Recent update</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar: Customer & Address */}
                <div className="space-y-8">
                    <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-gray-600 mb-4 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" /> Customer
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-900">{order.email}</p>
                                {order.phone && <p className="text-gray-500 text-sm mt-1">{order.phone}</p>}
                            </div>
                            <Button variant="secondary" className="w-full text-xs bg-gray-100 text-gray-900 hover:bg-gray-200">View Customer Profile</Button>
                        </div>
                    </div>

                    <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-gray-600 mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" /> Shipping Address
                        </h3>
                        {order.shipping_address ? (
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <p className="text-gray-900 font-medium mb-1">
                                    {order.shipping_address.first_name} {order.shipping_address.last_name}
                                </p>
                                <p>{order.shipping_address.address1}</p>
                                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                                <p>{order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                                <p className="uppercase text-xs mt-2 tracking-wide opacity-60 text-gray-500">{order.shipping_address.country}</p>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic">No shipping details provided</p>
                        )}
                    </div>

                    <PaymentVerificationCard order={order} />

                </div>
            </div>
        </div>
    );
}
