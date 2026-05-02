"use client";
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';

type ProductLookbookProps = {
  product?: Product;
};

export function ProductLookbook({ product }: ProductLookbookProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const lookbookConfig = product?.lookbook_config;
  
  // No hardcoded fallbacks if enabled is false, otherwise minimal defaults
  const marqueeText = lookbookConfig?.marquee_text || "";
  const images = lookbookConfig?.images || [];

  useEffect(() => {
    const handleScroll = () => {
      if (!marqueeRef.current) return;
      const rect = marqueeRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const scrolled = (windowHeight - rect.top) * 0.2;
        setScrollOffset(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!lookbookConfig?.enabled) {
    return null; 
  }

  return (
    <div className="bg-white">
      {/* Marquee Section */}
      {marqueeText && (
        <div 
          ref={marqueeRef}
          className="py-12 md:py-16 overflow-hidden bg-white text-brand-ascent border-y-4 border-black group min-h-[150px] md:min-h-[250px] flex items-center"
        >
          <div 
            className="flex whitespace-nowrap will-change-transform"
            style={{ transform: `translateX(${-scrollOffset}px)` }}
          >
            {[1, 2, 3, 4].map((i) => (
              <h2 
                key={i}
                className="text-[12vw] md:text-[15vw] font-black leading-none whitespace-nowrap italic tracking-tighter uppercase mr-10 select-none"
              >
                {marqueeText}
              </h2>
            ))}
          </div>
        </div>
      )}

      {/* Lookbook Grid */}
      {images.length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b-4 border-black auto-rows-[250px] md:auto-rows-[400px]">
          {images.map((item, idx) => (
            <div 
              key={idx}
              className={`relative border border-black group overflow-hidden ${item.span || 'col-span-1 row-span-1'}`}
            >
              <div className="absolute top-4 left-4 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-white/90 text-black font-mono text-[9px] px-2 py-1 border border-black inline-block transform -rotate-1 uppercase font-bold">
                  [{idx + 1}] // {item.label || 'Look'}
                </span>
              </div>
              
              <div className="h-full w-full bg-neutral-100 relative">
                <Image 
                  src={item.src} 
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                  alt={item.label || `Lookbook image ${idx + 1}`}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
