"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";

export function BackgroundLayer({ imageUrl }: { imageUrl: string }) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "" || pathname === "/index";

  if (!imageUrl || !isHome) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={imageUrl}
          alt="Store Background"
          fill
          priority
          loading="eager"
          fetchPriority="high"
          className="object-cover object-top"
          sizes="100vw"
          quality={70}
        />
      </div>
    </div>
  );
}
