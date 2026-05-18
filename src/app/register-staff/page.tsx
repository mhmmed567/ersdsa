
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Coffee, UserPlus, Phone, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterStaffPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    displayName: "",
    phoneNumber: "",
    password: "",
    secretCode: "" // كود سري لمنع أي شخص من تسجيل نفسه كموظف
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    // التحقق من كود التسجيل (اختياري للأمان)
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

      // إنشاء ملف المستخدم في Firestore بصلاحية موظف
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        displayName: formData.displayName,
        role: "staff",
        phoneNumber: formData.phoneNumber,
        createdAt: Date.now()
      });

      toast({
        title: "تم التسجيل بنجاح",
        description: "تم إنشاء حساب الموظف وتفعيله.",
      });
      
      router.push("/staff");
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "فشل في إنشاء الحساب، قد يكون الرقم مسجلاً مسبقاً.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9] p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-[#432419] text-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#D48A5A] p-3 rounded-2xl">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold">تسجيل موظف جديد</CardTitle>
          <p className="text-white/70 mt-2">إضافة مسؤول جديد لنظام Diamond</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#432419] flex items-center gap-2">
                <User className="h-4 w-4" /> اسم الموظف
              </label>
              <Input 
                placeholder="الاسم الكامل" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                required
                className="h-12 rounded-xl bg-white border-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#432419] flex items-center gap-2">
                <Phone className="h-4 w-4" /> رقم الجوال
              </label>
              <Input 
                placeholder="05xxxxxxxx" 
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                required
                className="h-12 rounded-xl bg-white border-none text-left shadow-inner"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#432419] flex items-center gap-2">
                <Lock className="h-4 w-4" /> كلمة المرور
              </label>
              <Input 
                type="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                className="h-12 rounded-xl bg-white border-none text-left shadow-inner"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#D48A5A] flex items-center gap-2">
                <Lock className="h-4 w-4" /> الكود السري للتسجيل
              </label>
              <Input 
                type="password"
                placeholder="كود الإدارة" 
                value={formData.secretCode}
                onChange={(e) => setFormData({...formData, secretCode: e.target.value})}
                required
                className="h-12 rounded-xl bg-white border-2 border-[#D48A5A]/20 text-center font-bold"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl font-bold text-lg transition-all shadow-lg mt-4"
            >
              {loading ? "جاري الإنشاء..." : "إنشاء حساب المسؤول"}
            </Button>
            
            <Button 
              variant="ghost" 
              type="button"
              onClick={() => router.push("/login")}
              className="w-full text-[#8B4E2E]"
            >
              لديك حساب بالفعل؟ سجل دخولك
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
