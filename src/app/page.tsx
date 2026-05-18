
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

export default function SplashScreen() {
  const router = useRouter();
  const db = useFirestore();
  const [isVisible, setIsVisible] = useState(true);

  // Fetch logo from settings
  const settingsRef = useMemo(() => db ? doc(db, "settings", "app") : null, [db]);
  const { data: appSettings } = useDoc(settingsRef);

  const logoSrc = appSettings?.logoUrl || "https://i.postimg.cc/zfhr8CtC/65774426-19fd-4c21-892e-81dba55d501b-removebg-preview.png";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        router.push('/menu');
      }, 8000); // الانتقال بعد اكتمال التحميل
    }, 4000); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#110b09] transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Logo Section */}
        <div className="relative">
          <div className="w-32 h-32 flex items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-[#432419] to-[#110b09] p-4 shadow-2xl border border-white/5 overflow-hidden">
            <img 
              src={logoSrc}
              alt="Diamond Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute -inset-4 bg-[#D48A5A]/5 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Text Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-accent font-light text-[#F2E8D9] tracking-widest">Diamond</h1>
          
          <div className="flex flex-col items-center gap-2">
            {/* Loading Bar Container */}
            <div className="w-24 h-[1px] bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#D48A5A] animate-loading-bar origin-left" />
            </div>
            
            <span className="text-[#8B4E2E] text-[10px] font-bold tracking-[0.2em] uppercase mt-2">جاري التحميل</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-loading-bar {
          animation: loading-bar 3.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
