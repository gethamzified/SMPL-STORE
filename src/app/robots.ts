import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE_URL

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/checkout/', '/account/', '/login/', '/register/', '/cart/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
