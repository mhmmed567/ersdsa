
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Coffee, Lock, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      // في الخلفية نستخدم رقم الجوال كـ Email لإرضاء متطلبات Firebase Auth
      // الموظف يدخل رقمه فقط دون الحاجة لإيميل
      const formattedEmail = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@diamond.com`;
      
      const result = await signInWithEmailAndPassword(auth, formattedEmail, password);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role === "staff") {
          router.push("/staff");
        } else {
          toast({
            title: "عذراً",
            description: "هذا الحساب ليس لديه صلاحيات الموظفين.",
            variant: "destructive"
          });
          router.push("/menu");
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-primary text-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Coffee className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-headline font-bold">تسجيل دخول الموظفين</CardTitle>
          <p className="text-white/80 mt-2">مرحباً بعودتك إلى فريق Diamond</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <Phone className="h-4 w-4" /> رقم الجوال
              </label>
              <Input 
                type="text"
                placeholder="05xxxxxxxx" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="h-12 rounded-xl bg-muted/50 border-none text-left"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-primary flex items-center gap-2">
                <Lock className="h-4 w-4" /> كلمة المرور
              </label>
              <Input 
                type="password"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl bg-muted/50 border-none text-left"
                dir="ltr"
              />
            </div>

            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary/20"
            >
              {loading ? "جاري التحقق..." : "تسجيل الدخول"}
            </Button>
            
            <Button 
              variant="ghost" 
              type="button"
              onClick={() => router.push("/menu")}
              className="w-full text-muted-foreground hover:text-primary"
            >
              العودة لقائمة الطعام
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
