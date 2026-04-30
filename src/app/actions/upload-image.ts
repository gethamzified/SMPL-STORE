'use server';

import { v2 as cloudinary } from 'cloudinary';

const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export type UploadError = {
    error: string;
};

export type UploadSuccess = {
    data: {
        url: string;
        blurDataUrl: string;
        width: number;
        height: number;
        originalSize: number;
        processedSize: number;
    };
};

export type UploadResponse = UploadSuccess | UploadError;

// Ensure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
});

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
    try {
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return { error: 'No file provided' };
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF` };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const publicUrl = result.secure_url;
        const optimizedUrl = publicUrl.replace('/upload/', '/upload/f_auto,q_auto,g_auto/');
        const blurDataUrl = publicUrl.replace('/upload/', '/upload/w_10,e_blur:1000,f_auto,q_auto/');

        return {
            data: {
                url: optimizedUrl,
                blurDataUrl,
                width: result.width,
                height: result.height,
                originalSize: file.size,
                processedSize: result.bytes,
            }
        };

    } catch (err) {
        console.error('Upload action critical error:', err);
        return { error: err instanceof Error ? err.message : 'Internal server error during upload' };
    }
}
