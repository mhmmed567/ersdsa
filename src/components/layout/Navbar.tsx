"use client";

import { User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full bg-background pt-6 pb-2 px-4">
      <div className="container mx-auto flex flex-col gap-6">
        {/* Logo and User Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full shadow-sm">
             <span className="font-headline text-xl font-bold text-primary">Diamond</span>
             <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary flex items-center justify-center">
               <span className="text-white text-[10px] font-bold">دايموند</span>
             </div>
          </div>
          
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-muted-foreground">
            <User className="h-6 w-6" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            placeholder="ابحث عن مشروبك .." 
            className="w-full h-14 bg-white rounded-2xl border-none shadow-sm pr-12 text-right focus-visible:ring-primary/20"
          />
        </div>
      </div>
    </nav>
  );
}