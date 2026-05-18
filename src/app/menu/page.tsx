"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "v60 قهوة مختصة",
    price: 18,
    category: "قهوة مختصة",
    description: "قهوة مختصة محضرة بعناية فائقة لاستخراج أفضل النكهات.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "2",
    name: "كابتشينو فاخر",
    price: 15,
    category: "قهوة مختصة",
    description: "إسبريسو مع حليب مبخر ورغوة كثيفة.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "3",
    name: "كرواسون فرنسي",
    price: 12,
    category: "حلويات فاخرة",
    description: "كرواسون فرنسي هش بالزبدة.",
    image: PlaceHolderImages.find(img => img.id === 'pastry-croissant')?.imageUrl || "",
  },
  {
    id: "4",
    name: "آيس لاتيه منعش",
    price: 18,
    category: "مشروبات باردة",
    description: "قهوة باردة منعشة مع الحليب.",
    image: PlaceHolderImages.find(img => img.id === 'herbal-tea')?.imageUrl || "",
  }
];

const CATEGORIES = ["الكل", "قهوة مختصة", "مشروبات باردة", "حلويات فاخرة"];

export default function MenuPage() {
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredItems = selectedCategory === "الكل" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F7F3ED] pb-32">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-6">
        {/* Modern Header Section */}
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-4xl font-headline font-black text-[#432419]">قائمة دايموند</h1>
          <p className="text-[#8B4E2E]/60 font-medium">اختر ما يلامس ذوقك اليوم</p>
        </div>

        {/* Categories - Modern Pill Style */}
        <div className="flex items-center gap-3 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-500 ${
                selectedCategory === cat 
                  ? "bg-[#432419] text-white shadow-xl shadow-[#432419]/20 scale-105" 
                  : "bg-white text-[#432419]/60 hover:text-[#432419] shadow-sm hover:shadow-md"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid - Ultra Modern */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="modern-card group flex flex-col h-full">
              <div className="relative aspect-[4/5] w-full p-3">
                <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden shadow-inner">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#432419] font-black rounded-2xl px-4 py-1.5 text-sm shadow-xl">
                    {item.price} ر.س
                  </div>
                </div>
              </div>
              
              <div className="px-5 pb-5 pt-2 flex flex-col flex-grow">
                <div className="flex-grow">
                  <span className="text-[#D48A5A] text-[10px] font-black uppercase tracking-widest mb-1 block">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-[#432419] mb-1 leading-tight group-hover:text-[#D48A5A] transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#8B4E2E]/60 line-clamp-1 mb-4">{item.description}</p>
                </div>
                
                <Button 
                  onClick={() => addToCart(item)}
                  className="w-full bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl h-12 flex items-center justify-center gap-3 text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  أضف للطلب
                  <div className="bg-white/20 p-1 rounded-lg">
                    <Plus className="h-3 w-3" />
                  </div>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestion Banner - Modern Touch */}
        <div className="mt-16 bg-[#432419] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start text-[#D48A5A]">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold text-sm">اقتراح دايموند الذكي</span>
              </div>
              <h2 className="text-2xl font-black mb-2">هل جربت V60 بمحصولنا الجديد؟</h2>
              <p className="text-white/60 text-sm">طعم متوازن ونكهات فريدة تنتظر استكشافك.</p>
            </div>
            <Button className="bg-[#D48A5A] hover:bg-[#E29A6B] text-white rounded-full px-10 h-14 font-black transition-all">
              اطلبها الآن
            </Button>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#D48A5A]/10 rounded-full blur-3xl" />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}