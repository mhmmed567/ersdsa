"use client";

import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Coffee, User, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function Home() {
  const { setRole } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSelectRole = (role: 'customer' | 'staff') => {
    setRole(role);
    if (role === 'customer') {
      router.push('/menu');
    } else {
      router.push('/staff');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-md space-y-12 relative z-10 text-center">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex justify-center">
            <div className="bg-primary p-4 rounded-2xl shadow-xl rotate-3">
              <Coffee className="h-12 w-12 text-background" />
            </div>
          </div>
          <h1 className="text-5xl font-headline font-bold text-primary tracking-tight">
            Warm Hearth
          </h1>
          <p className="text-xl font-accent italic text-muted-foreground">
            حيث يلتقي الدفء بالفخامة
          </p>
        </div>

        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <h2 className="text-lg font-headline font-medium text-muted-foreground uppercase tracking-widest">
            اختر هويتك للبدء
          </h2>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="h-24 text-xl justify-between px-8 border-2 hover:border-accent hover:bg-accent/5 transition-all group"
            onClick={() => handleSelectRole('customer')}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold">أنا عميل</span>
              <span className="text-sm font-normal text-muted-foreground">اطلب القهوة والحلويات</span>
            </div>
            <User className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="h-24 text-xl justify-between px-8 border-2 hover:border-primary hover:bg-primary/5 transition-all group"
            onClick={() => handleSelectRole('staff')}
          >
            <div className="flex flex-col items-start">
              <span className="font-bold">أنا موظف</span>
              <span className="text-sm font-normal text-muted-foreground">إدارة الطلبات والعمليات</span>
            </div>
            <ShieldCheck className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
          </Button>
        </div>

        <footer className="pt-12 text-sm text-muted-foreground font-body">
          &copy; {new Date().getFullYear()} Warm Hearth. جميع الحقوق محفوظة.
        </footer>
      </div>
    </div>
  );
}