
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee } from "lucide-react";

export default function LoginPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // التحقق مما إذا كان المستخدم موجوداً في قاعدة البيانات
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // إنشاء ملف مستخدم جديد بصلاحية عميل افتراضياً
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: "customer",
          displayName: user.displayName,
        });
        router.push("/menu");
      } else {
        const userData = userSnap.data();
        if (userData.role === "staff") {
          router.push("/staff");
        } else {
          router.push("/menu");
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
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
          <CardTitle className="text-2xl font-headline font-bold">مرحباً بك في Diamond</CardTitle>
          <p className="text-white/80 mt-2">سجل دخولك للاستمتاع بتجربة فريدة</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-14 bg-white hover:bg-muted text-black border-2 border-black/5 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" alt="Google" />
            {loading ? "جاري الدخول..." : "الدخول بواسطة جوجل"}
          </Button>
          
          <p className="text-center text-xs text-muted-foreground px-4">
            بصفتك موظفاً، سيتم التعرف على صلاحياتك تلقائياً عند تسجيل الدخول بحساب العمل.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
