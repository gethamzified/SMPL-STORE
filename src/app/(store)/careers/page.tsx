import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 86400; // SSG-like: 24 hours — static marketing page

export const metadata: Metadata = {
    title: "Careers",
    description: "Join the SMPL team and help us build the future of streetwear. Explore open positions in design, marketing, and more.",
    alternates: {
        canonical: "https://smpl.studio/careers",
    },
    openGraph: {
        title: "Careers at SMPL",
        description: "Join the SMPL team and help us build the future of streetwear.",
        url: "https://smpl.studio/careers",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Careers at SMPL",
        description: "Join the SMPL team and help us build the future of streetwear.",
    },
};

export default function CareersPage() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
            <div className="pt-24 pb-24 px-6 md:px-12">
                <div className="max-w-4xl mx-auto space-y-16">

                    <header className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/40">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">Hiring</span>
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tighter">Join the Movement</h1>
                        <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl">
                            We are always looking for passionate individuals who value craftsmanship, detail, and quality. If you share our vision, we want to hear from you.
                        </p>
                    </header>

                    <div className="space-y-8">
                        <h2 className="font-display text-2xl font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-4">Open Positions</h2>

                        <div className="group relative overflow-hidden rounded-none border border-border bg-background p-8 transition-colors hover:bg-muted/30">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-display text-2xl font-semibold">Senior Fashion Designer</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span>Design</span>
                                        <span className="w-1 h-1 rounded-full bg-border self-center"></span>
                                        <span>Full-time</span>
                                        <span className="w-1 h-1 rounded-full bg-border self-center"></span>
                                        <span>Remote / Lahore</span>
                                    </div>
                                </div>
                                <Link href="/contact" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-none font-semibold hover:bg-foreground/90 transition-colors">
                                    Apply Now <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-none border border-border bg-background p-8 transition-colors hover:bg-muted/30">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2">
                                    <h3 className="font-display text-2xl font-semibold">Marketing Specialist</h3>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                        <span>Marketing</span>
                                        <span className="w-1 h-1 rounded-full bg-border self-center"></span>
                                        <span>Full-time</span>
                                        <span className="w-1 h-1 rounded-full bg-border self-center"></span>
                                        <span>Remote</span>
                                    </div>
                                </div>
                                <Link href="/contact" className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-none font-semibold hover:bg-foreground/90 transition-colors">
                                    Apply Now <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="p-12 rounded-none border border-dashed border-border text-center space-y-4">
                            <h3 className="font-display text-xl font-semibold text-muted-foreground">Don't see your role?</h3>
                            <p className="text-muted-foreground/70">
                                We're always interested in meeting talented people. Send your portfolio and resume to <a href="mailto:careers@smpl.studio" className="text-foreground hover:underline">careers@smpl.studio</a>.
                            </p>
                        </div>

                    </div>

                </div>
            </div>


        </main>
    );
}
