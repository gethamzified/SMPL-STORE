import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://smpl.studio'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/checkout/', '/account/', '/login/', '/register/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
