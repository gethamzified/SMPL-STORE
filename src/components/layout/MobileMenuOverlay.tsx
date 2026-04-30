"use client";

import Link from "next/link";
import { X, Instagram, Facebook, ArrowRight } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";

interface MobileMenuOverlayProps {
    navLinks: MenuItem[];
    onClose: () => void;
}

export default function MobileMenuOverlay({ navLinks, onClose }: MobileMenuOverlayProps) {
    const lenis = useLenis();
    const pathname = usePathname();

    return (
        <div className="fixed inset-0 z-[1000] overflow-hidden">
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            />

            {/* Sidebar Content */}
            <div
                className="absolute top-0 left-0 h-full w-[88%] max-w-[420px] bg-white/40 backdrop-blur-2xl text-black shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 ease-out-expo"
                style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=2574&auto=format&fit=crop')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'left center'
                }}
            >
                {/* Overlay to ensure readability on clouds */}
                <div className="absolute inset-0 bg-white/20 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-black/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.28em] text-black/60">Explore</span>
                    <button
                        onClick={onClose}
                        className="bg-[#ff0000] text-white w-8 h-8 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5 stroke-[3]" />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="relative z-10 flex-1 overflow-y-auto px-5 py-10 flex flex-col gap-6">
                    {navLinks.map((link, i) => (
                        <div
                            key={link.label}
                            className="animate-in fade-in slide-in-from-left-4 duration-500"
                            style={{ animationDelay: `${100 + i * 50}ms`, animationFillMode: 'both' }}
                        >
                            <Link
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
                                className="group flex items-center justify-between py-3 border-b border-black/5"
                            >
                                <span className="text-4xl font-black uppercase tracking-tighter group-hover:pl-2 transition-all duration-300">
                                    {link.label}
                                </span>
                                <ArrowRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </Link>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="relative z-10 p-6 border-t border-black/5 mt-auto">
                    <div className="mb-8">
                         <span className="text-4xl font-black tracking-tighter text-[#ff0000]">SMPL.</span>
                    </div>
                    
                    <div className="flex gap-6 mb-8">
                        <Link href="https://www.instagram.com/smpl.pakistan/" target="_blank" className="hover:opacity-60 transition-opacity">
                            <Instagram className="w-5 h-5 text-black/60" />
                        </Link>
                        <Link href="https://facebook.com" target="_blank" className="hover:opacity-60 transition-opacity">
                            <Facebook className="w-5 h-5 text-black/60" />
                        </Link>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
                            © 2026 SMPL STUDIOS
                        </p>
                        <p className="text-[10px] font-bold leading-relaxed text-black/40 max-w-[220px] uppercase">
                            DEFINING THE FUTURE OF MODERN MINIMALISM.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
