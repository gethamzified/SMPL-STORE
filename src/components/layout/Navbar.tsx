"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/UserAuthContext";
const CartSheet = dynamic(() => import("@/components/layout/CartSheet").then(mod => mod.CartSheet), { ssr: false });
const SearchModal = dynamic(() => import("@/components/layout/SearchModal").then(mod => mod.SearchModal), { ssr: false });
import { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

// Lazy-load the mobile menu to reduce initial bundle size
const MobileMenuOverlay = dynamic(() => import("./MobileMenuOverlay"), {
  ssr: false,
  loading: () => null,
});

const Navbar = ({ brandName = "SMPL", navItems }: { brandName?: string; navItems?: MenuItem[] }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { cartCount, setIsCartOpen, isCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartSheetLoaded, setIsCartSheetLoaded] = useState(false);
  // Ensure isHome is true for root and handles potential trailing slashes
  const isHome = pathname === "/" || pathname === "" || pathname === "/index";

  // Auto-load cart sheet when open (e.g. from Add to Cart)
  useEffect(() => {
    if (isCartOpen && !isCartSheetLoaded) {
      setIsCartSheetLoaded(true);
    }
  }, [isCartOpen, isCartSheetLoaded]);

  const defaultLinks: MenuItem[] = [
    { label: "HOME", url: "/" },
    { label: "SHOP", url: "/shop" },
    { label: "ABOUT", url: "/about" },
  ];

  const linksToDisplay = navItems && navItems.length > 0 ? navItems : defaultLinks;

  return (
    <>
      {/* Only mount CartSheet after user interacts with cart */}
      {isCartSheetLoaded && <CartSheet />}
      <header className={cn(
        "relative z-40 w-full px-4 py-4 flex items-center justify-between transition-colors duration-300",
        !isHome ? "bg-white shadow-sm" : "bg-transparent"
      )}>
        {/* Left: Hamburger */}
        <div className="flex-1 flex justify-start">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="bg-[#ff0000] text-white h-10 w-10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="h-10 flex items-center justify-center cursor-pointer transition-transform active:scale-95">
            <Image
              src="/SMPL_LOGO.svg"
              alt="SMPL Logo"
              width={120}
              height={40}
              priority
              className="w-auto h-12 sm:h-12"
            />
          </Link>
        </div>

        {/* Right Side: Search & Cart */}
        <div className="flex-1 flex justify-end gap-2">
          {/* Search */}
          <div className="bg-[#ff0000] text-white h-10 w-10 flex items-center justify-center cursor-pointer transition-transform active:scale-95">
            <SearchModal />
          </div>

          {/* Cart */}
          <button
            onClick={() => {
              if (!isCartSheetLoaded) setIsCartSheetLoaded(true);
              setIsCartOpen(true);
            }}
            className="relative bg-[#ff0000] text-white h-10 w-10 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
          >
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
            {isMounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-white text-black text-[9px] flex items-center justify-center rounded-full font-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Full Screen Menu Overlay - Dynamically Loaded */}
      {isMenuOpen && (
        <MobileMenuOverlay navLinks={linksToDisplay} onClose={() => setIsMenuOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
