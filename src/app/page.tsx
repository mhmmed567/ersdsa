
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
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`min-h-screen flex items-center justify-center bg-[#F2E8D9] transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center gap-6 animate-in zoom-in-75 duration-1000">
        <div className="relative">
          {/* حاوية الشعار المستوحاة من الشعار المرفق */}
          <div className="w-40 h-40 bg-[#432419] rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(67,36,25,0.4)] relative overflow-hidden group">
            {/* تأثير توهج نحاسي يشبه الموجود في الصورة */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D48A5A]/20 to-transparent opacity-50" />
            <span className="text-[#D48A5A] text-7xl font-black italic relative z-10 animate-pulse">D</span>
          </div>
          {/* حلقة خارجية متوهجة */}
          <div className="absolute -inset-4 border border-[#D48A5A]/10 rounded-full animate-ping duration-[3000ms]" />
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-headline font-black text-[#432419] tracking-widest uppercase">Diamond</h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-[1px] w-10 bg-[#D48A5A]" />
            <span className="text-[#8B4E2E] text-xs font-bold tracking-[0.4em] uppercase">Luxury Experience</span>
            <div className="h-[1px] w-10 bg-[#D48A5A]" />
          </div>
        </div>
      </div>
    </div>
  );
}
