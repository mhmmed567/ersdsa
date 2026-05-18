
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // توجيه المستخدم مباشرة إلى القائمة بدلاً من صفحة اختيار الهوية
    router.push('/menu');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-full" />
        <p className="font-headline font-bold text-primary">جاري التحميل...</p>
      </div>
    </div>
  );
}
