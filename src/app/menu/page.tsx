
"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Star, Clock, Coffee } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useState, useEffect } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

const CATEGORIES = ["الكل", "قهوة مختصة", "مشروبات باردة", "حلويات فاخرة"];

export default function MenuPage() {
  const { addToCart } = useStore();
  const db = useFirestore();
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: dbProducts, loading } = useCollection<MenuItem>(productsQuery);

  const displayItems = (dbProducts || []).filter(item => 
    selectedCategory === "الكل" || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#F2E8D9] pb-24">
      <Navbar />
      
      <main className={`container mx-auto px-3 sm:px-4 pt-4 transition-all duration-1000 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        <section className="mb-6 relative h-40 sm:h-56 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-lg group">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'warm-interior')?.imageUrl || ""} 
            alt="Diamond Interior"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#432419] via-[#432419]/40 to-transparent flex items-center pr-6 sm:pr-10">
            <div className="space-y-1 sm:space-y-3 text-right">
              <div className="flex items-center gap-1.5 text-[#D48A5A] justify-end">
                <span className="text-[8px] font-black uppercase tracking-widest">Diamond Exclusive</span>
                <Star className="h-3 w-3 fill-current" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">مذاق لا ينسى</h2>
              <p className="text-white/80 text-[10px] sm:text-xs max-w-[150px] sm:max-w-[250px] leading-relaxed font-medium">نستخلص لك السعادة في كل كوب.</p>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar" dir="rtl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-300 ${
                selectedCategory === cat 
                  ? "bg-[#432419] text-[#F2E8D9] shadow-md scale-105" 
                  : "bg-white/50 backdrop-blur-md text-[#432419]/60 hover:text-[#432419]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-[#432419] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && displayItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-white/40 p-6 rounded-full mb-4">
              <Coffee className="h-12 w-12 text-[#432419]/20" />
            </div>
            <h3 className="text-xl font-black text-[#432419]/60">قائمة الطعام فارغة حالياً</h3>
            <p className="text-sm text-[#432419]/40 mt-2">سيتم إضافة أصناف جديدة قريباً من قبل الإدارة.</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5" dir="rtl">
          {displayItems.map((item) => (
            <div 
              key={item.id} 
              className="group luxury-card bg-white/90 backdrop-blur-sm p-2 sm:p-3 flex flex-col gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden shadow-sm bg-muted">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute bottom-2 right-2 bg-[#432419]/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm border border-white/10">
                  {item.price} ر.س
                </div>
              </div>
              
              <div className="flex flex-col flex-grow justify-between gap-2 text-right">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#432419] mb-1 group-hover:text-[#D48A5A] transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-[#8B4E2E]/70 line-clamp-2 leading-tight h-6">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <Button 
                    onClick={() => addToCart(item)}
                    className="bg-[#432419] hover:bg-[#D48A5A] text-white rounded-lg h-7 w-7 sm:h-8 sm:w-8 p-0 shadow-md active:scale-90 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <div className="flex flex-col gap-0.5 text-[8px] text-[#8B4E2E]/60 font-black items-end">
                    <span className="flex items-center gap-1 uppercase">8 min <Clock className="h-2 w-2 text-[#D48A5A]" /></span>
                    <span className="flex items-center gap-1 uppercase">Premium <Sparkles className="h-2 w-2 text-[#D48A5A]" /></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
