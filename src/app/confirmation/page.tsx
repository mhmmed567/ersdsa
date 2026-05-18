"use client";

import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-success/10 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-20 w-20 text-success" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-headline font-bold text-primary">تم استلام طلبك بنجاح!</h1>
            <p className="text-xl text-muted-foreground">شكراً لثقتك بـ Diamond. نحن نعمل الآن على تجهيز طلبك بأفضل جودة.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-success/20 shadow-sm inline-block w-full">
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-primary font-code">{orderId || "ORD-XXXXXXX"}</p>
          </div>

          <div className="pt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="w-full h-14 border-2">
                <ShoppingBag className="ml-2 h-5 w-5" />
                طلب جديد
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold">
                العودة للرئيسية
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <p className="text-muted-foreground italic font-accent">
            "سيصلك إشعار فور جاهزية طلبك للاستلام."
          </p>
        </div>
      </main>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
