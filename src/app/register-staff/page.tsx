"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserPlus, Phone, Lock, User } from "lucide-react";
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
    phoneNumber: "",
    password: "",
    secretCode: ""
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth || !db) return;
    
    if (formData.secretCode !== "DIAMOND2024") {
      toast({
        title: "كود التحقق غير صحيح",
        description: "يرجى إدخال الكود السري الصحيح لتسجيل موظف جديد.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const email = `${formData.phoneNumber}@diamond.com`;
      const result = await createUserWithEmailAndPassword(auth, email, formData.password);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        email: email,
        displayName: formData.displayName,
        role: "staff",
        phoneNumber: formData.phoneNumber,
        createdAt: Date.now()
      };

      // استخدام النمط الصحيح للكتابة مع معالجة أخطاء الصلاحيات
      setDoc(userRef, userData)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });

      toast({
        title: "تم التسجيل بنجاح",
        description: "تم إنشاء حساب الموظف وتفعيله بنجاح.",
      });
      
      router.push("/staff");
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "فشل في إنشاء الحساب، يرجى المحاولة لاحقاً.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[3rem] overflow-hidden luxury-card">
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
          <CardTitle className="text-3xl font-headline font-black relative z-10">تسجيل مسؤول</CardTitle>
          <p className="text-white/70 mt-2 font-medium relative z-10">إضافة عضو جديد لعائلة Diamond</p>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-[#432419] flex items-center gap-2">
                <User className="h-4 w-4 text-[#D48A5A]" /> اسم المسؤول
              </label>
              <Input 
                placeholder="الاسم الكامل" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                required
                className="h-14 rounded-2xl bg-[#432419]/5 border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-[#432419] flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#D48A5A]" /> رقم الجوال
              </label>
              <Input 
                placeholder="05xxxxxxxx" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                required
                className="h-14 rounded-2xl bg-[#432419]/5 border-none shadow-inner text-left font-code"
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

            <div className="space-y-2">
              <label className="text-sm font-black text-[#D48A5A] flex items-center gap-2">
                <Lock className="h-4 w-4" /> الكود السري للإدارة
              </label>
              <Input 
                type="password"
                placeholder="كود التفعيل" 
                value={formData.secretCode}
                onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
                required
                className="h-14 rounded-2xl bg-white border-2 border-[#D48A5A]/20 text-center font-black tracking-widest"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl font-black text-lg transition-all shadow-2xl mt-6 active:scale-95"
            >
              {loading ? "جاري المعالجة..." : "إنشاء حساب المسؤول"}
            </Button>
            
            <Button 
              variant="ghost" 
              type="button"
              onClick={() => router.push("/login")}
              className="w-full text-[#8B4E2E] font-bold h-12 hover:bg-[#432419]/5 rounded-xl"
            >
              لديك حساب بالفعل؟ سجل دخولك
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}