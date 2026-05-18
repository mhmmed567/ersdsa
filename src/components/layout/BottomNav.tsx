"use client";

import { Coffee, ShoppingBag, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export default function BottomNav() {
  const pathname = usePathname();
  const { cart } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: "المنيو", icon: Coffee, href: "/menu" },
    { name: "السلة", icon: ShoppingBag, href: "/cart", count: cartCount },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      <div className="bg-[#1C1C1C]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/5 p-2 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-[2rem] transition-all duration-700 relative ${
                isActive 
                  ? "bg-white text-[#432419] shadow-[0_10px_20px_rgba(255,255,255,0.1)]" 
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <div className="relative">
                <item.icon className={`h-6 w-6 ${isActive ? "scale-110" : ""}`} />
                {item.count !== undefined && item.count > 0 && !isActive && (
                  <span className="absolute -top-2 -right-2 bg-[#D48A5A] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#1C1C1C] animate-in zoom-in">
                    {item.count}
                  </span>
                )}
              </div>
              <span className={`text-sm font-black transition-all ${isActive ? "opacity-100" : "opacity-0 absolute"}`}>
                {item.name}
              </span>
              {isActive && item.count !== undefined && item.count > 0 && (
                <span className="bg-[#432419] text-white text-[11px] px-2.5 py-0.5 rounded-xl font-black ml-1">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}