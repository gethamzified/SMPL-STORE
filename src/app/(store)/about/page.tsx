import { getHeroConfig, getHomepageLayout } from "@/lib/theme";

import Image from "next/image";
import style2 from "@/assets/style-2.jpg";

export const revalidate = 86400; // SSG: 24 hours — static marketing page

export default async function AboutPage() {
  const [heroConfig, layout] = await Promise.all([
    getHeroConfig(),
    getHomepageLayout()
  ]);

  // Determine Hero Image (Same logic as Homepage)
  const heroSection = layout.find(s => s.type === 'hero');
  const heroImage = heroSection?.content?.image || heroConfig.image || "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";

  return (
    <main className="min-h-screen bg-background selection:bg-black selection:text-white">
      {/* Hero Section (Static Structure with Dynamic Home Image) */}
      <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            src={heroImage}
            alt="SMPL Aesthetic"
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="font-display text-5xl md:text-7xl lg:text-9xl text-white tracking-tighter mix-blend-difference animate-in fade-in slide-in-from-bottom-8 duration-1000">
            SMPL
          </h1>
          <p className="mt-6 text-white/90 font-body text-lg md:text-2xl tracking-wide uppercase max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Premium. Diverse. Tailored.
          </p>
        </div>
      </section>

      {/* Brand Statement Section */}
      <section className="py-24 md:py-32 px-6 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 view-animate">
            <span className="inline-block h-px w-20 bg-foreground/30 mb-8" />
            <h2 className="font-display font-bold text-4xl md:text-4xl lg:text-6xl leading-[1.1] text-foreground tracking-tight max-w-[1400px] mx-auto">
              SMPL is a Pakistani brand for premium and diverse apparel, tailored selectively to match your interest.
            </h2>
            <p className="font-body text-muted-foreground text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
              We believe in the power of individual expression. Our collections are curated not just to be worn, but to be experienced. Blending traditional craftsmanship with contemporary aesthetics, we offer a wardrobe that speaks to the modern individual.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Grid / Values */}
      <section className="pb-24 px-6 md:px-12 bg-background">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-7xl mx-auto">
          <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden group">
            <Image
              src={style2}
              alt="Quality Craftsmanship"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
              <h3 className="text-white font-display text-3xl mb-2">Heritage</h3>
              <p className="text-white/80 font-body">Rooted in Pakistani textile excellence.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-secondary/30 p-12 md:p-20 aspect-[3/4] md:aspect-[4/5]">
            <h3 className="font-display text-3xl md:text-4xl mb-6 text-foreground">Selective Curation</h3>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-8">
              Every fabric, stitch, and silhouette is chosen with intention. We don't just make clothes; we craft experiences tailored to your unique taste.
            </p>
            <div className="h-px w-full bg-foreground/10" />
          </div>
        </div>
      </section>


    </main>
  );
}
