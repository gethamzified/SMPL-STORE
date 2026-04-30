'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/lib/types'

// ==========================================
// SUBSCRIBE TO NEWSLETTER
// ==========================================

export async function subscribeToNewsletter(email: string): Promise<ApiResponse<{ email: string }>> {
    try {
        // Validate email
        if (!email || !email.includes('@')) {
            return { error: 'Please enter a valid email address' }
        }

        const normalizedEmail = email.toLowerCase().trim()

        const supabase = await createAdminClient()

        // First check if email already exists
        const { data: existing } = await supabase
            .from('newsletter_subscribers')
            .select('email, status')
            .eq('email', normalizedEmail)
            .single()

        if (existing) {
            if (existing.status === 'active') {
                return { error: 'This email is already subscribed to our newsletter' }
            }
            // Reactivate subscription
            await supabase
                .from('newsletter_subscribers')
                .update({ status: 'active', subscribed_at: new Date().toISOString() })
                .eq('email', normalizedEmail)

            return { data: { email: normalizedEmail }, message: 'Welcome back! Your subscription has been reactivated.' }
        }

        // Create new subscription
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .insert({
                email: normalizedEmail,
                status: 'active',
                subscribed_at: new Date().toISOString(),
            })
            .select('email')
            .single()

        if (error) {
            // Handle unique constraint violation gracefully
            if (error.code === '23505') {
                return { error: 'This email is already subscribed' }
            }
            console.error('Newsletter subscription error:', error)
            return { error: 'Failed to subscribe. Please try again.' }
        }

        return {
            data: { email: data.email },
            message: 'Thank you for subscribing! You\'ll receive our latest updates.'
        }
    } catch (error) {
        console.error('Newsletter error:', error)
        return { error: 'An unexpected error occurred. Please try again.' }
    }
}

// ==========================================
// UNSUBSCRIBE FROM NEWSLETTER
// ==========================================

export async function unsubscribeFromNewsletter(email: string): Promise<ApiResponse<null>> {
    try {
        const normalizedEmail = email.toLowerCase().trim()
        const supabase = await createAdminClient()

        const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
            .eq('email', normalizedEmail)

        if (error) {
            return { error: 'Failed to unsubscribe' }
        }

        return { message: 'You have been unsubscribed from our newsletter.' }
    } catch (error) {
        return { error: 'An unexpected error occurred' }
    }
}

// ==========================================
// GET ALL SUBSCRIBERS (Admin)
// ==========================================

export async function getAllSubscribers(options?: {
    status?: 'active' | 'unsubscribed'
    limit?: number
}): Promise<ApiResponse<Array<{ email: string; status: string; subscribed_at: string }>>> {
    try {
        const supabase = await createAdminClient()

        let query = supabase
            .from('newsletter_subscribers')
            .select('email, status, subscribed_at')
            .order('subscribed_at', { ascending: false })

        if (options?.status) {
            query = query.eq('status', options.status)
        }

        if (options?.limit) {
            query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) {
            return { error: error.message }
        }

        return { data: data || [] }
    } catch (error) {
        return { error: 'Failed to fetch subscribers' }
    }
}
