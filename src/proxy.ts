import { NextResponse, type NextRequest } from 'next/server'
import { createHmac } from 'crypto'

export async function proxy(request: NextRequest) {
    // 1. Admin Protection Logic
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Exclude the login page itself to avoid loops
        if (!request.nextUrl.pathname.startsWith('/admin/login')) {
            const adminCookie = request.cookies.get('admin_access_token')
            const adminPass = process.env.ADMIN_PASS || ''
            const expected = createHmac('sha256', adminPass).update('admin_session').digest('hex')

            // Cookie value must be the HMAC-signed token (unforgeable without ADMIN_PASS)
            if (!adminCookie || adminCookie.value !== expected) {
                const url = request.nextUrl.clone()
                url.pathname = '/admin/login'
                return NextResponse.redirect(url)
            }
        }
    }

    // 2. Lightweight pass-through for all other routes
    // NOTE: Supabase auth.getUser() was removed here because the app uses
    // custom JWT auth (not Supabase Auth). The old updateSession() call
    // made a network request on EVERY page load, blocking ISR/SSG caching
    // and adding 100-300ms latency. Custom auth is validated in API routes
    // and server components via getAuthUser() from lib/auth.ts.
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Only run middleware on admin routes (the only routes that need protection).
         * All other routes pass through without middleware overhead, allowing
         * ISR/SSG pages to be served directly from CDN cache.
         */
        '/admin/:path*',
    ],
    // Explicitly set body size limit for middleware
    bodySizeLimit: '64mb',
}
