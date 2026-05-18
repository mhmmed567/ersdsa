"use client";

import { User, Search, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    if (auth) await signOut(auth);
  };

  return (
    <nav className="w-full pt-8 pb-4 px-4">
      <div className="container mx-auto flex flex-col gap-8">
        {/* Floating Style Top Bar */}
        <div className="flex items-center justify-between">
          <Link href="/menu">
            <div className="flex items-center gap-4 bg-white/40 backdrop-blur-2xl pl-2 pr-6 py-2 rounded-full border border-white/40 shadow-[0_4px_20px_rgba(67,36,25,0.06)] hover:scale-105 transition-all duration-500">
               <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#432419] flex items-center justify-center shadow-lg shadow-[#432419]/20 group">
                 <span className="text-[#D48A5A] text-xl font-black font-luxury group-hover:scale-110 transition-transform">D</span>
               </div>
               <div className="flex flex-col -gap-1">
                 <span className="font-luxury text-2xl font-black text-[#432419] tracking-tighter leading-none">Diamond</span>
                 <span className="text-[10px] text-[#D48A5A] font-bold uppercase tracking-[0.2em]">Luxury Coffee</span>
               </div>
            </div>
          </Link>
          
          <div className="flex gap-4">
            {user ? (
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" onClick={handleLogout} className="w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-6 w-6" />
                </Button>
                <Link href="/staff">
                  <div className="w-14 h-14 rounded-2xl bg-[#432419] shadow-lg shadow-[#432419]/20 flex items-center justify-center text-white hover:bg-[#D48A5A] transition-all">
                    <User className="h-6 w-6" />
                  </div>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <div className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center text-[#432419] hover:bg-white hover:scale-105 transition-all">
                  <User className="h-6 w-6" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Minimalist Search Bar */}
        <div className="relative group max-w-xl mx-auto w-full">
          <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-[#8B4E2E]/40 group-focus-within:text-[#D48A5A] transition-colors" />
          </div>
          <Input 
            placeholder="عن ماذا تبحث اليوم؟" 
            className="w-full h-16 bg-white shadow-[0_4px_30px_rgba(67,36,25,0.04)] rounded-[1.5rem] border-none pr-16 text-right text-base focus-visible:ring-2 focus-visible:ring-[#D48A5A]/20 transition-all placeholder:text-[#8B4E2E]/20 font-medium"
          />
        </div>
      </div>
    </nav>
  );
}