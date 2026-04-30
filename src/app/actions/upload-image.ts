'use server';

import { processImage, generateImageFilename } from '@/lib/image-processor';
import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin';

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

export async function uploadImage(formData: FormData): Promise<UploadResponse> {
    try {
        const file = formData.get('file');

        if (!file || !(file instanceof File)) {
            return { error: 'No file provided' };
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { error: `Unsupported file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF` };
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
        }

        // Process image through Sharp pipeline
        let processed;
        try {
            processed = await processImage(file, 'product');
        } catch (err) {
            console.error('Sharp processing failed:', err);
            return { error: 'Image processing failed. Please try a different image.' };
        }

        // Upload to Supabase Storage
        const supabase = await createAdminClient();

        // Ensure bucket exists
        try {
            await ensureBucketExists('products', {
                public: true,
                fileSizeLimit: MAX_FILE_SIZE,
                allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png', 'image/avif'],
            });
        } catch {
            // Bucket likely already exists, continue
        }

        const fileName = generateImageFilename('products');

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, processed.buffer, {
                contentType: processed.contentType,
                cacheControl: '31536000', // 1 year immutable
                upsert: false,
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return { error: 'Failed to upload image to storage' };
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        return {
            data: {
                url: publicUrl,
                blurDataUrl: processed.blurDataURL,
                width: processed.width,
                height: processed.height,
                originalSize: processed.originalSize,
                processedSize: processed.processedSize,
            }
        };

    } catch (err) {
        console.error('Upload action critical error:', err);
        return { error: err instanceof Error ? err.message : 'Internal server error during upload' };
    }
}
