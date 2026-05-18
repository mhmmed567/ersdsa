"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        router.push('/menu');
      }, 800);
    }, 5000); // 5 seconds display

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#F2E8D9] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center gap-8 animate-in zoom-in-75 duration-1000">
        <div className="relative">
          <div className="w-48 h-48 bg-[#432419] rounded-full flex items-center justify-center shadow-[0_30px_70px_rgba(67,36,25,0.4)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D48A5A]/30 to-transparent opacity-60" />
            <span className="text-[#D48A5A] text-8xl font-black italic relative z-10 animate-pulse tracking-tighter">D</span>
          </div>
          <div className="absolute -inset-6 border border-[#D48A5A]/20 rounded-full animate-ping duration-[4000ms]" />
        </div>
        
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-headline font-black text-[#432419] tracking-[0.2em] uppercase">Diamond</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-12 bg-[#D48A5A]" />
            <span className="text-[#8B4E2E] text-sm font-black tracking-[0.5em] uppercase">Luxury Coffee</span>
            <div className="h-[1px] w-12 bg-[#D48A5A]" />
          </div>
        </div>
      </div>
    </div>
  );
}