'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { X, ArrowDownWideNarrow, ArrowUpNarrowWide, Clock } from 'lucide-react';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface ProductFiltersProps {
    availableSizes?: string[];
}

export default function ProductFilters({ availableSizes = SIZES }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const currentSizes = searchParams.get('size')?.split(',').filter(Boolean) || [];
    const currentSort = searchParams.get('sort') || 'newest';

    const updateFilter = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Always reset to page 1 when filtering
        params.delete('page');

        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    }, [router, searchParams]);

    const toggleSize = (size: string) => {
        const newSizes = currentSizes.includes(size)
            ? currentSizes.filter(s => s !== size)
            : [...currentSizes, size];

        updateFilter('size', newSizes.join(',') || null);
    };

    const handleSort = (sortValue: string) => {
        if (sortValue === 'newest') {
            updateFilter('sort', null); // Default
        } else {
            updateFilter('sort', sortValue);
        }
    };

    const handleClear = () => {
        startTransition(() => {
            router.push(window.location.pathname, { scroll: false });
        });
    };

    const hasFilters = currentSizes.length > 0 || currentSort !== 'newest';

    return (
        <div className="relative mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 py-4 border-b border-border/50">
                {/* Size Filter */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Size</span>
                    <div className="flex flex-wrap gap-1.5">
                        {availableSizes.filter(s => SIZES.includes(s) || s.length < 5).map((size) => {
                            const active = currentSizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    onClick={() => toggleSize(size)}
                                    disabled={isPending}
                                    className={cn(
                                        "h-7 min-w-[2rem] px-2 text-[11px] font-medium transition-all duration-200 border rounded-sm",
                                        active
                                            ? "bg-foreground text-background border-foreground shadow-sm"
                                            : "bg-background text-foreground/80 border-border hover:border-foreground/50 hover:text-foreground"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden md:block w-px h-4 bg-border/50" />

                {/* Sort Options */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">Sort By</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handleSort('newest')}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-1.5 h-7 px-3 text-[11px] font-medium transition-all duration-200 border rounded-sm",
                                currentSort === 'newest'
                                    ? "bg-foreground text-background border-foreground shadow-sm"
                                    : "bg-background text-foreground/80 border-border hover:border-foreground/50 hover:text-foreground"
                            )}
                        >
                            <Clock size={12} />
                            Latest
                        </button>
                        <button
                            onClick={() => handleSort('price-asc')}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-1.5 h-7 px-3 text-[11px] font-medium transition-all duration-200 border rounded-sm",
                                currentSort === 'price-asc'
                                    ? "bg-foreground text-background border-foreground shadow-sm"
                                    : "bg-background text-foreground/80 border-border hover:border-foreground/50 hover:text-foreground"
                            )}
                        >
                            <ArrowDownWideNarrow size={12} />
                            Price Low
                        </button>
                        <button
                            onClick={() => handleSort('price-desc')}
                            disabled={isPending}
                            className={cn(
                                "flex items-center gap-1.5 h-7 px-3 text-[11px] font-medium transition-all duration-200 border rounded-sm",
                                currentSort === 'price-desc'
                                    ? "bg-foreground text-background border-foreground shadow-sm"
                                    : "bg-background text-foreground/80 border-border hover:border-foreground/50 hover:text-foreground"
                            )}
                        >
                            <ArrowUpNarrowWide size={12} />
                            Price High
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="ml-auto flex items-center">
                    {hasFilters && (
                        <button
                            onClick={handleClear}
                            disabled={isPending}
                            className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all"
                        >
                            <X size={12} />
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Loading Indicator - minimalist line */}
            <div className={cn(
                "absolute bottom-0 left-0 right-0 h-[1px] bg-foreground/10 overflow-hidden transition-opacity duration-300",
                isPending ? "opacity-100" : "opacity-0"
            )}>
                <div className="h-full bg-foreground animate-shimmer w-1/3" />
            </div>
        </div>
    );
}
