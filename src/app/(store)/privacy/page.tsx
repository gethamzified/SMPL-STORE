import { getBrandConfig } from "@/lib/theme";
import { Metadata } from "next";


export const revalidate = 86400; // SSG-like: 24 hours — static legal page

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Learn how SMPL handles your data. Read our privacy policy for details on collection, usage, and protection of your personal information.",
    robots: {
        index: false,
        follow: true,
    },
};

export default async function PrivacyPage() {
    const brand = await getBrandConfig();

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
            <div className="pt-24 md:pt-28 pb-20 md:pb-24 px-6 md:px-12">
                <div className="max-w-3xl mx-auto space-y-12">

                    <header className="space-y-6 border-b border-border pb-12">
                        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
                        <p className="text-muted-foreground text-lg">Last updated: <span suppressHydrationWarning>{new Date().toLocaleDateString()}</span></p>
                    </header>

                    <section className="space-y-8 font-body text-lg leading-relaxed text-muted-foreground">
                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">1. Introduction</h2>
                            <p>
                                At {brand.name}, we value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you visit our website or make a purchase.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">2. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us, such as when you create an account, make a purchase, or sign up for our newsletter. This may include your name, email address, shipping address, and payment information.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">3. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to process your orders, communicate with you about your account or transactions, and send you marketing communications if you have opted in.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">4. Data Security</h2>
                            <p>
                                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">5. Cookies</h2>
                            <p>
                                We use cookies to improve your browsing experience and analyze site traffic. You can control cookie preferences through your browser settings.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">6. Contact Us</h2>
                            <p>
                                If you have any questions about this privacy policy, please contact us.
                            </p>
                        </div>
                    </section>

                </div>
            </div>


        </main>
    );
}
