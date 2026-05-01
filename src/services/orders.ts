import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { AppError } from './errors';
import { EmailService } from './email';
import {
    Order,
    CreateOrderInput,
    OrderStatus,
    PaymentStatus,
    FulfillmentStatus,
    ProductVariant
} from '@/lib/types';
import { calculateProductPrice } from '@/lib/logic/product-logic';
import { StoreConfigService } from './config';
import { revalidatePath } from 'next/cache';

export const OrderService = {
    async createOrder(input: CreateOrderInput): Promise<Order> {
        const supabase = await createAdminClient();
        const user = await getAuthUser();

        // 1. Validate Input
        if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            throw AppError.badRequest('Valid email is required');
        }
        if (!input.items || input.items.length === 0) {
            throw AppError.badRequest('Order must contain at least one item');
        }

        // 2. Prepare Payload
        // We still need to help frontend by looking up prices if not provided securely, 
        // but for now we assume input contains trusted or re-validated data from checkout.
        // However, best practice is to RE-FETCH prices here to ensure no tampering.

        const productIds = input.items.map(item => item.product_id);
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
                id, title, price, sale_price, cover_image, sku,
                variants:product_variants(*)
            `)
            .in('id', productIds);

        if (productsError || !products) throw new AppError('Failed to fetch product data', 'DB_ERROR');

        const productMap = new Map(products.map(p => [p.id, p]));
        const orderItemsPayload = [];
        let subtotal = 0;

        for (const item of input.items) {
            const product = productMap.get(item.product_id);
            if (!product) throw AppError.badRequest(`Product not found: ${item.product_id}`);

            // Calculate Price
            let unitPrice = 0;
            let variantTitle = null;
            let sku = product.sku;
            let variant: ProductVariant | undefined;

            if (item.variant_id) {
                const variants = product.variants as ProductVariant[] || [];
                variant = variants.find(v => v.id === item.variant_id);
                if (!variant) throw AppError.badRequest(`Variant ID ${item.variant_id} not found`);

                variantTitle = variant.title;
                sku = variant.sku || sku;
                const vPrice = variant.price ?? product.price;
                const vSalePrice = variant.sale_price ?? null;
                unitPrice = (vSalePrice !== null && vSalePrice < vPrice) ? vSalePrice : vPrice;
            } else {
                const priceInfo = calculateProductPrice(product);
                unitPrice = priceInfo.finalPrice;
            }

            const totalPrice = unitPrice * item.quantity;
            subtotal += totalPrice;

            orderItemsPayload.push({
                product_id: product.id,
                variant_id: item.variant_id || null,
                title: product.title,
                variant_title: variantTitle,
                sku,
                image_url: variant?.image_url || product.cover_image,
                quantity: item.quantity,
                unit_price: unitPrice,
                total_price: totalPrice,
                requires_shipping: true,
                properties: variant ? {
                    color: variant.color,
                    size: variant.size
                } : {}
            });
        }

        // Calculate Totals - Dynamic based on Store Config
        const storeConfig = await StoreConfigService.getStoreConfig();
        const { delivery } = storeConfig;

        let shippingTotal = 0;
        if (input.shipping_method === 'express') {
            shippingTotal = delivery.express.price;
        } else {
            shippingTotal = subtotal >= delivery.freeThreshold ? 0 : delivery.standard.price;
        }

        const taxTotal = 0;
        const total = subtotal + shippingTotal + taxTotal;

        // 3. ATOMIC ORDER CREATION (Via RPC)
        const orderPayload = {
            customer_id: null, // Let RPC lookup/create customer via user_id or email
            user_id: user?.id || null,     // Pass for customer creation/lookup
            email: input.email,
            phone: input.phone || null,
            status: 'pending',
            fulfillment_status: 'unfulfilled',
            payment_status: 'pending',
            subtotal,
            shipping_total: shippingTotal,
            tax_total: taxTotal,
            total,
            shipping_address: input.shipping_address,
            billing_address: input.billing_address || input.shipping_address,
            payment_method: input.payment_method,
            payment_proof_url: input.payment_proof_url,
            transaction_id: input.transaction_id,
            items: orderItemsPayload
        };

        // Call the secure RPC
        const { data: createdOrder, error: rpcError } = await supabase
            .rpc('create_order_secure', { payload: orderPayload });

        if (rpcError) {
            console.error('Create Order RPC Error:', rpcError);
            if (rpcError.message?.includes('Insufficient stock')) {
                throw new AppError(rpcError.message, 'INSUFFICIENT_STOCK', 400);
            }
            throw new AppError(rpcError.message || 'Failed to create order', 'DB_ERROR');
        }

        if (!createdOrder) {
            throw new AppError('Order creation failed to return data', 'DB_ERROR');
        }

        // 4. Send Confirmation Email (Async / Fire-and-Forget)
        const orderId = (createdOrder as any).id;

        try {
            // Fetch full order again just to be safe, or use returned object if complete
            const fullOrder = await OrderService.getOrder(orderId);
            await EmailService.sendOrderConfirmation(input.email, fullOrder);
        } catch (err) {
            console.error('Email Sending Failed:', err);
            // Do not fail the order creation, just log it
        }

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath('/profile');
        revalidatePath('/');
        revalidatePath('/shop');
        
        // Revalidate specific products
        for (const item of input.items) {
            // We need the slug here, but if not available, we can rely on general shop revalidation
            // or fetch slugs if necessary. For now, general paths should suffice for most users.
        }

        return createdOrder as Order;
    },

    async updateStatus(orderId: string, updates: {
        status?: OrderStatus,
        payment_status?: PaymentStatus,
        fulfillment_status?: FulfillmentStatus,
        admin_message?: string
    }): Promise<Order> {
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw new AppError(error.message, 'DB_ERROR');

        // Handle Stock Restoration on Cancellation
        if (updates.status === 'cancelled') {
            return await this.cancelOrder(orderId);
        }

        // Send Email Notification
        if (updates.status || updates.admin_message) {
            const fullOrder = await OrderService.getOrder(orderId);
            await EmailService.sendOrderStatusUpdate(fullOrder.email, fullOrder, updates.admin_message);
        }

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${orderId}`);
        return data as Order;
    },

    async getOrder(id: string): Promise<Order> {
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('id', id)
            .single();

        if (error) throw new AppError(error.message, 'DB_ERROR');
        return data as Order;
    },

    async getCustomerOrders(customerId: string): Promise<Order[]> {
        const supabase = await createAdminClient();
        
        // Check if the provided ID is a customer.id or user_id
        // Try to find customer by user_id first
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', customerId)
            .single();
        
        const actualCustomerId = customer?.id || customerId;

        const { data, error } = await supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('customer_id', actualCustomerId)
            .order('created_at', { ascending: false });

        if (error) throw new AppError(error.message, 'DB_ERROR');
        return (data || []) as Order[];
    },

    async cancelOrder(id: string): Promise<Order> {
        const supabase = await createAdminClient();

        // Call the atomic cancel RPC
        const { data: updated, error: rpcError } = await supabase.rpc('cancel_order_secure', {
            p_order_id: id
        });

        if (rpcError) {
            console.error('Cancel Order RPC Error:', rpcError);
            if (rpcError.code === 'P0003') throw new AppError('Order already cancelled', 'BAD_REQUEST');
            if (rpcError.code === 'P0002') throw new AppError('Order not found', 'NOT_FOUND');
            throw new AppError(rpcError.message || 'Failed to cancel order', 'DB_ERROR');
        }

        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${id}`);
        revalidatePath('/profile');
        
        // Revalidate products in the order (optional but recommended)
        try {
            const fullOrder = updated as any;
            if (fullOrder.items) {
                for (const item of fullOrder.items) {
                    revalidatePath(`/products/${item.slug}`);
                }
            }
        } catch (e) {
            // Ignore revalidation errors
        }

        return updated as Order;
    },

    async deleteOrder(id: string): Promise<void> {
        const supabase = await createAdminClient();

        console.log(`Starting deletion for order: ${id}`);

        // Rely on ON DELETE CASCADE for order_items (defined in SQL schema)
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Delete Order DB Error:', error);
            throw new AppError(error.message, 'DB_ERROR');
        }

        console.log(`Successfully deleted order: ${id}`);
    }
};


