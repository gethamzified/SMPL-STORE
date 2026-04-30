'use client';

import Link from "next/link";
import { Instagram, Twitter, Facebook, Youtube, ChevronDown } from "lucide-react";
import { FooterConfig, SocialConfig } from "@/lib/types";
import { ScrollToTopButton } from "./ScrollToTopButton";
import { NewsletterForm } from "./NewsletterForm";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col border-b border-neutral-900 lg:border-none">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between py-4 lg:py-0 lg:mb-6 w-full text-left"
      >
        <h4 className="text-black text-xs font-semibold uppercase tracking-widest">{title}</h4>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 transition-transform duration-300 lg:hidden ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Desktop always visible, Mobile toggleable */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <ul className="flex flex-col gap-3 pb-6 lg:pb-0">
          {links.map(link => (
            <li key={`${link.label}-${link.url}`}>
              <Link href={link.url} className="text-black/60 text-sm hover:text-black transition-colors duration-300">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


const Footer = ({
  config = defaultConfig,
  brandName = 'SMPL',
  social = {}
}: FooterProps) => {
  const currentYear = new Date().getFullYear();

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
    <footer className="bg-black/10 backdrop-blur-sm text-black font-sans border-t border-black/5 relative z-10 w-full overflow-hidden">
      <div className="max-w-[1920px] mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">

          {/* Left: Brand & Newsletter */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6">
            <div>
              <Link href="/" className="text-3xl font-black tracking-tighter text-black inline-block uppercase">
                {brandName}.
              </Link>
              <p className="mt-3 text-black/60 text-sm max-w-sm leading-relaxed font-bold">
                {config.tagline || 'Minimalist design, premium quality, enduring style.'}
              </p>
            </div>

            <div className="mt-2 text-white">
              <h3 className="text-xs font-semibold tracking-widest uppercase mb-4">
                Join our newsletter
              </h3>
              <div className="max-w-md">
                <NewsletterForm placeholder="Email address" />
              </div>
            </div>
          </div>

          {/* Right: Navigation Links */}
          <div className="w-full lg:w-7/12 grid grid-cols-1 md:grid-cols-3 gap-0 lg:gap-10 border-t border-neutral-900 lg:border-none">

            {columnsToRender.map((col) => (
              <FooterColumn
                key={col.title}
                title={col.title}
                links={col.links}
              />
            ))}

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black/5">
        <div className="max-w-[1920px] mx-auto px-6 py-12 flex flex-col lg:flex-row justify-between items-center gap-10 relative">

          {/* Scroll To Top - Absolute Centered ABOVE text */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <ScrollToTopButton />
          </div>

          {/* Copyright */}
          <div className="text-[10px] text-black/40 uppercase tracking-widest flex-1 text-center lg:text-left font-bold">
            <span>{copyrightText} All rights reserved.</span>
          </div>

          {/* Placeholder/Empty Mid for balance on desktop */}
          <div className="hidden lg:block flex-1" />

          {/* Social Links */}
          <div className="flex items-center justify-center lg:justify-end gap-6 flex-1">
            {displaySocialLinks.map((link, idx) => {
              const Icon = link.Icon;
              return (
                <a
                  key={idx}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black/40 hover:text-black transition-colors duration-300"
                  aria-label={`Follow us on ${link.name}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
