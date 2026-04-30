'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStoreConfig } from '@/context/StoreConfigContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const STORAGE_KEY = 'smpl_discount_popup_shown';

export function DiscountPopup() {
    const config = useStoreConfig();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);

    const { globalDiscount } = config;

    // Don't show on admin pages
    const isAdminPage = pathname?.startsWith('/admin');

    const handleClose = useCallback(() => {
        setIsOpen(false);

        if (globalDiscount.showOncePerSession) {
            try {
                sessionStorage.setItem(STORAGE_KEY, 'true');
            } catch (e) {
                // sessionStorage not available
            }
        }
    }, [globalDiscount.showOncePerSession]);

    useEffect(() => {
        if (!globalDiscount.enabled || hasTriggered || isAdminPage) {
            return;
        }

        if (globalDiscount.showOncePerSession) {
            try {
                if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
                    return;
                }
            } catch (e) {
                // sessionStorage not available
            }
        }

        const timer = setTimeout(() => {
            setIsOpen(true);
            setHasTriggered(true);
        }, globalDiscount.delaySeconds * 1000);

        return () => clearTimeout(timer);
    }, [globalDiscount.enabled, globalDiscount.delaySeconds, globalDiscount.showOncePerSession, hasTriggered, isAdminPage]);

    if (!globalDiscount.enabled || !globalDiscount.title) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="p-0 overflow-hidden bg-white w-full max-w-[340px] shadow-2xl border border-black/5"
                style={{
                    borderRadius: '0px', // Strictly box/square edges
                }}
            >
                <VisuallyHidden>
                    <DialogTitle>{globalDiscount.title}</DialogTitle>
                </VisuallyHidden>

                <div className="flex flex-col">

                    {/* Image Section - Compact Square */}
                    {globalDiscount.imageUrl && (
                        <div className="relative w-full aspect-[4/3] bg-neutral-100">
                            <Image
                                src={globalDiscount.imageUrl}
                                alt={globalDiscount.title}
                                fill
                                className="object-cover"
                                loading="lazy"
                                quality={80}
                                sizes="340px"
                            />
                        </div>
                    )}

                    {/* Content Section - Compact & Classical */}
                    <div className="p-6 text-center space-y-6 bg-white">
                        {/* Title & Percentage Combined */}
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex flex-col items-center justify-center gap-0">
                                <span className="text-5xl font-light tracking-tight text-black leading-none">
                                    {globalDiscount.percentage}%
                                </span>
                                <span className="text-5xl font-light tracking-tight text-black leading-none">
                                    OFF
                                </span>
                            </div>
                            <h3 className="text-sm font-medium tracking-[0.1em] text-neutral-900 uppercase">
                                {globalDiscount.title}
                            </h3>
                        </div>

                        {/* CTA Button - Sharp & Boxy */}
                        <Button
                            asChild
                            onClick={handleClose}
                            className="w-full h-12 text-xs font-semibold tracking-[0.2em] uppercase bg-white text-black hover:bg-neutral-50 transition-colors rounded-none border border-black"
                        >
                            <Link href="/shop">
                                Shop Now
                            </Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

