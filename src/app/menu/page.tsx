
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
    name: "v60 قهوة مختصة",
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
    image: PlaceHolderImages.find(img => img.id === 'herbal-tea')?.imageUrl || "https://picsum.photos/seed/ice/600/400",
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
        <section className="mb-12 relative h-48 rounded-[3rem] overflow-hidden shadow-2xl group">
          <Image 
            src={PlaceHolderImages.find(img => img.id === 'warm-interior')?.imageUrl || ""} 
            alt="Diamond Interior"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#432419]/90 to-transparent flex items-center pr-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#D48A5A]">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-[10px] font-black uppercase tracking-widest">الأكثر طلباً هذا الأسبوع</span>
              </div>
              <h2 className="text-3xl font-black text-white">V60 كولومبي</h2>
              <p className="text-white/70 text-sm max-w-[200px]">تجربة غنية بالمذاق تبدأ من هنا</p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ animationDelay: `${idx * 100}ms` }}
              className={`whitespace-nowrap px-8 py-4 rounded-[2rem] text-sm font-black transition-all duration-500 animate-in fade-in slide-in-from-right-4 ${
                selectedCategory === cat 
                  ? "bg-[#432419] text-[#F2E8D9] shadow-xl shadow-[#432419]/20 scale-105" 
                  : "bg-white/50 backdrop-blur-sm text-[#432419]/60 hover:text-[#432419] shadow-sm hover:shadow-md"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="space-y-6">
          {filteredItems.map((item, idx) => (
            <div 
              key={item.id} 
              style={{ animationDelay: `${idx * 150}ms` }}
              className="group luxury-card flex items-center p-3 animate-in fade-in slide-in-from-bottom-8 duration-700"
            >
              <div className="relative h-28 w-28 rounded-[2rem] overflow-hidden flex-shrink-0 shadow-lg border-2 border-white/20">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              <div className="mr-6 flex-grow py-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-black text-[#432419] group-hover:text-[#D48A5A] transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-sm font-black text-[#D48A5A] whitespace-nowrap bg-white/80 px-3 py-1 rounded-full shadow-sm">
                    {item.price} ر.س
                  </span>
                </div>
                <p className="text-xs text-[#8B4E2E]/60 line-clamp-2 mb-4 max-w-[200px] leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] text-[#8B4E2E]/40 font-bold">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 10-15 دقيقة</span>
                    <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> مميز</span>
                  </div>
                  <Button 
                    onClick={() => addToCart(item)}
                    size="sm"
                    className="bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl h-10 w-10 p-0 shadow-lg active:scale-95 transition-all"
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
