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
import { createAdminClient } from '@/lib/supabase/admin';
import { processImage, generateImageFilename } from '@/lib/image-processor';
import { v2 as cloudinary } from 'cloudinary';

export async function uploadSiteAsset(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
            api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
        });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'site-assets' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const publicUrl = result.secure_url;
        const optimizedUrl = publicUrl.replace('/upload/', '/upload/f_auto,q_auto,g_auto/');
        const blurDataURL = publicUrl.replace('/upload/', '/upload/w_10,e_blur:1000,f_auto,q_auto/');

        return { success: true, url: optimizedUrl, blurDataURL };
    } catch (error: any) {
        console.error('Upload Asset Error:', error);
        return { error: error.message || 'Failed to upload asset' };
    }
}

export async function deleteSiteAsset(url: string) {
    try {
        if (!url) return { success: true };

        cloudinary.config({
            cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
            api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
        });

        const urlObj = new URL(url);
        if (urlObj.hostname.includes('cloudinary.com')) {
            const parts = urlObj.pathname.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                let idParts = parts.slice(uploadIndex + 1);
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
