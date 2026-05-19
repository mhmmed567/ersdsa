
"use client";

import { Instagram } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-20 border-t border-white/5 bg-[#110b09]">
      <div className="container mx-auto px-4 flex flex-col items-center gap-6">
        {/* Design Rights */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D48A5A] font-black">Design & Development</span>
          <h2 className="text-2xl font-accent italic text-[#F2E8D9]">مُحَمَّدبْن عَلِيّ </h2>
          <p className="text-[11px] font-bold text-[#F2E8D9]/30">تم تصميم وتطوير الموقع بواسطة </p>
        </div>
        
        {/* Instagram Link */}
        <Link 
          href="https://www.instagram.com/vw47.o" 
          target="_blank" 
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D48A5A]/30 hover:bg-[#D48A5A]/5 transition-all group"
        >
          <Instagram className="h-5 w-5 text-[#D48A5A] group-hover:scale-110 transition-transform" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[9px] font-black text-[#F2E8D9]/40 uppercase tracking-widest">Follow us on</span>
            <span className="text-xs font-black text-[#F2E8D9]">Instagram</span>
          </div>
        </Link>
        
        {/* Copyright */}
        <div className="pt-4 border-t border-white/5 w-full max-w-xs text-center">
          <p className="text-[9px] text-[#F2E8D9]/20 font-bold uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} Diamond Luxury Coffee. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
