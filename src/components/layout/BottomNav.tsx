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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-sm z-50">
      <div className="bg-[#432419]/90 backdrop-blur-2xl rounded-full shadow-[0_15px_40px_rgba(67,36,25,0.25)] border border-white/10 p-2 flex items-center justify-between">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-full transition-all duration-500 relative ${
                isActive ? "bg-[#D48A5A] text-[#F2E8D9] shadow-xl" : "text-[#F2E8D9]/60 hover:text-[#F2E8D9]"
              }`}
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                {!isActive && item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D48A5A] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold border border-[#432419]">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-bold">{item.name}</span>
              {isActive && item.count !== undefined && item.count > 0 && (
                <span className="bg-[#432419] text-[#F2E8D9] text-[10px] px-2 py-0.5 rounded-full font-bold">
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