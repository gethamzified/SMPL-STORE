"use client";

import Link from "next/link";
import { Collection } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface MobileCollectionListProps {
    collections: Collection[];
}

export default function MobileCollectionList({ collections }: MobileCollectionListProps) {
    const pathname = usePathname();
    const isShopAll = pathname === "/shop";

    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex items-center justify-start gap-2 md:gap-3">
                <Link
                    href="/shop"
                    className={cn(
                        "whitespace-nowrap px-2 py-1.5 md:px-4 md:py-2 rounded-none text-[10px] md:text-xs font-medium uppercase tracking-wide transition-colors border",
                        isShopAll
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                    )}
                >
                    All Products
                </Link>
                {collections.map((col) => {
                    const isActive = pathname === `/collection/${col.slug}`;
                    return (
                        <Link
                            key={col.id}
                            href={`/collection/${col.slug}`}
                            className={cn(
                                "whitespace-nowrap px-2 py-1.5 md:px-4 md:py-2 rounded-none text-[10px] md:text-xs font-medium uppercase tracking-wide transition-colors border",
                                isActive
                                    ? "bg-foreground text-background border-foreground"
                                    : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                            )}
                        >
                            {col.title}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
