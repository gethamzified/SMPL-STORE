import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { v2 as cloudinary } from 'cloudinary';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);

// Helper to get user from JWT cookie
async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string; email: string };
    } catch {
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const tokenData = await getUserFromToken(request);
        // Allow guest uploads for payment proofs
        const userId = tokenData?.userId || 'guest';

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 5MB.' },
                { status: 400 }
            );
        }

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
            api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
        });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'payment-proofs' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'),
            path: result.public_id,
        });
    } catch (error) {
        console.error('Payment Proof Upload Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
