
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
import { LogOut, Coffee, Sparkles } from "lucide-react";
import { staffOrderSummary } from "@/ai/flows/staff-order-summary";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function StaffDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  
  // استخدام useMemo لتثبيت المرجع ومنع حلقات التحديث اللانهائية
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
        console.error("Error checking role:", e);
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
      <header className="bg-primary text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-headline font-bold">Diamond | لوحة الموظفين</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="text-white">
            <LogOut className="ml-2 h-4 w-4" /> خروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <h2 className="text-3xl font-headline font-bold text-primary">الطلبات الحالية</h2>

          <Card className="border-none shadow-xl overflow-hidden rounded-[2rem]">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الذكاء الاصطناعي</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {ordersLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10">جاري تحميل الطلبات...</TableCell></TableRow>
                ) : !ordersData || ordersData.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">لا توجد طلبات حالياً.</TableCell></TableRow>
                ) : (
                  ordersData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{order.customerName}</span>
                          <span className="text-xs text-muted-foreground">{order.customerPhoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => generateSummary(order)}>
                              <Sparkles className="h-4 w-4 text-accent" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>ملخص الطلب الذكي</DialogTitle></DialogHeader>
                            <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed">
                              {loadingAi[order.id] ? "جاري التفكير..." : aiSummaries[order.id] || "اضغط على الأيقونة للتوليد"}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(order.id, order.status)} className="rounded-full">
                          تحديث الحالة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
