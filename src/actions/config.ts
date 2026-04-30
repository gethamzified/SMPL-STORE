'use server'

import { StoreConfigService } from '@/services/config';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function updateStoreConfigAction(key: string, value: any) {
    try {
        await StoreConfigService.updateConfig(key, value);

        // Revalidate the cached config
        (revalidateTag as any)('site_config', 'max');
        (revalidateTag as any)('navigation_menus', 'max');

        // Revalidate pages that use config
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Update Store Config Error:', error);
        return { error: error.message || 'Failed to update configuration' };
    }
}

import { v2 as cloudinary } from 'cloudinary';

/**
 * Parse CLOUDINARY_URL env var reliably.
 * Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 */
function configureCloudinary() {
    const cloudinaryUrl = process.env.CLOUDINARY_URL;

    if (cloudinaryUrl) {
        // Use URL constructor for reliable parsing
        // cloudinary://key:secret@cloud → protocol://username:password@hostname
        const parsed = new URL(cloudinaryUrl.replace('cloudinary://', 'https://'));
        cloudinary.config({
            cloud_name: parsed.hostname,
            api_key: parsed.username,
            api_secret: parsed.password,
        });
    } else {
        // Fallback to individual env vars
        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
}

export async function uploadSiteAsset(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        configureCloudinary();

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'site-assets',
                    // Let Cloudinary auto-detect best format on delivery
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // Return the raw secure_url — the cloudinary-loader will handle transforms at delivery time
        const publicUrl = result.secure_url;

        // Pre-generate a tiny blur placeholder for LQIP
        const blurDataURL = publicUrl.replace('/upload/', '/upload/w_20,e_blur:800,q_auto,f_auto/');

        return { success: true, url: publicUrl, blurDataURL };
    } catch (error: any) {
        console.error('Upload Asset Error:', error);
        return { error: error.message || 'Failed to upload asset' };
    }
}

export async function deleteSiteAsset(url: string) {
    try {
        if (!url) return { success: true };

        configureCloudinary();

        const urlObj = new URL(url);
        if (urlObj.hostname.includes('cloudinary.com')) {
            const parts = urlObj.pathname.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                let idParts = parts.slice(uploadIndex + 1);
                // Skip transformation segments
                idParts = idParts.filter(p => !p.includes(',') && !/^[a-z]{1,2}_/.test(p) || /^v\d+$/.test(p));
                // Skip version string
                if (idParts[0] && /^v\d+$/.test(idParts[0])) idParts = idParts.slice(1);
                const fullPath = idParts.join('/');
                const lastDotIndex = fullPath.lastIndexOf('.');
                const publicId = lastDotIndex !== -1 ? fullPath.substring(0, lastDotIndex) : fullPath;

                await cloudinary.uploader.destroy(publicId);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error('Delete Asset Error:', error);
        return { error: error.message || 'Failed to delete asset' };
    }
}
