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
      }, 1000);
    }, 5000); // 5 seconds display

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F2E8D9] transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
      <div className="flex flex-col items-center gap-10 animate-in zoom-in-75 duration-1000">
        <div className="relative">
          <div className="w-56 h-56 bg-[#432419] rounded-full flex items-center justify-center shadow-[0_40px_100px_rgba(67,36,25,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D48A5A]/40 via-transparent to-transparent opacity-60" />
            <span className="text-[#D48A5A] text-9xl font-black italic relative z-10 animate-pulse tracking-tighter select-none">D</span>
          </div>
          {/* Decorative Rings */}
          <div className="absolute -inset-8 border border-[#D48A5A]/10 rounded-full animate-ping duration-[4000ms]" />
          <div className="absolute -inset-16 border border-[#D48A5A]/5 rounded-full animate-pulse duration-[3000ms]" />
        </div>
        
        <div className="text-center space-y-6">
          <div className="overflow-hidden">
            <h1 className="text-6xl font-headline font-black text-[#432419] tracking-[0.3em] uppercase animate-in slide-in-from-bottom duration-1000">Diamond</h1>
          </div>
          <div className="flex items-center justify-center gap-6 animate-in fade-in duration-1000 delay-500">
            <div className="h-[2px] w-16 bg-[#D48A5A]" />
            <span className="text-[#8B4E2E] text-base font-black tracking-[0.6em] uppercase">Luxury Coffee</span>
            <div className="h-[2px] w-16 bg-[#D48A5A]" />
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="mt-8 w-48 h-1 bg-[#432419]/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#D48A5A] animate-[progress_5s_linear_infinite]" style={{ width: '100%' }} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}