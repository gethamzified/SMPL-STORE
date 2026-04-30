import { ShieldCheck, Truck, RotateCcw, CreditCard, Headphones } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "Worldwide Shipping",
    description: "Fast delivery to your doorstep"
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    description: "Hassle-free exchange policy"
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    description: "Crafted with the finest materials"
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "100% encrypted transactions"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here to help anytime"
  }
];

export function TrustBar() {
  return (
    <div className="w-full bg-black text-white border-y border-white/10 py-4 px-2">
      <div className="max-w-[1920px] mx-auto overflow-x-auto no-scrollbar">
        <div className="flex flex-row items-center justify-between md:justify-around w-full min-w-max md:min-w-0">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 px-3 md:px-0">
              <item.icon className="w-3.5 h-3.5 text-white/70 shrink-0" strokeWidth={1.5} />
              <span className="text-[9px] md:text-[10px] font-medium tracking-[0.15em] uppercase text-white/90 whitespace-nowrap">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
