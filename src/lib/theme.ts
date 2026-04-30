// src/lib/theme.ts
import { cookies } from 'next/headers'
import { createClient as createStaticClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import type {
    BrandConfig as BrandConfigType,
    HeroConfig,
    SocialConfig,
    BenefitsConfig,
    FooterConfig,
    MenuItem,
    FooterConfig,
    MenuItem,
    Product
} from '@/lib/types'

export type Theme = 'light' | 'dark'
export type ThemeConfig = {
    mode: Theme
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    foregroundColor: string
    font: string
    borderRadius: string
}

const defaultThemeConfig: ThemeConfig = {
    mode: 'light',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    font: 'manrope',
    borderRadius: '0.5rem'
}

const defaultBrandConfig: BrandConfigType = {
    name: 'SMPL',
    tagline: 'Modern Essentials for the Discerning Member',
    announcement: '',
    showAnnouncement: false
}

const defaultHeroConfig: HeroConfig = {
    heading: 'Winter Collection',
    subheading: 'Precision tailoring meets daily life.',
    ctaText: 'Shop Now',
    ctaLink: '/shop'
}

const defaultSocialConfig: SocialConfig = {
    instagram: '',
    twitter: '',
    facebook: ''
}

const defaultBenefitsConfig: BenefitsConfig = {
    enabled: true,
    items: [
        { icon: 'truck', text: 'Free shipping on all orders this week' },
        { icon: 'rotate', text: '14-day hassle-free returns' },
        { icon: 'shield', text: '30-day product warranty' },
        { icon: 'headphones', text: 'Customer support 24/7' }
    ]
}

const defaultFooterConfig: FooterConfig = {
    tagline: 'Curating the modern wardrobe through discipline and detail.',
    columns: [
        {
            title: 'Shop',
            links: [
                { label: 'All Products', url: '/shop' },
                { label: 'New Arrivals', url: '/shop?sort=newest' },
                { label: 'Best Sellers', url: '/shop?sort=best-selling' },
            ]
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', url: '/about' },
                { label: 'The Journal', url: '/news' },
                { label: 'Careers', url: '/careers' },
                { label: 'Contact', url: '/contact' },
            ]
        },
        {
            title: 'Account',
            links: [
                { label: 'Login', url: '/login' },
                { label: 'Sign Up', url: '/register' },
                { label: 'My Orders', url: '/account/orders' },
                { label: 'Settings', url: '/account' },
            ]
        },
        {
            title: 'Legal',
            links: [
                { label: 'Privacy Policy', url: '/privacy' },
                { label: 'Terms of Service', url: '/terms' },
                { label: 'Cookie Policy', url: '/cookies' },
            ]
        }
    ],
    showSocial: true,
    copyright: '© {year} {brand}. All rights reserved.'
}

// Create static supabase client for caching
const getSupabase = () => createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ==========================================
// CACHED FETCHERS (with revalidation tags)
// Edge-cached, shared across all users
// ==========================================

// Unified site_config fetcher - gets all keys in one call
export const getSiteConfig = unstable_cache(
    async () => {
        try {
            const supabase = getSupabase()
            const { data, error } = await supabase
                .from('site_config')
                .select('key, value')

            if (error) throw error

            const config: Record<string, unknown> = {}
            data?.forEach(row => {
                config[row.key] = row.value
            })
            return config
        } catch {
            // Return empty config on error - defaults will be used
            return {}
        }
    },
    ['site-config-all'],
    { tags: ['site_config'], revalidate: 3600 } // 1 hour
)

// Navigation menu fetcher
export const getNavigation = unstable_cache(
    async (handle = 'main-menu'): Promise<MenuItem[]> => {
        try {
            const supabase = getSupabase()
            const { data } = await supabase
                .from('navigation_menus')
                .select('items')
                .eq('handle', handle)
                .maybeSingle()
            return (data?.items as MenuItem[]) || []
        } catch {
            return []
        }
    },
    ['navigation'],
    { tags: ['navigation_menus'], revalidate: 3600 }
)

// Blog posts fetcher (for NewsSection)
export const getLatestPosts = unstable_cache(
    async (limit = 3) => {
        try {
            const supabase = getSupabase()
            const { data } = await supabase
                .from('blog_posts')
                .select('id, title, slug, excerpt, featured_image, published_at, author_name')
                .eq('status', 'published')
                .order('published_at', { ascending: false })
                .limit(limit)
            return data || []
        } catch {
            return []
        }
    },
    ['blog-posts-latest'],
    { tags: ['blog_posts'], revalidate: 3600 }
)

// ==========================================
// CACHED STOREFRONT DATA (Collections & Products)
// Edge-cached, shared across all users - NO per-request DB
// ==========================================



