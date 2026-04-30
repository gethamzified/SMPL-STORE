import type { Metadata } from "next";
import { manrope, inter, playfair, spaceMono, greatVibes, getFont } from "@/lib/fonts";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { hexToHslValues } from "@/lib/utils";
import { StoreConfigService } from "@/services/config";

// ============================================
// STATIC METADATA - No DB call, instant
// ============================================
const baseUrl = "https://smpl.studio";
const SITE_NAME = 'SMPL';
const TAGLINE = 'Premium Streetwear & Minimalist Clothing';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${SITE_NAME} | ${TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `Shop ${SITE_NAME} for premium streetwear and minimalist clothing. Discover high-quality apparel designed for modern wardrobes. Experience Timeless Power.`,
  keywords: ["Premium Streetwear", "SMPL", "Minimalist Clothing", "Apparel", "Fashion", "Streetwear Brand"],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: `Shop ${SITE_NAME} for premium streetwear and minimalist clothing. High-quality apparel designed for modern wardrobes.`,
    type: "website",
    url: baseUrl,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: `${baseUrl}/pexels-koolshooters-6982602.webp`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Premium Streetwear`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${TAGLINE}`,
    description: `Shop ${SITE_NAME} for premium streetwear and minimalist clothing. High-quality apparel designed for modern wardrobes.`,
    images: [`${baseUrl}/pexels-koolshooters-6982602.webp`],
    creator: "@smplstudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: '/smplicon.svg',
    apple: '/smplicon.svg',
  },
};

// ============================================
// DEFAULTS - Used when no cookie is set
// ============================================
const DEFAULTS = {
  theme: 'light' as const,
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  font: 'helvetica',
  borderRadius: '0.5rem',
};

// ... imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // REMOVED: cookies() call was forcing ALL pages into dynamic rendering,
  // defeating ISR/SSG. The theme is hardcoded to 'light' anyway.

  // Fetch Config from DB (Cached via unstable_cache in StoreConfigService)
  const config = await StoreConfigService.getStoreConfig();

  // Force Light Mode for Storefront (Admin handles its own dark mode)
  const theme = 'light';

  // Brand settings from DB
  const primaryColor = config.theme.primaryColor;
  const fontName = config.theme.font;
  const borderRadius = config.theme.borderRadius;

  const font = getFont(fontName.toLowerCase());

  // Hero Images
  const defaultHeroImage = "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";
  // Variables removed as calculated but unused, and they referenced 'slides' which is now removed.


  // Map Brand colors to shadcn HSL variables
  const hslPrimary = hexToHslValues(primaryColor);
  const hslBackground = hexToHslValues(config.theme.backgroundColor || '#ffffff');
  const hslForeground = hexToHslValues(config.theme.foregroundColor || '#000000');

  // Dynamic CSS variables
  const dynamicStyles = {
    colorScheme: theme,
    ['--brand-primary' as string]: primaryColor,
    ['--brand-radius' as string]: borderRadius,
    ['--font-display' as string]: fontName === 'helvetica' ? 'var(--font-helvetica)' : `var(--font-${fontName})`,
    ['--font-body' as string]: fontName === 'helvetica' ? 'var(--font-helvetica)' : `var(--font-${fontName})`,

    // Shadcn overrides
    ['--primary' as string]: hslPrimary,
    ['--background' as string]: hslBackground,
    ['--foreground' as string]: hslForeground,
    ['--radius' as string]: borderRadius,
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={theme}
      style={dynamicStyles}
      className={`${theme} ${manrope.variable} ${inter.variable} ${playfair.variable} ${spaceMono.variable} ${greatVibes.variable}`}
    >
      <head>
        {/* Preconnect to critical CDNs for faster resource loading */}
        <link rel="preconnect" href="https://qlopyjttjddgupgyktux.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://qlopyjttjddgupgyktux.supabase.co" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SMPL",
              "url": "https://smpl.studio",
              "logo": "https://smpl.studio/logo.png",
              "sameAs": [
                "https://instagram.com/smplstudio",
                "https://twitter.com/smplstudio"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "hello@smpl.studio",
                "contactType": "Customer Service"
              }
            })
          }}
        />
      </head>
      <body className={font.className}>
        <Providers initialConfig={config}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

