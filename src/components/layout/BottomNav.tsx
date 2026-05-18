"use client";

import { Coffee, ShoppingBag } from "lucide-react";
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[70%] max-w-xs z-50">
      <div className="bg-[#1c1917]/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/10 p-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 rounded-[2rem] transition-all relative ${
                isActive ? "bg-white text-[#1c1917] scale-105 shadow-md" : "text-white/70 hover:bg-white/10"
              }`}
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? "text-[#1c1917]" : ""}`} />
                {!isActive && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold">{item.name}</span>
              {isActive && item.count !== undefined && item.count > 0 && (
                <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
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
