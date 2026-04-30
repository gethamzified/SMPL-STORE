import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jwtVerify } from 'jose';
import { OrderService } from '@/services/orders';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string; email: string };
    } catch {
        return null;
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tokenData = await getUserFromToken(request);

        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createAdminClient();

        // Fetch the order
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('id, email, status, created_at')
            .eq('id', id)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Verify ownership (by email)
        if (order.email.toLowerCase() !== tokenData.email.toLowerCase()) {
            return NextResponse.json({ error: 'You can only cancel your own orders' }, { status: 403 });
        }

        // Check if order is within 24 hours
        const createdAt = new Date(order.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceCreation > 24) {
            return NextResponse.json({
                error: 'Orders can only be cancelled within 24 hours of placement'
            }, { status: 400 });
        }

        // Check if order status allows cancellation
        const nonCancellableStatuses = ['shipped', 'delivered', 'cancelled', 'refunded'];
        if (nonCancellableStatuses.includes(order.status)) {
            return NextResponse.json({
                error: `Cannot cancel an order with status: ${order.status}`
            }, { status: 400 });
        }

        // Cancel the order using OrderService
        const cancelledOrder = await OrderService.cancelOrder(id);

        return NextResponse.json({
            success: true,
            order: cancelledOrder
        });

    } catch (error: any) {
        console.error('Order Cancel Error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to cancel order'
        }, { status: 500 });
    }
}
