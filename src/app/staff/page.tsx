
"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { doc, getDoc, collection, updateDoc, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Order } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Coffee, Sparkles, Car, Phone } from "lucide-react";
import { staffOrderSummary } from "@/ai/flows/staff-order-summary";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
      <div className="min-h-screen flex items-center justify-center bg-[#f3f0ea]">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, currentStatus: Order['status']) => {
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (db) {
      const orderRef = doc(db, "orders", orderId);
      updateDoc(orderRef, { status: nextStatus });
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
      case 'pending': return <Badge variant="outline" className="bg-orange-100 text-orange-700">معلق</Badge>;
      case 'preparing': return <Badge variant="outline" className="bg-blue-100 text-blue-700">تحضير</Badge>;
      case 'ready': return <Badge variant="outline" className="bg-green-100 text-green-700">جاهز</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-gray-100 text-gray-700">مكتمل</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0ea]">
      <header className="bg-primary text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-headline font-bold">Diamond | لوحة التحكم</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-white hover:bg-white/10">
            <LogOut className="ml-2 h-4 w-4" /> خروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="flex justify-between items-end">
            <h2 className="text-3xl font-headline font-bold text-primary">الطلبات الحالية</h2>
            <Badge className="bg-primary px-4 py-1 text-sm">{ordersData?.length || 0} طلب</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordersLoading ? (
               <div className="col-span-full text-center py-20">جاري تحميل الطلبات...</div>
            ) : !ordersData || ordersData.length === 0 ? (
               <div className="col-span-full text-center py-20 text-muted-foreground">لا توجد طلبات نشطة.</div>
            ) : (
              ordersData.map((order) => (
                <Card key={order.id} className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{order.customerName}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {order.customerPhoneNumber}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-2xl space-y-2">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <Car className="h-4 w-4 text-accent" /> {order.carType}
                      </p>
                      <p className="text-xs bg-white inline-block px-2 py-1 rounded-md border border-black/5 font-code">
                        لوحة: {order.carLicensePlate}
                      </p>
                    </div>

                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-bold">{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-xs text-muted-foreground">الإجمالي:</span>
                      <span className="text-lg font-black text-primary">{order.totalPrice} ر.س</span>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1 rounded-full h-11" onClick={() => generateSummary(order)}>
                            <Sparkles className="h-4 w-4 ml-2 text-accent" /> تلخيص ذكي
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2rem]">
                          <DialogHeader><DialogTitle>ملخص الطلب الذكي</DialogTitle></DialogHeader>
                          <div className="p-4 bg-muted/30 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap">
                            {loadingAi[order.id] ? "جاري التحليل بالذكاء الاصطناعي..." : aiSummaries[order.id] || "لا يوجد ملخص"}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button className="flex-1 bg-accent hover:bg-accent/90 rounded-full h-11" onClick={() => handleStatusChange(order.id, order.status)}>
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