export const getFeaturedProducts = unstable_cache(
    async (limit = 6) => {
        try {
            const supabase = getSupabase()
            const { data } = await supabase
                .from('products')
                .select('id, title, slug, price, sale_price, cover_image, images')
                .eq('status', 'active')
                .eq('is_featured', true)
                .order('created_at', { ascending: false })
                .limit(limit)
            return data || []
        } catch {
            return []
        }
    },
    ['featured-products'],
    { tags: ['products'], revalidate: 3600 }
)



// ==========================================
// TYPED CONFIG GETTERS (with defaults)
// ==========================================

export async function getTheme(): Promise<Theme> {
    const cookieStore = await cookies()
    return (cookieStore.get('theme')?.value as Theme) || 'light'
}

export async function getThemeConfig(): Promise<ThemeConfig> {
    try {
        const config = await getSiteConfig()
        const themeConfig = config.theme as Partial<ThemeConfig> | undefined
        return { ...defaultThemeConfig, ...themeConfig }
    } catch {
        return defaultThemeConfig
    }
}

export async function getBrandConfig(): Promise<BrandConfigType> {
    try {
        const config = await getSiteConfig()
        const brandConfig = config.brand as Partial<BrandConfigType> | undefined
        return { ...defaultBrandConfig, ...brandConfig }
    } catch {
        return defaultBrandConfig
    }
}

export async function getHeroConfig(): Promise<HeroConfig> {
    try {
        const config = await getSiteConfig()
        const heroConfig = config.hero as Partial<HeroConfig> | undefined
        return { ...defaultHeroConfig, ...heroConfig }
    } catch {
        return defaultHeroConfig
    }
}

export async function getSocialConfig(): Promise<SocialConfig> {
    try {
        const config = await getSiteConfig()
        const socialConfig = config.social as Partial<SocialConfig> | undefined
        return { ...defaultSocialConfig, ...socialConfig }
    } catch {
        return defaultSocialConfig
    }
}

export async function getBenefitsConfig(): Promise<BenefitsConfig> {
    try {
        const config = await getSiteConfig()
        const benefitsConfig = config.benefits as Partial<BenefitsConfig> | undefined
        return { ...defaultBenefitsConfig, ...benefitsConfig }
    } catch {
        return defaultBenefitsConfig
    }
}

export async function getFooterConfig(): Promise<FooterConfig> {
    try {
        const config = await getSiteConfig()
        const footerConfig = config.footer as Partial<FooterConfig> | undefined
        return { ...defaultFooterConfig, ...footerConfig }
    } catch {
        return defaultFooterConfig
    }
}

// ==========================================
// FULL PAGE CONFIG (for SSR pages)
// ==========================================

export type FullSiteConfig = {
    theme: ThemeConfig
    brand: BrandConfigType
    hero: HeroConfig
    social: SocialConfig
    benefits: BenefitsConfig
    footer: FooterConfig
    navigation: MenuItem[]
}

export async function getFullSiteConfig(): Promise<FullSiteConfig> {
    const [configData, navigation] = await Promise.all([
        getSiteConfig(),
        getNavigation('main-menu')
    ])

    return {
        theme: { ...defaultThemeConfig, ...(configData.theme as Partial<ThemeConfig>) },
        brand: { ...defaultBrandConfig, ...(configData.brand as Partial<BrandConfigType>) },
        hero: { ...defaultHeroConfig, ...(configData.hero as Partial<HeroConfig>) },
        social: { ...defaultSocialConfig, ...(configData.social as Partial<SocialConfig>) },
        benefits: { ...defaultBenefitsConfig, ...(configData.benefits as Partial<BenefitsConfig>) },
        footer: { ...defaultFooterConfig, ...(configData.footer as Partial<FooterConfig>) },
        navigation
    }
}
export const getHomepageLayout = unstable_cache(
    async () => {
        try {
            const supabase = getSupabase()
            const { data } = await supabase
                .from('site_config')
                .select('value')
                .eq('key', 'homepage_layout')
                .single()

            // Default layout if missing
            return data?.value || [
                {
                    id: "hero",
                    type: "hero",
                    enabled: true,
                    order: 0,
                    content: {
                        heading: "SMPL",
                        subheading: "Timeless Wardrobe.\nEveryday Power."
                    }
                }
            ]
        } catch {
            return [
                {
                    id: "hero",
                    type: "hero",
                    enabled: true,
                    order: 0,
                    content: {
                        heading: "SMPL",
                        subheading: "Minimalist Design.\nPremium Quality."
                    }
                }
            ]
        }
    },
    ['homepage-layout'],
    { tags: ['site_config'], revalidate: 3600 }
)
