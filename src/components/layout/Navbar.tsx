"use client";

import { User, Search, LogOut, ShoppingBag, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

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
            <div className="flex items-center gap-5 group cursor-pointer">
               <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#432419] flex items-center justify-center shadow-2xl shadow-[#432419]/30 transition-transform group-hover:scale-110">
                 <span className="text-[#D48A5A] text-2xl font-black italic select-none">D</span>
               </div>
               <div className="flex flex-col -gap-1">
                 <span className="text-3xl font-black text-[#432419] tracking-tighter leading-none group-hover:text-[#D48A5A] transition-colors">Diamond</span>
                 <span className="text-[11px] text-[#D48A5A] font-bold uppercase tracking-[0.3em]">Luxury Coffee</span>
               </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Action Buttons */}
            <div className="hidden sm:flex items-center gap-2 bg-white/20 p-2 rounded-full border border-white/20">
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-[#432419] hover:bg-white shadow-sm">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="w-12 h-12 rounded-full text-[#432419] hover:bg-white shadow-sm">
                <Bell className="h-5 w-5" />
              </Button>
            </div>

            {/* Cart Button - Enhanced */}
            <Link href="/cart">
              <div className="relative w-16 h-16 rounded-[2rem] bg-[#432419] flex items-center justify-center text-white hover:bg-[#D48A5A] transition-all shadow-xl shadow-[#432419]/20 group active:scale-90">
                <ShoppingBag className="h-7 w-7 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D48A5A] text-white text-[11px] w-6 h-6 rounded-full flex items-center justify-center font-black border-4 border-[#F2E8D9] animate-bounce">
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

            {user ? (
              <div className="flex gap-4">
                <Link href="/staff">
                  <div className="w-16 h-16 rounded-[2rem] bg-white border border-[#432419]/10 shadow-lg flex items-center justify-center text-[#432419] hover:bg-[#D48A5A] hover:text-white transition-all">
                    <User className="h-7 w-7" />
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout} 
                  className="w-16 h-16 rounded-[2rem] bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                >
                  <LogOut className="h-7 w-7" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-md border border-white shadow-xl flex items-center justify-center text-[#432419] hover:bg-[#432419] hover:text-white transition-all active:scale-95 group">
                  <User className="h-7 w-7 group-hover:scale-110" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Minimalist Centered Search Bar */}
        <div className="relative group max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none z-10">
            <Search className="h-6 w-6 text-[#D48A5A] group-focus-within:scale-110 transition-transform" />
          </div>
          <Input 
            placeholder="ابحث عن مشروبك المفضل..." 
            className="w-full h-20 bg-white/70 backdrop-blur-2xl shadow-[0_15px_50px_rgba(67,36,25,0.06)] rounded-[2.5rem] border-none pr-20 text-right text-lg focus-visible:ring-4 focus-visible:ring-[#D48A5A]/10 transition-all placeholder:text-[#8B4E2E]/30 font-bold"
          />
        </div>
      </div>
    </nav>
  );
}