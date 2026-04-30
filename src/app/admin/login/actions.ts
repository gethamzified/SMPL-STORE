'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { generateAdminToken } from '@/lib/admin-auth'

export async function login(prevState: any, formData: FormData) {
    const password = formData.get('password') as string
    const adminPass = process.env.ADMIN_PASS

    if (!adminPass) {
        console.error('ADMIN_PASS is not set in environment variables')
        return { error: 'Server configuration error. Please contact support.' }
    }

    if (password === adminPass) {
        const token = generateAdminToken(adminPass)
        const cookieStore = await cookies()
        cookieStore.set('admin_access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
            path: '/',
            sameSite: 'lax',
        })
        redirect('/admin')
    }

    return { error: 'Invalid password' }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_access_token')
    redirect('/admin/login')
}

