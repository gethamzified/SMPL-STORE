import OrderList from '@/components/account/OrderList';
import { requireAuth } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { FadeInView } from '@/components/animations/FadeInView';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const user = await requireAuth();

    // Fetch orders by email (since we don't set customer_id in new auth flow)
    const supabase = await createAdminClient();
    const { data: orders } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-5xl mx-auto">
            <FadeInView>
                <div className="mb-12 border-b border-neutral-100 pb-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">Purchase History</p>
                    <h2 className="text-4xl font-bold text-black tracking-tight">Your Orders</h2>
                    <p className="text-neutral-600 text-sm mt-4 font-medium">Manage your past purchases, track active shipments, and download invoices.</p>
                </div>
            </FadeInView>

            <OrderList initialOrders={orders || []} />
        </div>
    );
}

