
export const revalidate = 86400; // SSG-like: 24 hours — static legal page

export const metadata = {
    title: "Cookie Policy",
    description: "Learn about how we use cookies on our website.",
}

export default async function CookiesPage() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
            <div className="pt-10 md:pt-14 pb-24 px-6 md:px-12">
                <div className="max-w-3xl mx-auto space-y-12">

                    <header className="space-y-6 border-b border-border pb-12">
                        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Cookie Policy</h1>
                        <p className="text-muted-foreground text-lg">Last updated: <span suppressHydrationWarning>{new Date().toLocaleDateString()}</span></p>
                    </header>

                    <section className="space-y-8 font-body text-lg leading-relaxed text-muted-foreground">
                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">1. What Are Cookies</h2>
                            <p>
                                Cookies are small text files that are set on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">2. How We Use Cookies</h2>
                            <p>
                                We use cookies to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Remember your login details and preferences.</li>
                                <li>Analyze how you use our website to improve usability.</li>
                                <li>Personalize your experience with relevant content.</li>
                                <li>Facilitate the purchase process.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">3. Managing Cookies</h2>
                            <p>
                                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-foreground font-display text-2xl font-semibold">4. Changes to This Policy</h2>
                            <p>
                                We may update this Cookie Policy from time to time. We encourage you to check this page periodically for any changes.
                            </p>
                        </div>
                    </section>

                </div>
            </div>


        </main>
    );
}
