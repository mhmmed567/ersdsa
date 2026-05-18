
"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Star, Clock } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useState, useEffect } from "react";

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "V60 قهوة مختصة",
    price: 18,
    category: "قهوة مختصة",
    description: "محصول إثيوبي فاخر بنكهات فاكهية وقوام متزن.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "2",
    name: "كابتشينو فاخر",
    price: 15,
    category: "قهوة مختصة",
    description: "مزيج مثالي من الإسبريسو المركز والحليب المخملي.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "3",
    name: "كرواسون فرنسي",
    price: 12,
    category: "حلويات فاخرة",
    description: "طبقات هشة محضرة بالزبدة الطبيعية يومياً.",
    image: PlaceHolderImages.find(img => img.id === 'pastry-croissant')?.imageUrl || "",
  },
  {
    id: "4",
    name: "تشيز كيك دايموند",
    price: 24,
    category: "حلويات فاخرة",
    description: "لمسة عصرية من التشيز كيك مع صوص التوت البري.",
    image: PlaceHolderImages.find(img => img.id === 'chocolate-tart')?.imageUrl || "",
  },
  {
    id: "5",
    name: "آيس سبانش لاتيه",
    price: 20,
    category: "مشروبات باردة",
    description: "انتعاش القهوة مع الحليب المكثف والثلج.",
    image: "https://picsum.photos/seed/ice/600/400",
  }
];

const CATEGORIES = ["الكل", "قهوة مختصة", "مشروبات باردة", "حلويات فاخرة"];

export default function MenuPage() {
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredItems = selectedCategory === "الكل" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F2E8D9] pb-24">
      <Navbar />
      
      <main className={`container mx-auto px-3 sm:px-4 pt-4 transition-all duration-1000 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Compact Hero Section */}
        <section className="mb-6 relative h-40 sm:h-56 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-lg group">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'warm-interior')?.imageUrl || ""} 
            alt="Diamond Interior"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#432419] via-[#432419]/40 to-transparent flex items-center pr-6 sm:pr-10">
            <div className="space-y-1 sm:space-y-3">
              <div className="flex items-center gap-1.5 text-[#D48A5A]">
                <Star className="h-3 w-3 fill-current" />
                <span className="text-[8px] font-black uppercase tracking-widest">Diamond Exclusive</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">مذاق لا ينسى</h2>
              <p className="text-white/80 text-[10px] sm:text-xs max-w-[150px] sm:max-w-[250px] leading-relaxed font-medium">نستخلص لك السعادة في كل كوب.</p>
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-6 no-scrollbar">
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

        {/* Menu Grid - 2 columns on mobile, 3 on tablet, 4 on desktop, 5 on large screens */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group luxury-card bg-white/90 backdrop-blur-sm p-2 sm:p-3 flex flex-col gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500"
            >
              <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute bottom-2 right-2 bg-[#432419]/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm border border-white/10">
                  {item.price} ر.س
                </div>
              </div>
              
              <div className="flex flex-col flex-grow justify-between gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#432419] mb-1 group-hover:text-[#D48A5A] transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-[#8B4E2E]/70 line-clamp-2 leading-tight">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col gap-0.5 text-[8px] text-[#8B4E2E]/60 font-black">
                    <span className="flex items-center gap-1 uppercase"><Clock className="h-2 w-2 text-[#D48A5A]" /> 8 min</span>
                    <span className="flex items-center gap-1 uppercase"><Sparkles className="h-2 w-2 text-[#D48A5A]" /> Premium</span>
                  </div>
                  <Button 
                    onClick={() => addToCart(item)}
                    className="bg-[#432419] hover:bg-[#D48A5A] text-white rounded-lg h-7 w-7 sm:h-8 sm:w-8 p-0 shadow-md active:scale-90 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
