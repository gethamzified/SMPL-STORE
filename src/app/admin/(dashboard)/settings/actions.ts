'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { verifyAdmin } from '@/lib/admin-auth'

// ==========================================
// UPDATE SITE CONFIG
// ==========================================
export async function updateSiteConfig(formData: FormData) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  const supabase = await createAdminClient()
  const cookieStore = await cookies()

  const heroHeading = formData.get('heroHeading') as string
  const heroSub = formData.get('heroSub') as string
  const heroCtaText = formData.get('heroCtaText') as string
  const heroCtaLink = formData.get('heroCtaLink') as string

  // New: Accept URL directly from client-side upload
  const heroImage = formData.get('heroImage') as string
  const heroBlurDataURL = formData.get('heroBlurDataURL') as string

  const themeColor = formData.get('themeColor') as string

  const brandName = formData.get('brandName') as string
  const announcement = formData.get('announcement') as string

  // Build hero config
  const heroConfig: Record<string, any> = {
    heading: heroHeading,
    subheading: heroSub,
    image: heroImage, // Use the URL provided by client
    ctaText: heroCtaText || 'Shop Now',
    ctaLink: heroCtaLink || '/collection'
  }

  if (heroBlurDataURL) {
    heroConfig.blurDataURL = heroBlurDataURL
  }

  // Upsert Configs
  await supabase.from('site_config').upsert({
    key: 'hero',
    value: heroConfig
  }, { onConflict: 'key' })

  // Only update theme if color is provided
  if (themeColor) {
    await supabase.from('site_config').upsert({
      key: 'theme',
      value: { primaryColor: themeColor }
    }, { onConflict: 'key' })

    cookieStore.set('brand-color', themeColor, { path: '/' })
  }

  await supabase.from('site_config').upsert({
    key: 'brand',
    value: { name: brandName, announcement: announcement }
  }, { onConflict: 'key' })

  revalidatePath('/', 'layout')
  revalidatePath('/admin/settings')

  return { success: true }
}

// ==========================================
// DELETE HERO IMAGE
// ==========================================
export async function deleteHeroImage() {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  const supabase = await createAdminClient()

  const { data: current } = await supabase.from('site_config').select('value').eq('key', 'hero').single()

  await supabase.from('site_config').upsert({
    key: 'hero',
    value: { ...current?.value, image: '' }
  }, { onConflict: 'key' })

  revalidatePath('/', 'layout')
  revalidatePath('/admin/settings')

  return { success: true }
}

