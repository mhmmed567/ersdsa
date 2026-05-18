"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    price: 1.2,
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
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      
      <main className="container mx-auto px-3 mt-4">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-2xl text-[13px] font-bold transition-all ${
                selectedCategory === cat 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-card text-muted-foreground border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Products - 2 columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
          {filteredItems.map((item) => (
            <Card key={item.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-card group transition-all active:scale-[0.98]">
              <div className="relative aspect-square w-full p-2">
                <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-90"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    data-ai-hint="coffee cup"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-white font-bold rounded-full px-2.5 py-0.5 text-[10px] border-none shadow-lg">
                    {item.price} ر.س
                  </Badge>
                </div>
              </div>
              <CardContent className="px-3 pb-3 pt-1 text-right">
                <div className="flex items-center gap-1 mb-1 justify-end">
                  <span className="text-primary text-[10px] font-bold opacity-80 uppercase tracking-tighter">{item.category}</span>
                </div>
                <h3 className="text-[13px] font-bold text-foreground mb-3 truncate px-1">{item.name}</h3>
                
                <Button 
                  onClick={() => addToCart(item)}
                  className="w-full premium-gradient hover:opacity-90 text-white rounded-full h-9 flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all shadow-md shadow-primary/20 border-none"
                >
                  أضف للسلة
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
