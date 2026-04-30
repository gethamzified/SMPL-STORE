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
import { createAdminClient, ensureBucketExists } from '@/lib/supabase/admin';
import { processImage, generateImageFilename } from '@/lib/image-processor';

export async function uploadSiteAsset(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error('No file provided');

        await ensureBucketExists('site-assets');
        const supabase = await createAdminClient();

        // Process through Sharp: resize for hero (up to 2560px), convert to WebP, generate blur
        const processed = await processImage(file, 'hero');
        const fileName = generateImageFilename('hero');

        const { error: uploadError } = await supabase.storage
            .from('site-assets')
            .upload(fileName, processed.buffer, {
                contentType: processed.contentType,
                cacheControl: '31536000',
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(fileName);
        return { success: true, url: publicUrl, blurDataURL: processed.blurDataURL };
    } catch (error: any) {
        console.error('Upload Asset Error:', error);
        return { error: error.message || 'Failed to upload asset' };
    }
}

export async function deleteSiteAsset(url: string) {
    try {
        if (!url) return { success: true };

        // Extract path from URL
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/site-assets/');
        if (pathParts.length < 2) return { success: true }; // Not a site-asset URL

        const filePath = pathParts[1];

        const supabase = await createAdminClient();
        const { error } = await supabase.storage.from('site-assets').remove([filePath]);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Delete Asset Error:', error);
        return { error: error.message || 'Failed to delete asset' };
    }
}
