import { Mail, Phone, MapPin } from "lucide-react";

export const revalidate = 86400; // SSG-like: 24 hours — static marketing page

export const metadata = {
    title: "Contact Us",
    description: "Get in touch with us for any inquiries or support.",
}

export default async function ContactPage() {
    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white">
            <div className="pt-10 md:pt-14 pb-24 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Get in Touch</h1>
                                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                                    We'd love to hear from you. Whether you have a question about our products, need assistance with an order, or just want to say hello, our team is here to help.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-secondary/50">
                                        <Mail className="w-6 h-6 text-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-display font-semibold text-lg">Email</h3>
                                        <p className="text-muted-foreground font-body">talhairfan1947@gmail.com</p>
                                        <p className="text-sm text-muted-foreground/60 pt-1">We'll respond within 24 hours.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-secondary/50">
                                        <Phone className="w-6 h-6 text-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-display font-semibold text-lg">Phone</h3>
                                        <p className="text-muted-foreground font-body">0329 419 4144</p>
                                        <p className="text-sm text-muted-foreground/60 pt-1">Mon-Fri from 9am to 6pm.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-secondary/50">
                                        <MapPin className="w-6 h-6 text-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-display font-semibold text-lg">Studio</h3>
                                        <p className="text-muted-foreground font-body">Pakistan</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form (Visual Only) */}
                        <div className="bg-muted/30 border border-border rounded-2xl p-8 md:p-12">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">First Name</label>
                                        <input type="text" id="firstName" className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/30" placeholder="Jane" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Last Name</label>
                                        <input type="text" id="lastName" className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/30" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Email</label>
                                    <input type="email" id="email" className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground/30" placeholder="jane@example.com" />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Message</label>
                                    <textarea id="message" rows={4} className="w-full bg-transparent border-b border-border py-2 text-foreground focus:outline-none focus:border-foreground transition-colors resize-none placeholder:text-muted-foreground/30" placeholder="How can we help you?" />
                                </div>

                                <div className="pt-4">
                                    <button type="button" className="w-full bg-foreground text-background py-4 rounded-full font-semibold hover:bg-foreground/90 transition-colors uppercase tracking-widest text-sm">
                                        Send Message
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>


        </main>
    );
}
