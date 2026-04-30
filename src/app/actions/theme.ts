'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// ============================================
// COOKIE SETTERS - Used by Admin to persist theme
// These set cookies so layout.tsx never waits for DB
// ============================================

export async function setTheme(theme: 'light' | 'dark') {
  const cookieStore = await cookies()
  cookieStore.set('theme', theme, { 
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  })
  revalidatePath('/')
}

export async function setBrandColor(color: string) {
  const cookieStore = await cookies()
  cookieStore.set('brand-primary', color, { 
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })
  revalidatePath('/')
}

export async function setFont(font: string) {
  const cookieStore = await cookies()
  cookieStore.set('font', font, { 
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax'
  })
  revalidatePath('/')
}

// ============================================
// FULL THEME SYNC - Called when Admin saves theme
// Mirrors DB config into cookies for instant load
// ============================================

export type ThemeCookies = {
  theme?: 'light' | 'dark'
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  foregroundColor?: string
  font?: string
  borderRadius?: string
}

export async function syncThemeToCookies(config: ThemeCookies) {
  const cookieStore = await cookies()
  const cookieOptions = { 
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax' as const
  }

  if (config.theme) {
    cookieStore.set('theme', config.theme, cookieOptions)
  }
  if (config.primaryColor) {
    cookieStore.set('brand-primary', config.primaryColor, cookieOptions)
  }
  if (config.secondaryColor) {
    cookieStore.set('brand-secondary', config.secondaryColor, cookieOptions)
  }
  if (config.backgroundColor) {
    cookieStore.set('brand-background', config.backgroundColor, cookieOptions)
  }
  if (config.foregroundColor) {
    cookieStore.set('brand-foreground', config.foregroundColor, cookieOptions)
  }
  if (config.font) {
    cookieStore.set('font', config.font, cookieOptions)
  }
  if (config.borderRadius) {
    cookieStore.set('brand-radius', config.borderRadius, cookieOptions)
  }

  // Revalidate cache tags so other pages pick up changes
  revalidatePath('/', 'layout')
}

// ============================================
// CACHE INVALIDATION - Called after admin updates
// ============================================

export async function invalidateSiteConfig() {
  revalidatePath('/', 'layout')
}
