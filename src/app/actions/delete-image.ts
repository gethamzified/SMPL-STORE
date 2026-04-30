'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export type DeleteResult = {
    success: boolean;
    error?: string;
};

/**
 * Delete an image from Supabase storage using the admin client.
 * Extracts the storage path from the public URL.
 */
export async function deleteImage(publicUrl: string): Promise<DeleteResult> {
    try {
        const storagePath = extractStoragePath(publicUrl);

        if (!storagePath) {
            console.warn('Invalid URL format for deletion:', publicUrl);
            return { success: false, error: 'Invalid URL format' };
        }

        const supabase = await createAdminClient();

        const { error } = await supabase.storage
            .from('products')
            .remove([storagePath]);

        if (error) {
            console.error(`Failed to delete ${storagePath}:`, error);
            return { success: false, error: error.message };
        }

        return { success: true };

    } catch (err) {
        console.error('Delete action fatal error:', err);
        return { success: false, error: 'Internal server error during deletion' };
    }
}

/**
 * Helper: Extract 'folder/filename.ext' from public URL
 */
function extractStoragePath(publicUrl: string): string | null {
    try {
        const url = new URL(publicUrl);
        // Path: /storage/v1/object/public/products/products/{filename}
        // We need everything after the bucket name 'products'

        const parts = url.pathname.split('/');
        const bucketIndex = parts.indexOf('products');

        if (bucketIndex === -1) return null;

        // Join parts after the bucket name
        const path = parts.slice(bucketIndex + 1).join('/');
        return path || null;
    } catch {
        // Fallback simple split if URL parsing fails
        try {
            const parts = publicUrl.split('/');
            const fileName = parts[parts.length - 1];
            if (fileName && fileName.includes('.')) {
                return `products/${fileName}`; // Assume default location
            }
        } catch {
            return null;
        }
        return null;
    }
}
