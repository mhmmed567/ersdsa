
"use client";

import { User, Search, LogOut, ShoppingBag, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser, useAuth, useFirestore, useDoc } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import Image from "next/image";
import { useMemo } from "react";
import { doc } from "firebase/firestore";

export default function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { cart } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch logo from settings
  const settingsRef = useMemo(() => db ? doc(db, "settings", "app") : null, [db]);
  const { data: appSettings } = useDoc(settingsRef);

  const logoSrc = appSettings?.logoUrl || "https://i.postimg.cc/zfhr8CtC/65774426-19fd-4c21-892e-81dba55d501b-removebg-preview.png";

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <nav className="w-full pt-4 sm:pt-8 pb-4 px-4 sm:px-6 sticky top-0 z-50 transition-all duration-500">
      <div className="container mx-auto flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between bg-white/60 backdrop-blur-xl p-2 sm:p-3 rounded-[2rem] sm:rounded-[3rem] border border-white/40 shadow-xl">
          <Link href="/menu">
            <div className="flex items-center gap-2 sm:gap-3 group px-2">
               <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform group-hover:scale-110">
                 <img 
                   src={logoSrc}
                   alt="Diamond Logo"
                   className="object-contain w-full h-full"
                 />
               </div>
               <div className="flex flex-col">
                 <span className="text-lg sm:text-xl font-black text-[#432419] tracking-tighter leading-none">Diamond</span>
                 <span className="text-[8px] sm:text-[10px] text-[#D48A5A] font-bold uppercase tracking-widest">Luxury Coffee</span>
               </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4 px-2">
            <div className="flex items-center gap-2">
              <Link href="/cart">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#432419] flex items-center justify-center text-white hover:bg-[#D48A5A] transition-all shadow-md group">
                  <ShoppingBag className="h-5 w-5 sm:h-6 group-hover:scale-110" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#D48A5A] text-white text-[9px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-black border-2 border-[#F2E8D9]">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {user ? (
              <div className="flex gap-2">
                <Link href="/staff">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white border border-[#432419]/10 shadow-sm flex items-center justify-center text-[#432419] hover:text-[#D48A5A] transition-all">
                    <User className="h-5 w-5 sm:h-6" />
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="w-10 h-10 sm:w-12 rounded-xl sm:rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all">
                  <LogOut className="h-5 w-5 sm:h-6" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 border border-white shadow-md flex items-center justify-center text-[#432419] hover:bg-[#432419] hover:text-white transition-all active:scale-95">
                  <User className="h-5 w-5 sm:h-6" />
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="relative group max-w-2xl mx-auto w-full px-2">
          <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none z-10">
            <Search className="h-4 w-4 sm:h-5 text-[#D48A5A]" />
          </div>
          <Input 
            placeholder="ابحث عن مشروبك المفضل..." 
            className="w-full h-12 sm:h-14 bg-white/70 backdrop-blur-xl shadow-sm rounded-2xl sm:rounded-3xl border-none pr-12 sm:pr-14 text-right text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-[#D48A5A]/20 transition-all placeholder:text-[#8B4E2E]/40 font-bold"
          />
        </div>
      </div>
    </nav>
  );
}
