import { Suspense } from "react";
import { HomeData } from "@/lib/home-data";
import { HomeProductsLoader } from "@/components/home/HomeProductsLoader";
import { HeroCarousel } from "./HeroCarousel";

// Skeletons
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

async function HomeHeroLoader({ productsPromise }: { productsPromise: Promise<any[]> }) {
    const products = await productsPromise;
    return <HeroCarousel products={products} />;
}

interface HomeLayoutProps {
    data: HomeData;
}

export default function HomeLayout({ data }: HomeLayoutProps) {
    const { productsPromise } = data;

    return (
        <div className="relative w-full">
            {/* High-Tech Product Carousel Hero */}
            <Suspense fallback={<div className="h-screen w-full animate-pulse bg-black/5 backdrop-blur-sm" />}>
                <HomeHeroLoader productsPromise={productsPromise} />
            </Suspense>


        </div>
    );
}
