
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Mail, User, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function RegisterStaffPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    setLoading(true);
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      // 1. إنشاء الحساب في Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = result.user;

      // 2. تجهيز بيانات المستخدم مع الصلاحية
      const userData = {
        uid: user.uid,
        email: cleanEmail,
        displayName: displayName || "موظف دايموند",
        role: "staff",
        createdAt: Date.now()
      };

      // 3. حفظ البيانات في Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, userData);

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "مرحباً بك في فريق دايموند كمسؤول.",
      });

      // 4. التوجه للوحة التحكم
      router.push("/staff");
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "هذا البريد الإلكتروني مسجل مسبقاً.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "كلمة المرور ضعيفة جداً، يرجى اختيار كلمة مرور أقوى.";
      }

      toast({
        title: "خطأ في التسجيل",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9] p-4">
      <Card className="w-full max-w-[450px] border-none shadow-2xl rounded-[2.5rem] overflow-hidden luxury-card bg-white/90 backdrop-blur-md">
        <CardHeader className="bg-[#432419] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D48A5A]/30 to-transparent" />
          <div className="flex justify-center mb-4 relative z-10">
            <div className="relative w-20 h-20">
              <Image 
                src="https://i.postimg.cc/zfhr8CtC/65774426-19fd-4c21-892e-81dba55d501b-removebg-preview.png"
                alt="Diamond Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-xl font-headline font-black relative z-10 text-white text-center">إنشاء حساب مسؤول جديد</CardTitle>
          <p className="text-white/60 text-[10px] mt-1 font-medium relative z-10 uppercase tracking-widest text-center">New Staff Registration</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#432419]/60 uppercase tracking-widest flex items-center gap-2 pr-1">
                <User className="h-3 w-3 text-[#D48A5A]" /> الاسم الكامل
              </label>
              <Input 
                type="text"
                placeholder="أدخل اسم الموظف" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="h-12 rounded-xl bg-[#432419]/5 border-none shadow-inner text-right font-medium focus-visible:ring-1 focus-visible:ring-[#D48A5A]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#432419]/60 uppercase tracking-widest flex items-center gap-2 pr-1">
                <Mail className="h-3 w-3 text-[#D48A5A]" /> البريد الإلكتروني
              </label>
              <Input 
                type="email"
                placeholder="example@diamond.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl bg-[#432419]/5 border-none shadow-inner text-left font-medium focus-visible:ring-1 focus-visible:ring-[#D48A5A]"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#432419]/60 uppercase tracking-widest flex items-center gap-2 pr-1">
                <Lock className="h-3 w-3 text-[#D48A5A]" /> كلمة المرور
              </label>
              <Input 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-[#432419]/5 border-none shadow-inner text-left focus-visible:ring-1 focus-visible:ring-[#D48A5A]"
                dir="ltr"
              />
            </div>

            <div className="bg-[#D48A5A]/10 p-4 rounded-2xl flex items-start gap-3 border border-[#D48A5A]/20">
              <ShieldCheck className="h-5 w-5 text-[#D48A5A] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#8B4E2E] leading-relaxed">
                بمجرد إنشاء هذا الحساب، سيحصل المستخدم على صلاحيات <strong>المسؤول</strong> للوصول إلى لوحة التحكم وإدارة الطلبات والمنيو.
              </p>
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-xl font-black text-base transition-all shadow-lg active:scale-95"
            >
              {loading ? "جاري الحفظ..." : "تأكيد وإنشاء الحساب"}
            </Button>
            
            <Button 
              variant="ghost" 
              type="button"
              onClick={() => router.push("/login")}
              className="w-full text-[#8B4E2E] font-bold text-xs h-10 hover:bg-[#432419]/5"
            >
              <ArrowLeft className="ml-2 h-3.5 w-3.5" /> العودة للدخول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
