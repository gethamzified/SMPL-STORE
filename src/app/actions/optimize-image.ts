'use server';

import { processImage, generateImageFilename } from '@/lib/image-processor';
import { createAdminClient } from '@/lib/supabase/admin';

export type OptimizeResult = {
    data?: {
        url: string;
        blurDataUrl: string;
        width: number;
        height: number;
        originalSize: number;
        processedSize: number;
    };
    error?: string;
};

/**
 * Optimize an image that has already been uploaded to the 'raw' folder in storage.
 * 1. Download raw file
 * 2. Process with Sharp (Resize, WebP, Blur)
 * 3. Upload optimized file
 * 4. Delete raw file
 */
export async function optimizeImage(rawPath: string): Promise<OptimizeResult> {
    try {
        const supabase = await createAdminClient();

        // 1. Download raw image
        const { data: rawData, error: downloadError } = await supabase.storage
            .from('products')
            .download(rawPath);

        if (downloadError || !rawData) {
            console.error('Failed to download raw image:', downloadError);
            return { error: 'Failed to access uploaded file for processing' };
        }

        // Convert Blob/File to Buffer for Sharp
        const rawBuffer = Buffer.from(await rawData.arrayBuffer());

        // 2. Process image
        let processed;
        try {
            processed = await processImage(rawBuffer, 'product');
        } catch (err) {
            console.error('Sharp processing failed:', err);
            // Try to clean up raw file even if processing fails
            await supabase.storage.from('products').remove([rawPath]);
            return { error: 'Image processing failed' };
        }

        // 3. Upload optimized image
        const fileName = generateImageFilename('products'); // e.g. products/slug-123.webp

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, processed.buffer, {
                contentType: processed.contentType,
                cacheControl: '31536000', // 1 year immutable
                upsert: false,
            });

        if (uploadError) {
            console.error('Supabase upload optimize error:', uploadError);
            return { error: 'Failed to save optimized image' };
        }

        // 4. Delete raw file (cleanup)
        // We don't await this to speed up response, or we can await to ensure cleanliness
        await supabase.storage.from('products').remove([rawPath]);

        // 5. Get Public URL
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
        console.error('Optimize action fatal error:', err);
        return { error: 'Internal server error during image optimization' };
    }
}
