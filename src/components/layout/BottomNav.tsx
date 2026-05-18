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
      <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-border/50 p-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 rounded-[2rem] transition-all relative ${
                isActive ? "premium-gradient text-white scale-105 shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                {!isActive && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold">{item.name}</span>
              {isActive && item.count !== undefined && item.count > 0 && (
                <span className="bg-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
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
