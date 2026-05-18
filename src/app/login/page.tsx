"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Phone, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    setLoading(true);
    try {
      const formattedEmail = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@diamond.com`;
      
      const result = await signInWithEmailAndPassword(auth, formattedEmail, password);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role === "staff") {
          toast({
            title: "مرحباً بك",
            description: `أهلاً بك يا ${userData.displayName || "زميلنا"}.`,
          });
          router.push("/staff");
        } else {
          toast({
            title: "عذراً",
            description: "هذا الحساب ليس لديه صلاحيات الموظفين.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على بيانات الموظف في النظام.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "يرجى التأكد من رقم الجوال وكلمة المرور.",
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
          <CardTitle className="text-2xl font-headline font-black relative z-10">تسجيل دخول الموظفين</CardTitle>
          <p className="text-white/70 mt-2 font-medium relative z-10">مرحباً بعودتك إلى فريق Diamond</p>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-[#432419] flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#D48A5A]" /> رقم الجوال
              </label>
              <Input 
                type="text"
                placeholder="05xxxxxxxx" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 rounded-2xl bg-[#432419]/5 border-none shadow-inner text-left"
                dir="ltr"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
            
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                variant="outline" 
                type="button"
                onClick={() => router.push("/register-staff")}
                className="w-full text-[#432419] border-[#432419]/10 h-12 rounded-xl font-bold"
              >
                <UserPlus className="ml-2 h-4 w-4" /> تسجيل موظف جديد
              </Button>
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => router.push("/menu")}
                className="w-full text-[#8B4E2E] font-bold"
              >
                العودة لقائمة الطعام
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
