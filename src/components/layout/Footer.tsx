'use client';

import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Facebook, Youtube, ChevronDown } from "lucide-react";
import { FooterConfig, SocialConfig } from "@/lib/types";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { NewsletterForm } from "./NewsletterForm";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface FooterProps {
  config?: FooterConfig;
  brandName?: string;
  social?: SocialConfig;
}

const defaultConfig: FooterConfig = {
  tagline: 'Minimalist design, premium quality, enduring style.',
  columns: [],
  showSocial: true,
  copyright: '© {year} {brand}.'
};

const FooterColumn = ({
  title,
  links
}: {
  title: string;
  links: { label: string; url: string }[]
}) => {
  return (
    <div className="flex flex-col">
      <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{title}</h4>
      <ul className="flex flex-col gap-3">
        {links.map(link => (
          <li key={`${link.label}-${link.url}`}>
            <Link href={link.url} className="text-white text-[11px] font-black uppercase tracking-widest hover:text-brand-ascent transition-colors duration-300">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};


const Footer = ({
  config = defaultConfig,
  brandName = 'SMPL',
  social = {}
}: FooterProps) => {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "" || pathname === "/index";

  const fallbackColumns: FooterConfig['columns'] = [
    {
      title: 'Shop',
      links: [
        { label: 'All Products', url: '/shop' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', url: '/about' },
        { label: 'Journal', url: '/news' },
        { label: 'Careers', url: '/careers' },
        { label: 'Contact', url: '/contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'My Account', url: '/account' },
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms & Conditions', url: '/terms' },
        { label: 'Cookie Policy', url: '/cookies' },
      ],
    },
  ];

  const columnsToRender = (config.columns && config.columns.length > 0 ? config.columns : fallbackColumns)
    .map(col => ({
      title: col.title,
      links: (col.links || []).filter(l => l?.label && l?.url),
    }))
    .filter(col => col.links.length > 0);

  // Parse copyright string
  const copyrightText = (config.copyright || '© {year} {brand}.')
    .replace('{year}', String(currentYear))
    .replace('{brand}', brandName);

  // Social Links
  const socialLinks = [
    social.facebook && { name: 'Facebook', href: social.facebook, Icon: Facebook },
    social.instagram && { name: 'Instagram', href: social.instagram, Icon: Instagram },
    social.twitter && { name: 'X', href: social.twitter, Icon: Twitter },
    social.youtube && { name: 'YouTube', href: social.youtube, Icon: Youtube },
  ].filter(Boolean) as { name: string; href: string; Icon: typeof Facebook }[];

  const defaultSocialLinks = [
    { name: 'Instagram', href: 'https://instagram.com/smpl', Icon: Instagram },
    { name: 'X', href: 'https://twitter.com/smpl', Icon: Twitter },
    { name: 'Facebook', href: 'https://facebook.com/smpl', Icon: Facebook },
    { name: 'YouTube', href: 'https://youtube.com/smpl', Icon: Youtube },
  ];

  const displaySocialLinks = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

  return (
    <footer className="relative z-10 w-full overflow-hidden bg-black text-white border-t border-white/10">
      <div className="max-w-[1920px] mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">

          {/* Left: Brand & Tagline */}
          <div className="w-full lg:w-4/12 flex flex-col gap-4">
            <div>
              <Link href="/" className="inline-block">
                <Image
                  src="/SMPL_LOGO.svg"
                  alt={brandName}
                  width={100}
                  height={40}
                  className="h-8 w-auto "
                />
              </Link>
              <p className="mt-4 text-white/40 text-[10px] max-w-xs leading-relaxed font-black uppercase tracking-[0.2em]">
                {config.tagline || 'Minimalist design, premium quality, enduring style.'}
              </p>
            </div>
          </div>

          {/* Center: Simplified Navigation */}
          <div className="w-full lg:w-4/12 grid grid-cols-2 gap-8">
            <FooterColumn
              title="Catalog"
              links={[
                { label: 'Shop All', url: '/shop' },
                { label: 'Featured', url: '/shop?sort=featured' }
              ]}
            />
            <FooterColumn
              title="Social"
              links={displaySocialLinks.map(s => ({ label: s.name, url: s.href }))}
            />
          </div>

          {/* Right: Newsletter */}
          <div className="w-full lg:w-4/12">
            <h3 className="text-[10px] font-black tracking-widest uppercase mb-4 text-white/40">
              Join our newsletter
            </h3>
            <div className="max-w-md">
              <NewsletterForm placeholder="EMAIL@ADDRESS.COM" dark />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1920px] mx-auto px-6 py-12 flex flex-col lg:flex-row justify-between items-center gap-10 relative">

          {/* Scroll To Top - Absolute Centered ABOVE text */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <ScrollToTopButton />
          </div>

          {/* Copyright */}
          <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] flex-1 text-center lg:text-left font-black">
            <span>{copyrightText} All rights reserved.</span>
          </div>

          <div className="hidden lg:block flex-1" />

          {/* Simplified Social Icons (removed redundant displaySocialLinks mapping as it's now in the column) */}
          <div className="flex items-center justify-center lg:justify-end gap-8 flex-1">
            <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-black">Curated in Pakistan</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
