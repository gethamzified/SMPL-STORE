import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { FadeInView } from '@/components/animations/FadeInView';
import Link from 'next/link';
import { Package, User, MapPin, ChevronRight } from 'lucide-react';
import OrderList from '@/components/account/OrderList';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
    const user = await requireAuth();
    const supabase = await createAdminClient();

    // Fetch Profile
    const { data: profile } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Fetch Recent Orders (Limit 3)
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(3);

    const firstName = profile?.first_name || user.email?.split('@')[0] || 'Customer';

    return (
        <FadeInView>
            <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-black tracking-tight mb-2">
                    Welcome back, {firstName}
                </h1>
                <p className="text-neutral-500 font-medium">
                    Here's what's happening with your account today.
                </p>
            </div>

            {/* Quick Stats / Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <Link href="/account/orders" className="group bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:border-neutral-200 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{recentOrders?.length || 0} Orders</h3>
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-4">In your history</p>
                    <span className="text-xs font-bold underline decoration-neutral-300 hover:decoration-black underline-offset-4 transition-all">View All Orders</span>
                </Link>

                <Link href="/account/profile" className="group bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:border-neutral-200 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Profile</h3>
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-4">Edit Details</p>
                    <span className="text-xs font-bold underline decoration-neutral-300 hover:decoration-black underline-offset-4 transition-all">Update Info</span>
                </Link>

                <Link href="/account/profile" className="group bg-neutral-50 rounded-2xl p-6 border border-neutral-100 hover:border-neutral-200 hover:shadow-lg transition-all">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-neutral-100 group-hover:scale-110 transition-transform">
                        <MapPin className="w-5 h-5 text-black" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Addresses</h3>
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-4">Shipping Info</p>
                    <span className="text-xs font-bold underline decoration-neutral-300 hover:decoration-black underline-offset-4 transition-all">Manage Addresses</span>
                </Link>
            </div>

            {/* Recent Orders Section */}
            <div>
                <div className="flex items-end justify-between mb-8 border-b border-neutral-100 pb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
                    </div>
                    <Link href="/account/orders" className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors flex items-center gap-1">
                        View All <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Reuse OrderList but strictly for recent */}
                <OrderList initialOrders={recentOrders || []} />
            </div>
        </FadeInView>
    );
}
