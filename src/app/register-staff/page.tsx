
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterStaffPage() {
  const router = useRouter();

  useEffect(() => {
    // توجيه أي شخص يحاول الدخول لهذه الصفحة إلى صفحة تسجيل الدخول
    router.push("/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9]">
      <div className="animate-pulse text-[#432419] font-black">جاري التحويل...</div>
    </div>
  );
}
