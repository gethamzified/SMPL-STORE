import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmailService } from '@/services/email';
import { sendOtpSchema } from '@/lib/validators';
import { z } from 'zod';
import { randomInt } from 'crypto';

// Generate cryptographically secure 6-digit code
function generateCode(): string {
    return randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Zod Validation
        const { email } = sendOtpSchema.parse(body);

        const supabase = await createAdminClient();

        // 2. Rate Limiting: Max 5 OTPs per email per hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count } = await supabase
            .from('user_otps')
            .select('*', { count: 'exact', head: true })
            .eq('email', email)
            .gte('created_at', oneHourAgo);

        if (count && count >= 5) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429 }
            );
        }

        // 3. Invalidate Previous Unused OTPs
        await supabase.from('user_otps').delete().eq('email', email);

        // 4. Generate and Insert New OTP
        const code = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        const { error: insertError } = await supabase.from('user_otps').insert({
            email,
            otp_code: code,
            expires_at: expiresAt,
        });

        if (insertError) {
            console.error('OTP Insert Error:', insertError);
            return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
        }

        // 5. Send Email via Nodemailer
        try {
            await EmailService.sendOTP(email, code);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);

            // In development mode without SMTP, still allow login by returning success
            // The OTP is already in the database and was logged to console by EmailService
            if (!process.env.SMTP_USER) {
                console.log(`[DEV MODE] OTP for ${email}: ${code}`);
                return NextResponse.json({
                    success: true,
                    message: 'OTP generated (check server console in dev mode)'
                });
            }

            return NextResponse.json({ error: 'Failed to send OTP email. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
        }
        console.error('Send OTP Error:', error);
        return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
    }
}
