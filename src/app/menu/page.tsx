
"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Star, Clock, ChevronRight } from "lucide-react";
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
    description: "لمسة عصرية من التشيز كيك مع صصوص التوت البري.",
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
      
      <main className={`container mx-auto px-4 pt-4 transition-all duration-1000 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Compact Hero Section */}
        <section className="mb-8 relative h-48 sm:h-64 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-xl group">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'warm-interior')?.imageUrl || ""} 
            alt="Diamond Interior"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#432419] via-[#432419]/50 to-transparent flex items-center pr-6 sm:pr-12">
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2 text-[#D48A5A]">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">Diamond Exclusive</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">قهوة تليق بك</h2>
              <p className="text-white/80 text-xs sm:text-sm max-w-[200px] sm:max-w-[300px] leading-relaxed font-medium">نستخلص لك السعادة في كل كوب.</p>
            </div>
          </div>
        </section>

        {/* Categories Bar - Responsive */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 ${
                selectedCategory === cat 
                  ? "bg-[#432419] text-[#F2E8D9] shadow-lg scale-105" 
                  : "bg-white/60 backdrop-blur-md text-[#432419]/60 hover:text-[#432419]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid - Responsive Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.map((item, idx) => (
            <div 
              key={item.id} 
              className="group luxury-card bg-white/80 backdrop-blur-sm p-3 sm:p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-md">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 bg-[#D48A5A] text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                  {item.price} ر.س
                </div>
              </div>
              
              <div className="flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#432419] mb-1 group-hover:text-[#D48A5A] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#8B4E2E]/70 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 text-[9px] text-[#8B4E2E]/60 font-black uppercase">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#D48A5A]" /> 12 MIN</span>
                    <span className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-[#D48A5A]" /> LUXURY</span>
                  </div>
                  <Button 
                    onClick={() => addToCart(item)}
                    className="bg-[#432419] hover:bg-[#D48A5A] text-white rounded-xl h-10 w-10 p-0 shadow-lg active:scale-90 transition-all"
                  >
                    <Plus className="h-5 w-5" />
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
