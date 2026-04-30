import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    // Redirect to login page after sign out
    const response = NextResponse.redirect(new URL('/login', request.url));

    // Clear the auth token cookie
    response.cookies.delete('auth_token');

    return response;
}
