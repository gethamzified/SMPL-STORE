'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { EmailService } from '@/services/email'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Helper to generate 6-digit code
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(formData: FormData) {
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }

  try {
    const code = generateCode();
    const supabase = await createAdminClient();

    // Store code
    const { error: dbError } = await supabase.from('user_otps').insert({
      email,
      otp_code: code
    });

    if (dbError) throw dbError;

    // Send Email
    await EmailService.sendOTP(email, code);

    return { success: true, message: 'OTP sent to your email' }
  } catch (error) {
    console.error('Send OTP Error:', error);
    return { error: 'Failed to send OTP' }
  }
}

export async function verifyOTP(formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('code') as string

  if (!email || !code) return { error: 'Email and Code required' }

  const supabase = await createAdminClient();

  // Verify Code
  const { data: records } = await supabase
    .from('user_otps')
    .select('*')
    .eq('email', email)
    .eq('otp_code', code)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (!records || records.length === 0) {
    return { error: 'Invalid or expired code' }
  }

  // Valid Code! Consume it
  await supabase.from('user_otps').delete().eq('email', email);

  // Ensure customer exists in Supabase Auth (Sign Up if needed)
  // We try to create the user. If they exist, this fails but we ignore it.
  try {
    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    // If error is not 'user already registered' clean logic is hard, but usually 
    // we proceed to generate link. If user doesn't exist AND create failed, generateLink will fail.
  } catch (e) {
    // Ignore
  }

  const redirectTo = formData.get('redirectTo') as string || '/account';

  // Create Session via Magic Link trick
  // We generate a magic link, and return it to the client to follow.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${redirectTo}`
    }
  });

  if (linkError || !linkData.properties?.action_link) {
    console.error('Generate Link Error:', linkError);
    return { error: 'Failed to create session' };
  }

  return { success: true, url: linkData.properties.action_link };
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
