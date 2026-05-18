
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    setLoading(true);
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        // التحقق من أن المستخدم إما موظف أو مدير
        if (userData.role === "staff" || userData.role === "admin") {
          toast({
            title: "مرحباً بك مجدداً",
            description: `أهلاً بك يا ${userData.displayName || "في فريق العمل"}.`,
          });
          router.push("/staff");
        } else {
          toast({
            title: "عذراً",
            description: "هذا الحساب ليس لديه صلاحيات الوصول إلى لوحة التحكم.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "تنبيه",
          description: "تم تسجيل الدخول، ولكن لم يتم العثور على صلاحياتك. يرجى مراجعة الإدارة.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "يرجى التأكد من البريد الإلكتروني وكلمة المرور.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "البيانات المدخلة غير صحيحة، يرجى المحاولة مرة أخرى.";
      }

      toast({
        title: "خطأ في الدخول",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9] p-4">
      <Card className="w-full max-w-[400px] border-none shadow-2xl rounded-[2.5rem] overflow-hidden luxury-card bg-white/90 backdrop-blur-md">
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
          <CardTitle className="text-xl font-headline font-black relative z-10 text-white text-center">دخول فريق العمل</CardTitle>
          <p className="text-white/60 text-[10px] mt-1 font-medium relative z-10 uppercase tracking-widest text-center">Diamond Administration</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleLogin} className="space-y-5">
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

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-xl font-black text-base transition-all shadow-lg active:scale-95"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
            
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                variant="ghost" 
                type="button"
                onClick={() => router.push("/menu")}
                className="w-full text-[#8B4E2E] font-bold text-xs h-10 hover:bg-[#432419]/5"
              >
                <ArrowLeft className="ml-2 h-3.5 w-3.5" /> العودة للقائمة
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
