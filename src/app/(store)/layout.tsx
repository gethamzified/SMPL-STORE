import { Suspense } from 'react';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import Image from 'next/image';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { StoreConfigService } from '@/services/config';
import { FooterSkeleton } from '@/components/skeletons/FooterSkeleton';
import { StoreProviders } from '@/components/layout/StoreProviders';
import { SmoothScroll } from '@/components/layout/SmoothScroll';

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const config = await StoreConfigService.getStoreConfig();
    const footerConfig = config.footer;
    const brand = config.brand;
    const socialConfig = config.social;
    const navItems = config.navigation.main;

    // Background image from admin panel → Cloudinary 
    const backgroundImage = config.hero.image || '';

    return (
        <StoreProviders>
            <SmoothScroll>
                <div className="flex flex-col min-h-screen text-foreground relative">
                    {/* Optimized Background Image Layer */}
                    {backgroundImage && (
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                            <div className="relative w-full h-full">
                                <Image
                                    src={backgroundImage}
                                    alt="Store Background"
                                    fill
                                    priority
                                    className="object-cover object-top"
                                    sizes="100vw"
                                    quality={85}
                                />
                            </div>
                        </div>
                    )}

                    {/* Navbar layer — absolute so hero content can go under it */}
                    <div className="absolute top-0 left-0 w-full z-50">
                        {brand.showAnnouncement && brand.announcement && (
                            <AnnouncementBar text={brand.announcement} />
                        )}
                        <Navbar brandName={brand.name} navItems={navItems} />
                    </div>

                    {/* Page Content */}
                    <div className="flex-grow relative">
                        {children}
                    </div>

                    {/* Footer */}
                    <Suspense fallback={<FooterSkeleton />}>
                        <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
                    </Suspense>
                </div>
            </SmoothScroll>
        </StoreProviders>
    );
}
