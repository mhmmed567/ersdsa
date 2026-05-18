"use client";

import { Coffee, ShoppingBag, User, Home } from "lucide-react";
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
    { name: "حسابي", icon: User, href: "/profile" },
    { name: "الرئيسية", icon: Home, href: "/" },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 p-3 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center gap-1 px-5 py-2 rounded-[2rem] transition-all relative ${
                isActive ? "bg-[#1c1917] text-white scale-110 shadow-lg" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? "text-white" : ""}`} />
              {isActive && (
                <span className="text-[10px] font-bold">{item.name}</span>
              )}
              {!isActive && item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {item.count}
                </span>
              )}
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}