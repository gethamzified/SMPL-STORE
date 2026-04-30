'use server'

import { StoreConfigService } from '@/services/config';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { GlobalDiscountConfig } from '@/lib/types';
import { verifyAdmin } from '@/lib/admin-auth';
import { v2 as cloudinary } from 'cloudinary';

export async function updateGlobalDiscount(formData: FormData) {
    try {
        if (!await verifyAdmin()) throw new Error('Unauthorized');

        const enabled = formData.get('enabled') === 'true';
        const title = formData.get('title') as string || '';
        const percentage = parseInt(formData.get('percentage') as string) || 0;
        const delaySeconds = parseInt(formData.get('delaySeconds') as string) || 5;
        const showOncePerSession = formData.get('showOncePerSession') !== 'false';
        const imageUrl = formData.get('imageUrl') as string || '';

        const discountConfig: GlobalDiscountConfig = {
            enabled,
            title,
            percentage,
            imageUrl,
            delaySeconds,
            showOncePerSession
        };

        await StoreConfigService.updateConfig('global_discount', discountConfig);
        revalidatePath('/', 'layout');

        return { success: true };
    } catch (error: any) {
        console.error('Update Global Discount Error:', error);
        return { error: error.message || 'Failed to update discount settings' };
    }
}

export async function deleteDiscountImage() {
    try {
        if (!await verifyAdmin()) throw new Error('Unauthorized');
        const supabase = await createAdminClient();

        // Get current config
        const { data } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'global_discount')
            .single();

        if (data?.value?.imageUrl) {
            cloudinary.config({
                cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_URL?.match(/:\/\/([^:]+)/)?.[1],
                api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_URL?.match(/:([^@]+)@/)?.[1]
            });

            const urlObj = new URL(data.value.imageUrl);
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

            // Update config to remove image
            await StoreConfigService.updateConfig('global_discount', {
                ...data.value,
                imageUrl: ''
            });
        }

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Delete Discount Image Error:', error);
        return { error: error.message || 'Failed to delete image' };
    }
}
