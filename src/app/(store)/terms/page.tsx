import { getBrandConfig } from "@/lib/theme";


export const revalidate = 86400; // SSG-like: 24 hours — static legal page

export const metadata = {
    title: "Terms of Service",
    description: "Review our terms and conditions for using our services.",
}

export default async function TermsPage() {
    const brand = await getBrandConfig();

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
            <div className="pt-24 md:pt-28 pb-20 md:pb-24 px-6 md:px-12">
                <div className="max-w-3xl mx-auto space-y-12">

                    <header className="space-y-6 border-b border-border pb-12">
                        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>
                        <p className="text-muted-foreground text-lg">Last updated: <span suppressHydrationWarning>{new Date().toLocaleDateString()}</span></p>
                    </header>

                    <section className="space-y-8 font-body text-lg leading-relaxed text-muted-foreground">
                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">1. Agreement to Terms</h2>
                            <p>
                                By accessing our website, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">2. Use License</h2>
                            <p>
                                Permission is granted to temporarily download one copy of the materials (information or software) on {brand.name}'s website for personal, non-commercial transitory viewing only.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">3. Disclaimer</h2>
                            <p>
                                The materials on {brand.name}'s website are provided on an 'as is' basis. {brand.name} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">4. Limitations</h2>
                            <p>
                                In no event shall {brand.name} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on {brand.name}'s website.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">5. Governing Law</h2>
                            <p>
                                These terms and conditions are governed by and construed in accordance with the laws, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                            </p>
                        </div>
                    </section>

                </div>
            </div>


        </main>
    );
}
