import {
    getLatestPosts,
    getFeaturedProducts
} from "@/lib/theme";

import {
    ThemeConfig,
    BrandConfig,
    HeroConfig,
    SocialConfig,
    BenefitsConfig,
    FooterConfig,
    Product,
    HomepageSection
} from "@/lib/types";
import { StoreConfigService, StoreConfig } from "@/services/config";

export async function getHomeData(): Promise<HomeData> {
    // 1. Critical Data - Single efficient call to get all config
    // This replaces 6+ separate DB calls with 1 call (which is also cached)
    const config = await StoreConfigService.getStoreConfig();

    // 2. Deferred Data - Start fetching but DO NOT await
    // These promises will be passed to Suspense boundaries
    const postsPromise = getLatestPosts(3);
    const productsPromise = getFeaturedProducts(6);

    const storeConfig = config as StoreConfig;

    return {
        // Critical (From Config)
        hero: storeConfig.hero,
        benefits: storeConfig.benefits,
        footer: storeConfig.footer,
        social: storeConfig.social,
        brand: storeConfig.brand,
        layout: storeConfig.homepageLayout,

        // Deferred (Promises)
        postsPromise,
        productsPromise,
    };
}

// Update Interface to support Promises
export interface HomeData {
    hero: HeroConfig;
    benefits: BenefitsConfig;
    footer: FooterConfig;
    social: SocialConfig;
    brand: BrandConfig;
    layout: HomepageSection[];

    // Deferred Data
    postsPromise: Promise<any[]>;
    productsPromise: Promise<Product[]>;
}
