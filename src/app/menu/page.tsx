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
      
      <main className="container mx-auto px-4 mt-6">
        {/* Category Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                selectedCategory === cat 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white text-muted-foreground shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="product-card group bg-white">
              <div className="relative aspect-square w-full overflow-hidden p-3">
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint="coffee drink"
                  />
                  <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary font-bold rounded-full px-3 py-1 text-xs border-none shadow-sm">
                    {item.price} ر.س
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6 pt-0 text-right">
                <div className="flex items-center gap-1 mb-1 justify-end">
                  <span className="text-primary text-[10px]">•</span>
                  <span className="text-primary text-[10px] font-bold">{item.category}</span>
                </div>
                <h3 className="text-xl font-bold text-primary mb-4">{item.name}</h3>
                
                <Button 
                  onClick={() => addToCart(item)}
                  className="w-full bg-[#1c1917] hover:bg-[#2d2a27] text-white rounded-full h-11 flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95"
                >
                  أضف للسلة
                  <Plus className="h-4 w-4" />
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