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
    <div className="min-h-screen bg-[#F2E8D9] pb-12">
      <Navbar />
      
      <main className={`container mx-auto px-4 pt-6 transition-all duration-1000 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Modern Hero Section */}
        <section className="mb-12 relative h-64 rounded-[3.5rem] overflow-hidden shadow-2xl group animate-in zoom-in duration-1000">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'warm-interior')?.imageUrl || ""} 
            alt="Diamond Interior"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#432419] via-[#432419]/40 to-transparent flex items-center pr-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#D48A5A] animate-pulse">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-xs font-black uppercase tracking-[0.4em]">Diamond Exclusive</span>
              </div>
              <h2 className="text-5xl font-black text-white leading-tight">قهوة <br/> تليق بك</h2>
              <p className="text-white/80 text-sm max-w-[280px] leading-relaxed font-medium">نستخلص لك السعادة في كل كوب، باستخدام أجود أنواع البن المختص.</p>
              <Button className="bg-[#D48A5A] hover:bg-white hover:text-[#432419] text-white rounded-2xl px-8 h-12 transition-all font-black shadow-lg">
                اكتشف المزيد
                <ChevronRight className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Bar - Floating Style */}
        <div className="flex items-center gap-5 overflow-x-auto pb-10 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-10 py-5 rounded-3xl text-sm font-black transition-all duration-500 animate-in fade-in slide-in-from-right-4 stagger-${(idx % 5) + 1} ${
                selectedCategory === cat 
                  ? "bg-[#432419] text-[#F2E8D9] shadow-[0_20px_40px_rgba(67,36,25,0.3)] scale-105" 
                  : "bg-white/60 backdrop-blur-md text-[#432419]/60 hover:text-[#432419] shadow-sm hover:shadow-md"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid - Modern Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filteredItems.map((item, idx) => (
            <div 
              key={item.id} 
              className={`group luxury-card flex p-5 animate-in fade-in slide-in-from-bottom-8 duration-700 stagger-${(idx % 5) + 1}`}
            >
              <div className="relative h-40 w-40 rounded-[3rem] overflow-hidden flex-shrink-0 shadow-2xl border-4 border-white/20">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3 bg-[#D48A5A] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">
                  {item.price} ر.س
                </div>
              </div>
              
              <div className="mr-8 flex-grow flex flex-col justify-between py-2">
                <div>
                  <h3 className="text-2xl font-black text-[#432419] group-hover:text-[#D48A5A] transition-colors leading-tight mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-[#8B4E2E]/70 line-clamp-2 leading-relaxed mb-4 font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5 text-[11px] text-[#8B4E2E]/60 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#D48A5A]" /> 12 MIN</span>
                    <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#D48A5A]" /> LUXURY</span>
                  </div>
                  <Button 
                    onClick={() => addToCart(item)}
                    className="bg-[#432419] hover:bg-[#D48A5A] text-white rounded-3xl h-14 w-14 p-0 shadow-2xl active:scale-90 transition-all group-hover:rotate-12"
                  >
                    <Plus className="h-8 w-8" />
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