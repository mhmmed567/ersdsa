"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Coffee, Croissant, Leaf, Dessert } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useState } from "react";

const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "فلات وايت كلاسيكي",
    price: 18,
    category: "قهوة",
    description: "مزيج غني من الإسبريسو والحليب المبخر بقوام حريري.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "2",
    name: "كرواسون الزبدة الفاخر",
    price: 15,
    category: "مخبوزات",
    description: "مخبوز يومياً بطبقات هشة من الزبدة الطبيعية.",
    image: PlaceHolderImages.find(img => img.id === 'pastry-croissant')?.imageUrl || "",
  },
  {
    id: "3",
    name: "شاي الأعشاب المهدئ",
    price: 12,
    category: "مشروبات",
    description: "مزيج منعش من البابونج والنعناع البري.",
    image: PlaceHolderImages.find(img => img.id === 'herbal-tea')?.imageUrl || "",
  },
  {
    id: "4",
    name: "تارت الشوكولاتة والذهب",
    price: 28,
    category: "حلويات",
    description: "شوكولاتة داكنة 70% مع لمسة من ورق الذهب الصالح للأكل.",
    image: PlaceHolderImages.find(img => img.id === 'chocolate-tart')?.imageUrl || "",
  },
  {
    id: "5",
    name: "إسبانيش لاتيه بارد",
    price: 22,
    category: "قهوة",
    description: "قهوة باردة محلاة توازن بين القوة والنعومة.",
    image: PlaceHolderImages.find(img => img.id === 'coffee-latte')?.imageUrl || "",
  },
  {
    id: "6",
    name: "دانش الفواكه الموسمية",
    price: 18,
    category: "مخبوزات",
    description: "عجينة مخبوزة محشوة بكريمة الفانيليا وفواكه طازجة.",
    image: PlaceHolderImages.find(img => img.id === 'pastry-croissant')?.imageUrl || "",
  }
];

const CATEGORIES = [
  { name: "الكل", icon: null },
  { name: "قهوة", icon: Coffee },
  { name: "مخبوزات", icon: Croissant },
  { name: "مشروبات", icon: Leaf },
  { name: "حلويات", icon: Dessert },
];

export default function MenuPage() {
  const { addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredItems = selectedCategory === "الكل" 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary mb-4">قائمة الطعام</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            اكتشف مجموعتنا المختارة بعناية من القهوة المختصة والمخبوزات الطازجة المحضرة بكل حب.
          </p>
        </header>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.name)}
              className="rounded-full px-6 flex items-center gap-2"
            >
              {cat.icon && <cat.icon className="h-4 w-4" />}
              <span>{cat.name}</span>
            </Button>
          ))}
        </div>

        {/* Grid of Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group border-none shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Badge className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-primary font-bold">
                  {item.price} ر.س
                </Badge>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="font-medium">{item.category}</Badge>
                </div>
                <CardTitle className="text-xl font-headline text-primary">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-2">{item.description}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  onClick={() => addToCart(item)}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-11"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  أضف للسلة
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}