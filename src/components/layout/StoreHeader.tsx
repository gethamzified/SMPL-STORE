import { Suspense } from 'react';
import { StoreConfigService } from '@/services/config';
import Navbar from '@/components/layout/Navbar';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { TopCollectionStrip } from '@/components/sections/TopCollectionStrip';
import { Collection } from '@/lib/types';

interface StoreHeaderProps {
    collectionsPromise?: Promise<Collection[]>;
}

async function CollectionStripLoader({ promise }: { promise: Promise<Collection[]> }) {
    const collections = await promise;
    const firstCollection = collections?.[0];

    if (!firstCollection) return null;

    return (
        <TopCollectionStrip
            collectionName={firstCollection.title}
            collectionSlug={firstCollection.slug}
        />
    );
}

export async function StoreHeader({ collectionsPromise }: StoreHeaderProps) {
    const config = await StoreConfigService.getStoreConfig();

    return (
        <div className="relative z-50">
            {collectionsPromise && (
                <Suspense fallback={null}>
                    <CollectionStripLoader promise={collectionsPromise} />
                </Suspense>
            )}

            {config.brand.showAnnouncement && config.brand.announcement && (
                <AnnouncementBar text={config.brand.announcement} />
            )}
            <Navbar
                brandName={config.brand.name}
                navItems={config.navigation.main}
            />
        </div>
    );
}
