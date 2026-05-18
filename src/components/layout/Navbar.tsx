
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
    <nav className="w-full bg-transparent pt-6 pb-2 px-4">
      <div className="container mx-auto flex flex-col gap-4">
        {/* Logo and User Row */}
        <div className="flex items-center justify-between">
          <Link href="/menu">
            <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-5 py-1.5 rounded-full shadow-sm border border-black/5">
               <div className="relative w-9 h-9 rounded-full overflow-hidden bg-primary flex items-center justify-center shadow-inner">
                 <span className="text-white text-[9px] font-bold">D</span>
               </div>
               <span className="font-headline text-lg font-black text-primary tracking-tight">Diamond</span>
            </div>
          </Link>
          
          <div className="flex gap-2">
            {user ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-2xl bg-white shadow-sm border border-black/5">
                  <LogOut className="h-5 w-5 text-destructive" />
                </Button>
                <Link href="/profile">
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                </Link>
              </div>
            ) : (
              <Link href="/login">
                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/5 flex items-center justify-center text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            placeholder="ابحث عن مشروبك .." 
            className="w-full h-12 bg-white rounded-2xl border-none shadow-sm pr-11 text-right text-sm focus-visible:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
          />
        </div>
      </div>
    </nav>
  );
}
