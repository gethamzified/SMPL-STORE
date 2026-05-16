'use server'

import { createClient } from '@/lib/supabase/server';
import { CartItem } from '@/context/CartContext';

export async function syncCartAction(items: CartItem[]) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
        // Find or create customer
        let { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (!customer) {
            // Need to create customer record first
            const { data: newCustomer, error: custError } = await supabase
                .from('customers')
                .insert({
                    user_id: user.id,
                    email: user.email!,
                    first_name: user.user_metadata?.first_name || 'Customer',
                    last_name: user.user_metadata?.last_name || ''
                })
                .select('id')
                .single();
                
            if (custError) throw custError;
            customer = newCustomer;
        }

        // Find or create cart
        let { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('customer_id', customer.id)
            .maybeSingle();

        if (!cart) {
            const { data: newCart, error: cartError } = await supabase
                .from('carts')
                .insert({ customer_id: customer.id })
                .select('id')
                .single();
                
            if (cartError) throw cartError;
            cart = newCart;
        }

        // Delete existing items
        await supabase.from('cart_items').delete().eq('cart_id', cart.id);

        // Insert new items
        if (items.length > 0) {
            const itemsPayload = items.map(item => ({
                cart_id: cart!.id,
                product_id: item.productId,
                variant_id: item.variantId || null,
                quantity: item.quantity
            }));
            
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert(itemsPayload);
                
            if (insertError) throw insertError;
        }

        return { success: true };
    } catch (e: any) {
        console.error('Failed to sync cart:', e);
        return { success: false, error: e.message };
    }
}

export async function getSavedCartAction(): Promise<{ success: boolean; items?: CartItem[]; error?: string }> {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
        const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (!customer) return { success: true, items: [] };

        const { data: cart } = await supabase
            .from('carts')
            .select(`
                id,
                items:cart_items(
                    quantity,
                    product:products(id, title, slug, price, sale_price, cover_image),
                    variant:product_variants(id, title, price, sale_price, image_url, size, color)
                )
            `)
            .eq('customer_id', customer.id)
            .maybeSingle();

        if (!cart || !cart.items) return { success: true, items: [] };

        const mappedItems: CartItem[] = (cart.items as any[]).map(item => {
            const product = item.product;
            const variant = item.variant;
            
            const basePrice = variant?.price ?? product.price;
            const salePrice = variant?.sale_price ?? product.sale_price;
            const finalPrice = (salePrice !== null && salePrice < basePrice) ? salePrice : basePrice;

            return {
                id: variant ? variant.id : product.id,
                productId: product.id,
                variantId: variant?.id,
                name: product.title,
                price: finalPrice,
                image: variant?.image_url || product.cover_image,
                quantity: item.quantity,
                size: variant?.size,
                color: variant?.color,
                slug: product.slug
            };
        });

        return { success: true, items: mappedItems };
    } catch (e: any) {
        console.error('Failed to get saved cart:', e);
        return { success: false, error: e.message };
    }
}
