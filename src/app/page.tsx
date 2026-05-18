
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // إخفاء الشعار بعد 5 ثوانٍ ثم التوجه للقائمة
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        router.push('/menu');
      }, 800); // وقت إضافي لتأثير الإختفاء السلس
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#F2E8D9] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-75 duration-1000">
        <div className="relative">
          {/* Animated Logo Container */}
          <div className="w-32 h-32 bg-[#432419] rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(67,36,25,0.3)] animate-pulse">
            <span className="text-[#D48A5A] text-6xl font-black italic">D</span>
          </div>
          {/* Decorative Rings */}
          <div className="absolute inset-0 border-4 border-[#D48A5A]/20 rounded-[2.5rem] animate-ping" />
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-headline font-black text-[#432419] tracking-widest uppercase">Diamond</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-[#D48A5A]" />
            <span className="text-[#8B4E2E] text-xs font-bold tracking-[0.3em] uppercase">Luxury Coffee</span>
            <div className="h-[1px] w-8 bg-[#D48A5A]" />
          </div>
        </div>
      </div>
    </div>
  );
}
