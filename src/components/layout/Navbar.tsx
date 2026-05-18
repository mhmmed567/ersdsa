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
    <nav className="w-full bg-transparent pt-8 pb-4 px-4">
      <div className="container mx-auto flex flex-col gap-6">
        {/* Logo and User Row */}
        <div className="flex items-center justify-between">
          <Link href="/menu">
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl pl-2 pr-6 py-2 rounded-full border border-white/30 shadow-sm hover-lift">
               <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#2a1810] flex items-center justify-center shadow-lg shadow-[#2a1810]/20">
                 <span className="text-[#d4a373] text-lg font-black font-luxury">D</span>
               </div>
               <span className="font-luxury text-2xl font-black text-[#2a1810] tracking-tight">Diamond</span>
            </div>
          </Link>
          
          <div className="flex gap-3">
            {user ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-2xl bg-white/80 border border-white/30 shadow-sm text-[#2a1810]">
                  <LogOut className="h-5 w-5 text-destructive" />
                </Button>
                <Link href="/staff">
                  <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white/30 shadow-sm flex items-center justify-center text-[#2a1810] hover:bg-white">
                    <User className="h-5 w-5" />
                  </div>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <div className="w-12 h-12 rounded-full bg-[#2a1810] border border-white/20 shadow-xl flex items-center justify-center text-[#d4a373] hover:scale-105 transition-all">
                  <User className="h-6 w-6" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-lg mx-auto w-full">
          <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#5c3a28]/40 group-focus-within:text-[#c07446] transition-colors" />
          </div>
          <Input 
            placeholder="ابحث عن مشروبك المفضل.." 
            className="w-full h-14 bg-white/70 backdrop-blur-md rounded-full border border-white/40 pr-14 text-right text-sm shadow-inner focus-visible:ring-[#c07446]/20 transition-all placeholder:text-[#5c3a28]/30 font-medium"
          />
        </div>
      </div>
    </nav>
  );
}