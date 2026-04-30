'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { verifyAdmin } from '@/lib/admin-auth'

export async function updateThemeConfig(formData: FormData) {
  if (!await verifyAdmin()) throw new Error('Unauthorized');
  const supabase = await createAdminClient()
  const cookieStore = await cookies()

  const primaryColor = formData.get('primaryColor') as string
  const secondaryColor = formData.get('secondaryColor') as string
  const backgroundColor = formData.get('backgroundColor') as string
  const foregroundColor = formData.get('foregroundColor') as string
  const font = formData.get('font') as string
  const borderRadius = formData.get('borderRadius') as string
  const mode = (formData.get('mode') as string) || 'light'

  const themeValue = {
    primaryColor,
    secondaryColor,
    backgroundColor,
    foregroundColor,
    font,
    borderRadius,
    mode
  }

  // Upsert Configs
  const { error } = await supabase.from('site_config').upsert({
    key: 'theme',
    value: themeValue
  }, { onConflict: 'key' })

  if (error) {
    console.error('Failed to update theme:', error)
    throw new Error('Failed to save theme configuration')
  }

  // Mirror to cookies for fast access (Zero Flash on next page load)
  const cookieOptions = { path: '/', maxAge: 60 * 60 * 24 * 365 } // 1 year
  cookieStore.set('theme', mode, cookieOptions)
  if (primaryColor) cookieStore.set('brand-primary', primaryColor, cookieOptions)
  if (font) cookieStore.set('brand-font', font, cookieOptions)
  if (backgroundColor) cookieStore.set('brand-bg', backgroundColor, cookieOptions)
  if (foregroundColor) cookieStore.set('brand-fg', foregroundColor, cookieOptions)

  revalidatePath('/', 'layout')
}

