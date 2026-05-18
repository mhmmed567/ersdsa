
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
      }, 1000);
    }, 4000); 

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#F2E8D9] transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
      <div className="flex flex-col items-center gap-10 animate-in zoom-in-75 duration-1000">
        <div className="relative">
          <div className="w-64 h-64 flex items-center justify-center relative z-10">
            <img 
              src={logoSrc}
              alt="Diamond Logo"
              className="w-56 h-56 object-contain animate-pulse"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -inset-12 border border-[#D48A5A]/20 rounded-full animate-ping duration-[4000ms]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -inset-24 border border-[#D48A5A]/10 rounded-full animate-pulse duration-[3000ms]" />
        </div>
        
        <div className="text-center space-y-4">
          <div className="overflow-hidden">
            <h1 className="text-5xl font-headline font-black text-[#432419] tracking-[0.2em] uppercase animate-in slide-in-from-bottom duration-1000">Diamond</h1>
          </div>
          <div className="flex items-center justify-center gap-4 animate-in fade-in duration-1000 delay-500">
            <div className="h-[1px] w-12 bg-[#D48A5A]" />
            <span className="text-[#8B4E2E] text-sm font-black tracking-[0.4em] uppercase">Luxury Coffee</span>
            <div className="h-[1px] w-12 bg-[#D48A5A]" />
          </div>
        </div>

        <div className="mt-8 w-40 h-1 bg-[#432419]/5 rounded-full overflow-hidden">
          <div className="h-full bg-[#D48A5A] animate-[progress_4s_linear_infinite]" style={{ width: '100%' }} />
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
