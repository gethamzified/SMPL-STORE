'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = await createAdminClient()

  const profileData = {
    first_name: formData.get('first_name') as string || null,
    last_name: formData.get('last_name') as string || null,
    phone: formData.get('phone') as string || null,
    address1: formData.get('address1') as string || null,
    address2: formData.get('address2') as string || null,
    city: formData.get('city') as string || null,
    province: formData.get('province') as string || null,
    zip: formData.get('zip') as string || null,
    country: formData.get('country') as string || 'US',
  }

  // Check if customer exists for this user
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingCustomer) {
    // Update existing customer
    const { error } = await supabase
      .from('customers')
      .update(profileData)
      .eq('id', existingCustomer.id)

    if (error) return { error: error.message }
  } else {
    // Create new customer linked to user
    const { error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        email: user.email,
        ...profileData
      })

    if (error) return { error: error.message }
  }

  revalidatePath('/account')
  return { success: true }
}

// Get customer profile for the current user
export async function getCustomerProfile() {
  const user = await getAuthUser()
  if (!user) return null

  const supabase = await createAdminClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return customer
}
