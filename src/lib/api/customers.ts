// ==========================================
// CUSTOMERS & CART API - Server Actions
// ==========================================

'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Customer, ApiResponse } from '@/lib/types'

// ==========================================
// CUSTOMER MANAGEMENT
// ==========================================

export async function getCustomer(userId: string): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        addresses:customer_addresses(*)
      `)
      .eq('user_id', userId)
      .single()

    if (error) {
      // Customer doesn't exist yet, that's okay
      if (error.code === 'PGRST116') {
        return { data: undefined }
      }
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    return { error: 'Failed to fetch customer' }
  }
}

export async function createCustomer(formData: FormData): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const customer = {
      user_id: user.id,
      email: user.email || formData.get('email') as string,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      phone: formData.get('phone') as string || null,
    }

    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    return { error: 'Failed to create customer' }
  }
}

export async function updateCustomer(formData: FormData): Promise<ApiResponse<Customer>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const updates = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      phone: formData.get('phone') as string || null,
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/account')
    return { data }
  } catch (error) {
    return { error: 'Failed to update customer' }
  }
}

// ==========================================
// ADDRESS MANAGEMENT
// ==========================================

export async function addAddress(formData: FormData): Promise<ApiResponse<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Get customer ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return { error: 'Customer not found' }
    }

    const isDefault = formData.get('is_default') === 'on'

    // If this is the default, unset other defaults
    if (isDefault) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', customer.id)
    }

    const address = {
      customer_id: customer.id,
      label: formData.get('label') as string || 'Home',
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      company: formData.get('company') as string || null,
      address1: formData.get('address1') as string,
      address2: formData.get('address2') as string || null,
      city: formData.get('city') as string,
      province: formData.get('province') as string || null,
      postal_code: formData.get('postal_code') as string,
      country: formData.get('country') as string,
      phone: formData.get('phone') as string || null,
      is_default: isDefault,
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(address)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/account')
    return { data }
  } catch (error) {
    return { error: 'Failed to add address' }
  }
}

export async function deleteAddress(addressId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    // Verify ownership
    const { data: address } = await supabase
      .from('customer_addresses')
      .select('customer_id, customers!inner(user_id)')
      .eq('id', addressId)
      .single()

    if (!address || (address as any).customers.user_id !== user.id) {
      return { error: 'Address not found' }
    }

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', addressId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/account')
    return { data: null }
  } catch (error) {
    return { error: 'Failed to delete address' }
  }
}

// ==========================================
// NOTE: Server-side cart functions (getOrCreateCart, addToCart, 
// updateCartItem, removeFromCart, clearCart) were removed.
// The app uses localStorage-based CartContext for cart management.
// The DB carts/cart_items tables are unused.
// ==========================================


// ==========================================
// WISHLIST MANAGEMENT
// ==========================================

export async function getWishlist(): Promise<ApiResponse<any[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { data: [] }
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return { data: [] }
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        product:products(id, title, slug, price, sale_price, cover_image, metadata)
      `)
      .eq('customer_id', customer.id)

    if (error) return { error: error.message }
    return { data: data || [] }
  } catch (error) {
    return { error: 'Failed to fetch wishlist' }
  }
}

export async function addToWishlist(productId: string): Promise<ApiResponse<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Please log in to save items' }
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return { error: 'Customer not found' }
    }

    const { data, error } = await supabase
      .from('wishlists')
      .upsert({
        customer_id: customer.id,
        product_id: productId,
      }, {
        onConflict: 'customer_id,product_id'
      })
      .select()
      .single()

    if (error) return { error: error.message }
    return { data }
  } catch (error) {
    return { error: 'Failed to add to wishlist' }
  }
}

export async function removeFromWishlist(productId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return { error: 'Customer not found' }
    }

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('customer_id', customer.id)
      .eq('product_id', productId)

    if (error) return { error: error.message }
    return { data: null }
  } catch (error) {
    return { error: 'Failed to remove from wishlist' }
  }
}
