import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SignJWT } from 'jose';
import { verifyOtpSchema } from '@/lib/validators';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Zod Validation
        const { email, code } = verifyOtpSchema.parse(body);

        const supabase = await createAdminClient();

        // 2. Verify OTP: Find a matching, non-expired record
        const { data: otpRecord, error: otpError } = await supabase
            .from('user_otps')
            .select('*')
            .eq('email', email)
            .eq('otp_code', code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (otpError || !otpRecord) {
            return NextResponse.json(
                { error: 'Invalid or expired code' },
                { status: 401 }
            );
        }

        // 3. Delete the used OTP (prevents reuse)
        await supabase.from('user_otps').delete().eq('id', otpRecord.id);

        // 4. Upsert User: Check if user exists, if not create
        let user;
        let isNewUser = false;
        const { data: existingUser, error: userFetchError } = await supabase
            .from('users')
            .select('id, email, name, phone, address')
            .eq('email', email)
            .single();

        if (userFetchError && userFetchError.code !== 'PGRST116') {
            // PGRST116 = "JSON object requested, multiple (or no) rows returned"
            console.error('User Fetch Error:', userFetchError);
        }

        if (!existingUser) {
            // Create new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({ email })
                .select('id, email, name, phone, address')
                .single();

            if (insertError) {
                console.error('User Insert Error:', insertError);
                return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
            }
            user = newUser;
            isNewUser = true;
        } else {
            user = existingUser;
        }

        // 5. Ensure customer record exists (linked to the user)
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!existingCustomer) {
            // Create customer record for this user
            const { error: customerError } = await supabase
                .from('customers')
                .insert({
                    user_id: user.id,
                    email: user.email
                });

            if (customerError) {
                console.error('Customer Insert Error:', customerError);
                // Non-fatal - continue anyway
            }
        }

        // 6. Generate JWT
        const token = await new SignJWT({
            userId: user.id,
            email: user.email,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('30d')
            .sign(JWT_SECRET);

        // 7. Create Response
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                address: user.address,
            },
        });

        // 8. Set HTTP-only Secure Cookie
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
        }
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
