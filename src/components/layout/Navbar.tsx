"use client";

import { User, Search, LogOut, ShoppingBag, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import Image from "next/image";

export default function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const { cart } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <nav className="w-full pt-10 pb-6 px-6 sticky top-0 z-50 transition-all duration-500">
      <div className="container mx-auto flex flex-col gap-10">
        {/* Top Floating Bar */}
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-3xl p-3 pl-3 pr-8 rounded-[3rem] border border-white/40 shadow-[0_20px_50px_rgba(67,36,25,0.08)]">
          <Link href="/menu">
            <div className="flex items-center gap-4 group cursor-pointer">
               <div className="relative w-14 h-14 transition-transform group-hover:scale-110">
                 <Image 
                   src="https://i.postimg.cc/zfhr8CtC/65774426-19fd-4c21-892e-81dba55d501b-removebg-preview.png"
                   alt="Diamond Logo"
                   fill
                   className="object-contain"
                 />
               </div>
               <div className="flex flex-col">
                 <span className="text-2xl font-black text-[#432419] tracking-tighter leading-none group-hover:text-[#D48A5A] transition-colors">Diamond</span>
                 <span className="text-[10px] text-[#D48A5A] font-bold uppercase tracking-[0.2em]">Luxury Coffee</span>
               </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2 bg-white/20 p-2 rounded-full border border-white/20">
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-[#432419] hover:bg-white shadow-sm">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-[#432419] hover:bg-white shadow-sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>

            {/* Cart Button */}
            <Link href="/cart">
              <div className="relative w-14 h-14 rounded-2xl bg-[#432419] flex items-center justify-center text-white hover:bg-[#D48A5A] transition-all shadow-lg group active:scale-90">
                <ShoppingBag className="h-6 w-6 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D48A5A] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#F2E8D9] animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {user ? (
              <div className="flex gap-2">
                <Link href="/staff">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#432419]/10 shadow-md flex items-center justify-center text-[#432419] hover:bg-[#D48A5A] hover:text-white transition-all">
                    <User className="h-6 w-6" />
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="w-14 h-14 rounded-2xl bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                >
                  <LogOut className="h-6 w-6" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-lg flex items-center justify-center text-[#432419] hover:bg-[#432419] hover:text-white transition-all active:scale-95 group">
                  <User className="h-6 w-6 group-hover:scale-110" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-[#D48A5A] group-focus-within:scale-110 transition-transform" />
          </div>
          <Input 
            placeholder="ابحث عن مشروبك المفضل..." 
            className="w-full h-16 bg-white/70 backdrop-blur-2xl shadow-sm rounded-3xl border-none pr-16 text-right text-base focus-visible:ring-2 focus-visible:ring-[#D48A5A]/20 transition-all placeholder:text-[#8B4E2E]/40 font-bold"
          />
        </div>
      </div>
    </nav>
  );
}
