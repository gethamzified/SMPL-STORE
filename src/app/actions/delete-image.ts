'use server';

import { v2 as cloudinary } from 'cloudinary';

export type DeleteResult = {
    success: boolean;
    error?: string;
};

// Configure cloudinary explicitly in case CLOUDINARY_URL isn't automatically picked up in this environment
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
});

/**
 * Delete an image from Cloudinary using the Node SDK.
 * Extracts the public_id from the Cloudinary URL.
 */
export async function deleteImage(publicUrl: string): Promise<DeleteResult> {
    try {
        const publicId = extractCloudinaryPublicId(publicUrl);

        if (!publicId) {
            console.warn('Invalid Cloudinary URL format for deletion:', publicUrl);
            return { success: false, error: 'Invalid URL format' };
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok' && result.result !== 'not found') {
            console.error(`Failed to delete ${publicId}:`, result);
            return { success: false, error: 'Failed to delete from Cloudinary' };
        }

        return { success: true };

    } catch (err) {
        console.error('Delete action fatal error:', err);
        return { success: false, error: 'Internal server error during deletion' };
    }
}

/**
 * Helper: Extract public_id from Cloudinary URL
 */
function extractCloudinaryPublicId(publicUrl: string): string | null {
    try {
        const url = new URL(publicUrl);
        if (!url.hostname.includes('cloudinary.com')) {
             // Fallback for relative or malformed URLs
             const parts = publicUrl.split('/');
             const filename = parts.pop();
             if (filename) return filename.split('.')[0];
             return null;
        }

        const parts = url.pathname.split('/');
        const uploadIndex = parts.indexOf('upload');
        
        if (uploadIndex === -1) return null;

        // Parts after 'upload'
        let idParts = parts.slice(uploadIndex + 1);
        
        // Remove version string (e.g. v1612345678)
        if (idParts[0] && /^v\d+$/.test(idParts[0])) {
            idParts = idParts.slice(1);
        }
        
        const fullPath = idParts.join('/');
        
        // Remove file extension
        const lastDotIndex = fullPath.lastIndexOf('.');
        if (lastDotIndex !== -1) {
            return fullPath.substring(0, lastDotIndex);
        }
        
        return fullPath;
    } catch {
        return null;
    }
}
