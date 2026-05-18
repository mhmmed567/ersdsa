
"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      const userData = {
        uid: result.user.uid,
        email: email.trim(),
        displayName: displayName || (role === 'admin' ? "مدير" : "موظف"),
        role: role,
        createdAt: Date.now()
      };
      await setDoc(doc(db, "users", result.user.uid), userData);
      toast({ title: "تم بنجاح", description: `تم إنشاء حساب ${role === 'admin' ? 'مدير' : 'موظف'} جديد.` });
      router.push("/staff");
    } catch (error: any) {
      console.error(error);
      let msg = "فشل إنشاء الحساب. تأكد من صحة البيانات.";
      if (error.code === 'auth/email-already-in-use') msg = "هذا البريد مسجل مسبقاً.";
      toast({ title: "خطأ", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9] p-4">
      <Card className="w-full max-w-[450px] border-none shadow-2xl rounded-[2.5rem] overflow-hidden luxury-card bg-white/90 backdrop-blur-md">
        <CardHeader className="bg-[#432419] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D48A5A]/30 to-transparent" />
          <CardTitle className="text-xl font-headline font-black relative z-10 text-white text-center">إضافة عضو للفريق</CardTitle>
          <p className="text-white/60 text-[10px] mt-1 font-medium relative z-10 uppercase tracking-widest text-center text-white">Diamond Team Registration</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#432419]/60 flex items-center gap-2 pr-1 uppercase">
                <User className="h-3 w-3 text-[#D48A5A]" /> الاسم الكامل
              </label>
              <Input placeholder="اسم الموظف" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="h-12 rounded-xl bg-[#432419]/5 border-none shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#432419]/60 flex items-center gap-2 pr-1 uppercase">
                <Mail className="h-3 w-3 text-[#D48A5A]" /> البريد الإلكتروني المهني
              </label>
              <Input type="email" placeholder="example@diamond.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 rounded-xl bg-[#432419]/5 border-none shadow-inner" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#432419]/60 flex items-center gap-2 pr-1 uppercase">
                <Lock className="h-3 w-3 text-[#D48A5A]" /> كلمة المرور
              </label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 rounded-xl bg-[#432419]/5 border-none shadow-inner" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-[#432419]/60 flex items-center gap-2 pr-1 uppercase">
                <ShieldCheck className="h-3 w-3 text-[#D48A5A]" /> تحديد الصلاحية
              </label>
              <Select defaultValue="staff" onValueChange={setRole}>
                <SelectTrigger className="h-12 rounded-xl bg-[#432419]/5 border-none shadow-inner">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">موظف (طلبات فقط)</SelectItem>
                  <SelectItem value="admin">مدير (تحكم كامل)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-14 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-xl font-black text-base shadow-lg transition-all active:scale-95">
              {loading ? "جاري إنشاء الحساب..." : "تأكيد وإنشاء العضوية"}
            </Button>
            <Button variant="ghost" type="button" onClick={() => router.push("/staff")} className="w-full text-[#8B4E2E] font-bold text-xs h-10 hover:bg-[#432419]/5">
              <ArrowLeft className="ml-2 h-3.5 w-3.5" /> العودة للوحة التحكم
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
