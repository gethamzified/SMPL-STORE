import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TopCollectionStripProps {
    collectionName: string;
    collectionSlug: string;
}

export function TopCollectionStrip({ collectionName, collectionSlug }: TopCollectionStripProps) {
    if (!collectionName || !collectionSlug) return null;

    return (
        <div className="w-full bg-black text-white py-4 relative z-[60] border-b border-white/5 overflow-hidden">
            <div className="max-w-[1920px] mx-auto px-6 flex items-center justify-center">
                <Link 
                    href={`/collection/${collectionSlug}`}
                    className="group flex items-center gap-1.5 text-[10px] sm:text-xs font-normal tracking-[0.15em] uppercase hover:opacity-75 transition-all text-white whitespace-nowrap"
                >
                    <span className="text-white/50 font-light">New Arrival /</span>
                    <span className="font-medium">Explore the {collectionName} Collection</span>
                </Link>
            </div>
        </div>
    );
}
