'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { verifyAdmin } from '@/lib/admin-auth'

export async function createPage() {
    if (!await verifyAdmin()) throw new Error('Unauthorized');
    const supabase = await createAdminClient()

    const { data, error } = await supabase.from('pages').insert({
        title: 'Untitled Page',
        slug: `page-${Date.now()}`,
        sections: [],
        is_published: false
    }).select().single()

    if (error) throw new Error(error.message)

    redirect(`/admin/pages/${data.id}`)
}

export async function deletePage(id: string) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');
    const supabase = await createAdminClient()
    await supabase.from('pages').delete().eq('id', id)
    revalidatePath('/admin/pages')
}

export async function updatePage(id: string, data: any) {
    if (!await verifyAdmin()) throw new Error('Unauthorized');
    const supabase = await createAdminClient()
    const { error } = await supabase
        .from('pages')
        .update(data)
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/pages')
    revalidatePath(`/admin/pages/${id}`)
    revalidatePath(`/${data.slug}`) // Revalidate the public page too
    return { success: true }
}

