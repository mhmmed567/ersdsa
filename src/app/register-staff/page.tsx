
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserPlus, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function RegisterStaffPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth || !db) return;
    
    setLoading(true);
    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password.trim();

    try {
      // 1. إنشاء الحساب في Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = result.user;

      // 2. تجهيز بيانات المستخدم مع الصلاحية
      const userRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        email: cleanEmail,
        displayName: formData.displayName.trim(),
        role: "staff", 
        createdAt: Date.now()
      };

      // 3. الحفظ في Firestore مع ضمان اكتمال العملية
      try {
        await setDoc(userRef, userData);
        
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: `مرحباً بك يا ${formData.displayName}. تم منحك صلاحيات المسؤول.`,
        });
        
        router.push("/staff");
      } catch (err: any) {
        // في حال فشل Firestore، نرسل الخطأ للمتتبع
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'create',
          requestResourceData: userData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        throw err;
      }

    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "هذا البريد الإلكتروني مسجل مسبقاً.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "البريد الإلكتروني غير صحيح.";
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
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden luxury-card bg-white/95 backdrop-blur-md">
        <CardHeader className="bg-[#432419] text-white p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D48A5A]/20 to-transparent" />
          <div className="flex justify-center mb-6 relative z-10">
            <div className="relative w-24 h-24 transition-transform hover:scale-110">
              <Image 
                src="https://i.postimg.cc/zfhr8CtC/65774426-19fd-4c21-892e-81dba55d501b-removebg-preview.png"
                alt="Diamond Logo"
                fill
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-black relative z-10 text-white">تسجيل مسؤول</CardTitle>
          <p className="text-white/70 mt-2 font-medium relative z-10">إنشاء حساب بصلاحيات إدارة النظام</p>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-[#432419] flex items-center gap-2">
                <User className="h-4 w-4 text-[#D48A5A]" /> الاسم الكامل
              </label>
              <Input 
                placeholder="الاسم الكريم" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                required
                className="h-14 rounded-2xl bg-[#432419]/5 border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-[#432419] flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#D48A5A]" /> البريد الإلكتروني
              </label>
              <Input 
                placeholder="example@diamond.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="h-14 rounded-2xl bg-[#432419]/5 border-none shadow-inner text-left font-medium"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-black text-[#432419] flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#D48A5A]" /> كلمة المرور
              </label>
              <Input 
                type="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="h-14 rounded-2xl bg-[#432419]/5 border-none shadow-inner text-left"
                dir="ltr"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl font-black text-lg transition-all shadow-2xl mt-6 active:scale-95"
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب المسؤول"}
            </Button>
            
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-[#8B4E2E] font-bold h-12 hover:bg-[#432419]/5 rounded-xl"
              >
                هل تملك حساباً؟ سجل دخولك
              </Button>
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => router.push("/menu")}
                className="w-full text-[#432419]/40 font-bold h-10 hover:bg-transparent"
              >
                <ArrowLeft className="ml-2 h-4 w-4" /> العودة للقائمة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
