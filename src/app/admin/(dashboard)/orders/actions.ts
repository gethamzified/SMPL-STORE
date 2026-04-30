'use server';

import { OrderService } from '@/services/orders';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/admin-auth';

export async function deleteOrderAction(orderId: string) {
    try {
        if (!await verifyAdmin()) throw new Error('Unauthorized');
        console.log('Action: Deleting order', orderId);
        await OrderService.deleteOrder(orderId);
        return {
            success: true,
            timestamp: Date.now()
        };
    } catch (err: any) {
        console.error('Server Action Error:', err);
        return {
            success: false,
            error: String(err.message || 'Unknown error occurred')
        };
    }
}
export async function updateOrderStatusAction(orderId: string, status: string, paymentStatus?: string) {
    try {
        if (!await verifyAdmin()) throw new Error('Unauthorized');
        await OrderService.updateStatus(orderId, {
            status: status as any,
            payment_status: paymentStatus as any
        });
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/admin/orders');
        return { success: true };
    } catch (error: any) {
        console.error('Update Order Status Error:', error);
        return { error: error.message || 'Failed to update order status' };
    }
}

