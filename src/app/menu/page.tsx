"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "v60",
    price: 18,
    category: "قهوة مختصة",
    description: "قهوة مختصة محضرة بعناية فائقة لاستخراج أفضل النكهات.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "2",
    name: "كابتشينو",
    price: 15,
    category: "قهوة مختصة",
    description: "إسبريسو مع حليب مبخر ورغوة كثيفة.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "3",
    name: "كرواسون سادة",
    price: 12,
    category: "حلويات فاخرة",
    description: "كرواسون فرنسي هش بالزبدة.",
    image: PlaceHolderImages.find(img => img.id === 'pastry-croissant')?.imageUrl || "",
  },
  {
    id: "4",
    name: "آيس لاتيه",
    price: 18,
    category: "مشروبات باردة",
    description: "قهوة باردة منعشة مع الحليب.",
    image: PlaceHolderImages.find(img => img.id === 'herbal-tea')?.imageUrl || "",
  }
];

const CATEGORIES = ["الكل", "قهوة مختصة", "مشروبات باردة", "حلويات فاخرة", "إضافات"];

export default function MenuPage() {
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredItems = selectedCategory === "الكل" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-32">
      <Navbar />
      
      <main className="container mx-auto px-4 mt-6">
        {/* Category Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                selectedCategory === cat 
                  ? "bg-[#2a1810] text-[#faf7f2] shadow-xl shadow-[#2a1810]/20 scale-105" 
                  : "bg-white/50 text-[#5c3a28] border border-[#2a1810]/5 hover:bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Products - 2 columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="luxury-card group stagger-1 animate-scale-in">
              <div className="relative aspect-square w-full p-2.5">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    data-ai-hint="coffee cup"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2a1810]/60 to-transparent" />
                  <div className="absolute top-3 left-3 bg-[#c07446] text-white font-bold rounded-full px-3 py-1 text-[11px] shadow-lg border border-white/20">
                    {item.price} ر.س
                  </div>
                </div>
              </div>
              
              <div className="px-4 pb-4 pt-1 text-right">
                <span className="text-[#c07446] text-[10px] font-bold uppercase tracking-widest">{item.category}</span>
                <h3 className="text-[14px] font-bold text-[#2a1810] mb-4 truncate font-luxury">{item.name}</h3>
                
                <Button 
                  onClick={() => addToCart(item)}
                  className="w-full bg-[#2a1810] hover:bg-[#5c3a28] text-[#faf7f2] rounded-full h-10 flex items-center justify-center gap-2 text-[11px] font-bold transition-all shadow-md active:scale-95"
                >
                  أضف للسلة
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}