import { Suspense } from "react";
import { HomeData } from "@/lib/home-data";
import { HeroCarousel } from "./HeroCarousel";

async function HomeHeroLoader({ productsPromise, hero }: { productsPromise: Promise<any[]>; hero: any }) {
    const products = await productsPromise;
    return <HeroCarousel products={products} hero={hero} />;
}

interface HomeLayoutProps {
    data: HomeData;
}

export default function HomeLayout({ data }: HomeLayoutProps) {
    const { productsPromise, hero } = data;

    return (
        <div className="relative w-full">
            <Suspense fallback={<div className="h-screen w-full animate-pulse bg-black/5 backdrop-blur-sm" />}>
                <HomeHeroLoader productsPromise={productsPromise} hero={hero} />
            </Suspense>
        </div>
    );
}
