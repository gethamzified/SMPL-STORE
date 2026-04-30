'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/admin-auth'

export async function createMenu() {
    if (!await verifyAdmin()) throw new Error('Unauthorized');
    const supabase = await createAdminClient()

    // Check if main-menu exists first to avoid duplicates or handles? 
    // For now simplistic create.

    const { data, error } = await supabase.from('navigation_menus').insert({
        title: 'New Menu',
        handle: `menu-${Date.now()}`,
        items: []
    }).select().single()

    if (error) throw new Error(error.message)

    redirect(`/admin/navigation/${data.id}`)
}

export async function deleteMenu(id: string) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');
    const supabase = await createAdminClient()
    await supabase.from('navigation_menus').delete().eq('id', id)
    revalidatePath('/admin/navigation')
}

export async function updateMenu(id: string, data: any) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');
    const supabase = await createAdminClient()
    const { error } = await supabase
        .from('navigation_menus')
        .update(data)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/navigation')
    revalidatePath(`/admin/navigation/${id}`)
    return { success: true }
}

