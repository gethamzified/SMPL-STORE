"use client";

import Link from "next/link";
import Image from "next/image";
import { TextReveal } from "@/components/ui/text-reveal";

interface Category {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  slug: string;
}

interface CategoryGridProps {
  categories: Category[];
  title?: string;
  className?: string;
}

const CategoryGrid = ({
  categories,
  title = "Shop by Category",
  className = ""
}: CategoryGridProps) => {
  if (!categories?.length) return null;

  return (
    <section className={`py-24 bg-white ${className}`}>
      <div className="max-w-[1920px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <TextReveal
            variant="slideUp"
            className="text-4xl md:text-5xl font-display uppercase tracking-tight"
          >
            {title}
          </TextReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Link href={`/collection/${category.slug}`} className="block relative h-full w-full overflow-hidden">
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.title}
                      fill
                      className="object-cover object-center transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-200" />
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out-expo">
                  <h3 className="text-white text-2xl font-bold uppercase tracking-widest">
                    {category.title}
                  </h3>
                  {category.description && (
                    <p className="text-white/80 mt-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;