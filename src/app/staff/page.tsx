
"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, getDoc, collection, updateDoc, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LogOut, Coffee, Sparkles, Car, Phone, Clock } from "lucide-react";
import { staffOrderSummary } from "@/ai/flows/staff-order-summary";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function StaffDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  
  const ordersQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: ordersData, loading: ordersLoading } = useCollection<Order>(ordersQuery);
  
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        if (!userLoading) router.push("/login");
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db!, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "staff") {
          setIsStaff(true);
        } else {
          setIsStaff(false);
          router.push("/menu");
        }
      } catch (e) {
        setIsStaff(false);
        router.push("/menu");
      }
    };

    if (!userLoading && db) checkRole();
  }, [user, userLoading, db, router]);

  if (userLoading || isStaff === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9]">
        <div className="animate-spin h-10 w-10 border-4 border-[#432419] border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, currentStatus: Order['status']) => {
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (db) {
      const orderRef = doc(db, "orders", orderId);
      const updateData = { status: nextStatus };
      
      updateDoc(orderRef, updateData)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
            requestResourceData: updateData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  };

  const generateSummary = async (order: Order) => {
    if (loadingAi[order.id]) return;
    setLoadingAi(prev => ({ ...prev, [order.id]: true }));
    try {
      const result = await staffOrderSummary({
        customerName: order.customerName,
        customerPhoneNumber: order.customerPhoneNumber,
        carLicensePlate: order.carLicensePlate,
        orderItems: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        specialRequests: order.specialRequests || "",
        totalPrice: order.totalPrice
      });
      setAiSummaries(prev => ({ ...prev, [order.id]: result.summary }));
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء ملخص الذكاء الاصطناعي",
        variant: "destructive"
      });
    } finally {
      setLoadingAi(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-none">معلق</Badge>;
      case 'preparing': return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-none">تحضير</Badge>;
      case 'ready': return <Badge variant="outline" className="bg-green-100 text-green-700 border-none">جاهز</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-none">مكتمل</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E8D9]">
      <header className="bg-[#432419] text-[#F2E8D9] p-6 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#D48A5A] p-2 rounded-xl">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-headline font-black">Diamond Staff</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-[#F2E8D9] hover:bg-white/10 rounded-full px-6">
            <LogOut className="ml-2 h-4 w-4" /> خروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-headline font-black text-[#432419]">إدارة الطلبات</h2>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Clock className="h-4 w-4 text-[#D48A5A]" />
              <span className="font-bold text-sm">{ordersData?.length || 0} طلب نشط</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ordersLoading ? (
               <div className="col-span-full text-center py-20 animate-pulse">جاري تحميل الطلبات...</div>
            ) : !ordersData || ordersData.length === 0 ? (
               <div className="col-span-full text-center py-20 text-muted-foreground luxury-card p-12 bg-white/50">لا توجد طلبات حالية.</div>
            ) : (
              ordersData.map((order) => (
                <Card key={order.id} className="luxury-card border-none bg-white p-0 overflow-hidden">
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-black text-[#432419]">{order.customerName}</h3>
                        <p className="text-sm text-[#8B4E2E] flex items-center gap-1 font-bold">
                          <Phone className="h-3 w-3" /> {order.customerPhoneNumber}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="bg-[#F2E8D9] p-4 rounded-2xl space-y-3 border border-[#D48A5A]/10">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#432419] p-1.5 rounded-lg">
                          <Car className="h-4 w-4 text-[#D48A5A]" />
                        </div>
                        <span className="font-black text-[#432419] text-sm">{order.carType}</span>
                      </div>
                      <div className="text-xs bg-white inline-block px-3 py-1.5 rounded-xl border border-[#D48A5A]/20 font-black text-[#8B4E2E]">
                        اللوحة: {order.carLicensePlate}
                      </div>
                    </div>

                    <div className="space-y-2 border-y border-[#432419]/5 py-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-[#432419]">{item.quantity}x {item.name}</span>
                          <span className="font-black text-[#D48A5A]">{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#8B4E2E]">الإجمالي الكلي:</span>
                      <span className="text-2xl font-black text-[#432419]">{order.totalPrice} ر.س</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1 rounded-full h-12 border-2 border-[#432419]/10 font-bold hover:bg-[#432419]/5" onClick={() => generateSummary(order)}>
                            <Sparkles className="h-4 w-4 ml-2 text-[#D48A5A]" /> ملخص ذكي
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] bg-[#F2E8D9] border-none shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-[#432419] font-black text-xl">تحليل الطلب بالذكاء الاصطناعي</DialogTitle>
                          </DialogHeader>
                          <div className="p-6 bg-white rounded-3xl text-sm leading-relaxed whitespace-pre-wrap text-[#432419] font-medium shadow-inner">
                            {loadingAi[order.id] ? "جاري تحليل البيانات..." : aiSummaries[order.id] || "لا يوجد ملخص متاح حالياً."}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button className="flex-1 bg-[#D48A5A] hover:bg-[#8B4E2E] text-white rounded-full h-12 font-black shadow-lg shadow-[#D48A5A]/20" onClick={() => handleStatusChange(order.id, order.status)}>
                        تحديث الحالة
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
