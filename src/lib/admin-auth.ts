import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

/**
 * Generate the HMAC-signed admin session token.
 * Used by login to set the cookie and by verifyAdmin to validate it.
 */
export function generateAdminToken(adminPass: string): string {
    return createHmac('sha256', adminPass).update('admin_session').digest('hex');
}

/**
 * Verify that the current request has a valid admin session.
 * Call this at the top of every admin server action.
 */
export async function verifyAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_access_token')?.value;
    const adminPass = process.env.ADMIN_PASS;
    if (!token || !adminPass) return false;
    const expected = generateAdminToken(adminPass);
    return token === expected;
}
