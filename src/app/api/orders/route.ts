import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jwtVerify } from 'jose';
import { OrderService } from '@/services/orders';
import { createOrderSchema } from '@/lib/validators';
import { z } from 'zod';
import { AppError } from '@/services/errors';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// Helper to get user from JWT cookie
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Handle guest or authed checkout via token
        const tokenData = await getUserFromToken(request);

        // Pre-fill email from token if missing in body
        if (!body.email && tokenData?.email) {
            body.email = tokenData.email;
        }

        // Zod Validation
        const input = createOrderSchema.parse(body);

        const order = await OrderService.createOrder(input as any);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.order_number,
        });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
        }

        console.error('Orders POST Error:', error);

        if (error.code === 'OUT_OF_STOCK' || error.message?.includes('stock')) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        if (error instanceof AppError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode });
        }

        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

// GET: Fetch user's orders
export async function GET(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        if (!tokenData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = await createAdminClient();
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
        id,
        order_number,
        status,
        payment_status,
        fulfillment_status,
        total,
        created_at,
        items:order_items(id, title, quantity, unit_price, image_url)
      `)
            .eq('customer_id', tokenData.userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Orders Fetch Error:', error);
            return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
        }

        return NextResponse.json({ orders: orders || [] });
    } catch (error) {
        console.error('Orders GET Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
