'use server'

import { OrderService } from '@/services/orders';
import { CreateOrderInput } from '@/lib/types';

export async function createOrderAction(input: CreateOrderInput) {
    try {
        const order = await OrderService.createOrder(input);
        return { success: true, orderId: order.id };
    } catch (error: any) {
        console.error('Create Order Error:', error);
        return { success: false, error: error.message || 'Failed to create order' };
    }
}
