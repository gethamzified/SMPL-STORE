import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { createAdminClient } from '@/lib/supabase/admin';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    address?: any;
    created_at?: string;
    customer_id?: string;
    first_name?: string;
    last_name?: string;
    customer_data?: any;
}

/**
 * Get the current authenticated user from JWT cookie (server-side).
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return null;
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const { userId } = payload as { userId: string; email: string };

        const supabase = await createAdminClient();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, phone, address, created_at')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return null;
        }

        // Fetch customer profile
        const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', userId)
            .single();

        const enrichedUser = {
            ...user,
            customer_id: customer?.id,
            first_name: customer?.first_name || null,
            last_name: customer?.last_name || null,
            phone: customer?.phone || user.phone || null,
            customer_data: customer || null
        };

        return enrichedUser as AuthUser;
    } catch (error) {
        console.error('getAuthUser error:', error);
        return null;
    }
}

/**
 * Require authentication - redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<AuthUser> {
    const user = await getAuthUser();
    if (!user) {
        const { redirect } = await import('next/navigation');
        redirect('/login');
        // redirect() throws, so this line is never reached
        throw new Error('Redirect failed'); // TypeScript satisfaction
    }
    return user;
}
