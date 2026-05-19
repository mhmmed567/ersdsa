"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.05; // Oman VAT is 5%
  const total = subtotal + vat;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-primary mb-4">سلتك فارغة</h1>
          <p className="text-muted-foreground mb-8">لم تضف أي منتجات إلى سلتك بعد.</p>
          <Link href="/menu">
            <Button size="lg" className="bg-accent hover:bg-accent/90">
              استكشف قائمة الطعام
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-headline font-bold text-primary mb-8">سلة التسوق</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="overflow-hidden border-none shadow-sm">
                <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative h-24 w-24 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  
                  <div className="flex-grow text-center sm:text-right">
                    <h3 className="text-lg font-headline font-bold text-primary">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                    <p className="text-accent font-bold">{item.price.toFixed(3)} ر.ع</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-full px-2 py-1 bg-muted/50">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-none shadow-md sticky top-24 overflow-hidden">
              <div className="bg-primary p-4 text-center">
                <h2 className="text-xl font-headline font-bold text-white">ملخص الطلب</h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{subtotal.toFixed(3)} ر.ع</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ضريبة القيمة المضافة (5%)</span>
                  <span>{vat.toFixed(3)} ر.ع</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-primary">
                  <span>الإجمالي</span>
                  <span>{total.toFixed(3)} ر.ع</span>
                </div>
                
                <Link href="/checkout" className="block w-full pt-4">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12">
                    المتابعة لإتمام الطلب
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/menu" className="block w-full">
                  <Button variant="outline" className="w-full h-12">
                    مواصلة التسوق
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}