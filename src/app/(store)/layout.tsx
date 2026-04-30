import { Suspense } from 'react';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
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

    return (
        <StoreProviders>
            <SmoothScroll>
                <div 
                    className="flex flex-col min-h-screen text-foreground bg-cover bg-top bg-no-repeat"
                    style={{ 
                        backgroundImage: "url('/clouds.png')" 
                    }}
                >
                    <div className="absolute top-0 left-0 w-full z-50">
                        {brand.showAnnouncement && brand.announcement && (
                            <AnnouncementBar text={brand.announcement} />
                        )}
                        <Navbar brandName={brand.name} navItems={navItems} />
                    </div>

                    <div className="flex-grow">
                        {children}
                    </div>
                    <Suspense fallback={<FooterSkeleton />}>
                        <Footer config={footerConfig} brandName={brand.name} social={socialConfig} />
                    </Suspense>
                </div>
            </SmoothScroll>
        </StoreProviders>
    );
}
