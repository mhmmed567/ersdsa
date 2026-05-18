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
        <div className="animate-spin h-12 w-12 border-4 border-[#432419] border-t-transparent rounded-full shadow-xl" />
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
        customerPhoneNumber: order.customerPhoneNumber || "",
        carLicensePlate: order.carLicensePlate || "",
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
      case 'pending': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-none font-black px-4 py-1">معلق</Badge>;
      case 'preparing': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none font-black px-4 py-1">يُحضر</Badge>;
      case 'ready': return <Badge variant="outline" className="bg-green-50 text-green-700 border-none font-black px-4 py-1">جاهز</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-none font-black px-4 py-1">مكتمل</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2E8D9]">
      <header className="bg-[#432419] text-[#F2E8D9] p-6 sticky top-0 z-50 shadow-2xl backdrop-blur-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#D48A5A] p-2.5 rounded-2xl shadow-lg">
              <Coffee className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">Diamond Dashboard</h1>
              <p className="text-[10px] text-[#D48A5A] font-black uppercase tracking-[0.3em]">Staff Administration</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-[#F2E8D9] hover:bg-white/10 rounded-full px-6 h-12">
            <LogOut className="ml-2 h-5 w-5" /> خروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-10">
          <div className="flex justify-between items-end border-b-2 border-[#432419]/5 pb-6">
            <h2 className="text-4xl font-black text-[#432419] tracking-tight">إدارة الطلبات المباشرة</h2>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-white">
              <Clock className="h-5 w-5 text-[#D48A5A]" />
              <span className="font-black text-sm">{ordersData?.length || 0} طلب قيد التنفيذ</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ordersLoading ? (
               <div className="col-span-full text-center py-20 animate-pulse font-black text-[#432419]">جاري تحميل الطلبات...</div>
            ) : !ordersData || ordersData.length === 0 ? (
               <div className="col-span-full text-center py-32 luxury-card p-12 bg-white/50 text-[#8B4E2E]/40 font-black">لا توجد طلبات نشطة في الوقت الحالي.</div>
            ) : (
              ordersData.map((order) => (
                <Card key={order.id} className="luxury-card border-none bg-white p-0 overflow-hidden group">
                  <div className="p-7 space-y-7">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-black text-[#432419] mb-1">{order.customerName}</h3>
                        <p className="text-xs text-[#8B4E2E] flex items-center gap-2 font-black">
                          <Phone className="h-4 w-4" /> {order.customerPhoneNumber}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="bg-[#F2E8D9]/50 p-5 rounded-3xl space-y-4 border border-[#D48A5A]/10 shadow-inner">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#432419] p-2 rounded-xl shadow-md">
                          <Car className="h-5 w-5 text-[#D48A5A]" />
                        </div>
                        <span className="font-black text-[#432419] text-base">{order.carType}</span>
                      </div>
                      <div className="text-xs bg-white inline-block px-5 py-2.5 rounded-2xl border border-[#D48A5A]/10 font-black text-[#432419] shadow-sm">
                        رقم اللوحة: <span className="text-[#D48A5A] ml-1">{order.carLicensePlate}</span>
                      </div>
                    </div>

                    <div className="space-y-3 py-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm items-center">
                          <span className="text-[#432419] font-medium"><span className="font-black text-[#D48A5A] ml-2">{item.quantity}x</span> {item.name}</span>
                          <span className="font-black text-[#432419]">{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-[#432419]/5">
                      <span className="text-xs font-black text-[#8B4E2E] uppercase tracking-widest">Grand Total:</span>
                      <span className="text-3xl font-black text-[#432419]">{order.totalPrice} <span className="text-sm font-bold">ر.س</span></span>
                    </div>

                    <div className="flex gap-4 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 rounded-2xl h-14 border-2 border-[#432419]/5 font-black hover:bg-[#432419]/5 transition-all"
                            onClick={() => generateSummary(order)}
                          >
                            <Sparkles className="h-5 w-5 ml-2 text-[#D48A5A] group-hover:animate-sparkle" /> ملخص ذكي
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[3rem] bg-[#F2E8D9] border-none shadow-2xl p-0 overflow-hidden max-w-md">
                          <DialogHeader className="p-8 bg-[#432419] text-white">
                            <DialogTitle className="font-black text-2xl">تحليل الطلب بالذكاء الاصطناعي</DialogTitle>
                          </DialogHeader>
                          <div className="p-10 text-base leading-relaxed whitespace-pre-wrap text-[#432419] font-black bg-white/50 backdrop-blur-xl">
                            {loadingAi[order.id] ? (
                              <div className="flex flex-col items-center gap-4 py-10">
                                <div className="animate-spin h-10 w-10 border-4 border-[#D48A5A] border-t-transparent rounded-full" />
                                <p className="text-sm animate-pulse">جاري معالجة البيانات وتحليل الطلب...</p>
                              </div>
                            ) : aiSummaries[order.id] || "لا يوجد ملخص متاح حالياً."}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        className="flex-1 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl h-14 font-black shadow-xl shadow-[#432419]/20 transition-all active:scale-95" 
                        onClick={() => handleStatusChange(order.id, order.status)}
                      >
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