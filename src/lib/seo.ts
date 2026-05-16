/**
 * Centralized SEO helpers for SMPL Store.
 *
 * Provides:
 * - JSON-LD schema generators for Product, Article, BreadcrumbList, Organization
 * - A reusable <JsonLd /> component for clean injection
 * - Shared constants (canonical domain, brand info)
 */

import type { Product, BlogPost } from '@/lib/types';

// ─── Constants ────────────────────────────────────────────────────────────────
function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Remove trailing slash for consistency
    return trimmed.replace(/\/+$/, '');
  }
  return `https://${trimmed}`.replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://smpl.studio'
);
export const SITE_NAME = 'SMPL';
export const SITE_DESCRIPTION =
  'Shop SMPL for premium streetwear and minimalist clothing. High-quality apparel designed for modern wardrobes.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/pexels-koolshooters-6982602.webp`;
export const TWITTER_HANDLE = '@smplstudio';
export const CURRENCY = 'PKR';

// ─── Organization Schema ──────────────────────────────────────────────────────
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/SMPL_LOGO.svg`,
    sameAs: [
      'https://instagram.com/smplstudio',
      'https://twitter.com/smplstudio',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@smpl.studio',
      contactType: 'Customer Service',
    },
  };
}

// ─── Product Schema ───────────────────────────────────────────────────────────
export function generateProductJsonLd(product: Product) {
  const images = [
    product.cover_image,
    ...(product.images || []),
  ].filter(Boolean);

  const price = product.sale_price ?? product.price;

  // Determine availability — default to InStock if we can't check
  const availability =
    product.stock !== undefined && product.stock <= 0
      ? 'https://schema.org/OutOfStock'
      : 'https://schema.org/InStock';

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: images,
    description: product.description || `Discover ${product.title} at ${SITE_NAME}.`,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: CURRENCY,
      price: price,
      availability: availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
    },
  };

  // Add product category if available
  if (product.product_type) {
    schema.category = product.product_type;
  }

  // Add aggregate rating if reviews exist
  if (
    product.review_count &&
    product.review_count > 0 &&
    product.average_rating
  ) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.average_rating,
      reviewCount: product.review_count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

// ─── Breadcrumb Schema ────────────────────────────────────────────────────────
export function generateBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Article Schema ───────────────────────────────────────────────────────────
export function generateArticleJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.content?.slice(0, 160),
    image: post.featured_image || DEFAULT_OG_IMAGE,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author_name || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/SMPL_LOGO.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/news/${post.slug}`,
    },
  };
}

// ─── WebSite Schema (for sitelinks search box) ────────────────────────────────
export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

// ─── Utility: Truncate description for meta tags ──────────────────────────────
export function truncateDescription(text: string | null | undefined, maxLength = 160): string {
  if (!text) return SITE_DESCRIPTION;

  // Strip basic HTML tags if present
  const clean = text.replace(/<[^>]*>/g, '').trim();

  if (clean.length <= maxLength) return clean;

  // Cut at last space before maxLength and add ellipsis
  const truncated = clean.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
