"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useCart } from "@/context/CartContext";
import { CartContents } from "@/components/cart/CartContents";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

export function CartSheet() {
  const { isCartOpen, setIsCartOpen } = useCart();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isMobile) {
    return (
      <Drawer open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-2xl font-display uppercase tracking-wider">Your Bag</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <CartContents onClose={() => setIsCartOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-display uppercase tracking-wider">Your Bag</SheetTitle>
        </SheetHeader>
        <CartContents onClose={() => setIsCartOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
