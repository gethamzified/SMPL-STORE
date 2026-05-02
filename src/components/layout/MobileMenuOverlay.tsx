"use client";

import Link from "next/link";
import { X, Instagram, Facebook } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileMenuOverlayProps {
    navLinks: MenuItem[];
    onClose: () => void;
}

export default function MobileMenuOverlay({ navLinks, onClose }: MobileMenuOverlayProps) {
    const lenis = useLenis();
    const pathname = usePathname();

    return (
        <div className="fixed inset-0 z-[1000] overflow-hidden flex justify-start">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
            />

            {/* Sidebar Content */}
            <div
                className="relative h-full w-[88%] max-w-[400px] bg-white border-r border-[#1a1a1a] shadow-2xl flex flex-col animate-in slide-in-from-left duration-500 ease-out-expo"
            >
                {/* Header Section */}
                <div className="grid grid-cols-[1fr_auto] border-b border-[#1a1a1a] h-[64px] shrink-0">
                    <div className="flex items-center px-6">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-ascent">Explore</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-[64px] h-full border-l border-[#1a1a1a] flex items-center justify-center hover:bg-neutral-50 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links Grid */}
                <nav className="flex-1 overflow-y-auto border-b border-[#1a1a1a]">
                    <div className="grid grid-cols-1">
                        {navLinks.map((link, i) => (
                            <Link
                                key={link.label}
                                href={link.url}
                                onClick={(e) => {
                                    if (link.url.startsWith('/#') && pathname === '/') {
                                        e.preventDefault();
                                        onClose();
                                        const targetId = link.url.replace('/#', '');
                                        const element = document.getElementById(targetId);
                                        if (element && lenis) {
                                            setTimeout(() => {
                                                lenis.scrollTo(element, { offset: -40, duration: 1.5 });
                                            }, 100);
                                        }
                                    } else {
                                        onClose();
                                    }
                                }}
                                className="group flex items-center justify-between px-6 py-8 border-b border-[#1a1a1a] hover:bg-neutral-50 transition-all duration-300 animate-in fade-in slide-in-from-left-4"
                                style={{ animationDelay: `${100 + i * 50}ms`, animationFillMode: 'both' }}
                            >
                                <span className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-black group-hover:translate-x-2 transition-transform duration-500">
                                    {link.label}
                                </span>
                                <div className="w-8 h-8 rounded-full border border-[#1a1a1a] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Footer Grid */}
                <div className="bg-neutral-50 shrink-0">
                    <div className="grid grid-cols-2 border-b border-[#1a1a1a]">
                        <Link 
                            href="https://www.instagram.com/smpl.pakistan/" 
                            target="_blank" 
                            className="flex items-center justify-center gap-2 py-6 border-r border-[#1a1a1a] hover:bg-white transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <Instagram className="w-4 h-4" />
                            Instagram
                        </Link>
                        <Link 
                            href="https://facebook.com" 
                            target="_blank" 
                            className="flex items-center justify-center gap-2 py-6 hover:bg-white transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <Facebook className="w-4 h-4" />
                            Facebook
                        </Link>
                    </div>
                    
                    <div className="p-6 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black">
                            © 2026 SMPL STUDIOS
                        </p>
                        <p className="text-[10px] font-bold leading-tight text-black max-w-[240px] uppercase opacity-60">
                            DEFINING THE FUTURE OF MODERN MINIMALISM.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
