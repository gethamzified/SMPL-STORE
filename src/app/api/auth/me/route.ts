import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// GET: Get current user from session
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const { userId, email } = payload as { userId: string; email: string };

        const supabase = await createAdminClient();
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, name, phone, address')
            .eq('id', userId)
            .single();

        if (error || !user) {
            // Token is valid but user doesn't exist - clear cookie
            const response = NextResponse.json({ user: null }, { status: 200 });
            response.cookies.delete('auth_token');
            return response;
        }

        return NextResponse.json({ user });
    } catch (error) {
        // Invalid or expired token
        const response = NextResponse.json({ user: null }, { status: 200 });
        response.cookies.delete('auth_token');
        return response;
    }
}

// POST: Logout - Clear the cookie
export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');
    return response;
}
