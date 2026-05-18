"use client";

import { useStore, Order } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LogOut, Coffee, Sparkles, Clock, CheckCircle, Package, ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { staffOrderSummary } from "@/ai/flows/staff-order-summary";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StaffDashboard() {
  const { orders, updateOrderStatus, setRole } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [aiSummaries, setAiSummaries] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState<Record<string, boolean>>({});

  const handleStatusChange = (orderId: string, currentStatus: Order['status']) => {
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateOrderStatus(orderId, nextStatus);
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
        specialRequests: order.specialRequests,
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
      case 'pending': return <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">معلق</Badge>;
      case 'preparing': return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">جاري التحضير</Badge>;
      case 'ready': return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">جاهز</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">مكتمل</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0ea]">
      {/* Sidebar / Topbar */}
      <header className="bg-primary text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-headline font-bold">Warm Hearth | لوحة التحكم</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setRole(null); router.push("/"); }} className="text-white hover:bg-white/10">
            <LogOut className="ml-2 h-4 w-4" /> خروج الموظف
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-3xl font-headline font-bold text-primary">الطلبات الواردة</h2>
            <div className="flex gap-4">
               <Card className="p-3 bg-white border-none shadow-sm flex items-center gap-3">
                 <div className="bg-orange-100 p-2 rounded-lg"><Clock className="h-5 w-5 text-orange-600" /></div>
                 <div>
                   <p className="text-xs text-muted-foreground font-bold">قيد الانتظار</p>
                   <p className="text-xl font-bold text-primary">{orders.filter(o => o.status === 'pending').length}</p>
                 </div>
               </Card>
               <Card className="p-3 bg-white border-none shadow-sm flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-lg"><Package className="h-5 w-5 text-green-600" /></div>
                 <div>
                   <p className="text-xs text-muted-foreground font-bold">جاهزة</p>
                   <p className="text-xl font-bold text-primary">{orders.filter(o => o.status === 'ready').length}</p>
                 </div>
               </Card>
            </div>
          </div>

          <Card className="border-none shadow-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">السيارة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الوقت</TableHead>
                  <TableHead className="text-right">الملخص الذكي</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">لا توجد طلبات حالياً.</TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="font-bold text-primary font-code">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold">{order.customerName}</span>
                          <span className="text-xs text-muted-foreground">{order.customerPhoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.carLicensePlate ? (
                          <Badge variant="secondary" className="flex items-center gap-1 font-bold">
                             {order.carLicensePlate}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString('ar-SA')}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-accent hover:text-accent/80 hover:bg-accent/5 gap-2"
                              onClick={() => !aiSummaries[order.id] && generateSummary(order)}
                            >
                              <Sparkles className="h-4 w-4" />
                              {aiSummaries[order.id] ? "عرض الملخص" : "توليد ملخص"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-background">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 font-headline">
                                <Sparkles className="h-5 w-5 text-accent" /> ملخص الطلب الذكي
                              </DialogTitle>
                            </DialogHeader>
                            <div className="p-4 bg-muted/30 rounded-lg min-h-[100px] whitespace-pre-wrap font-body text-sm leading-relaxed border border-accent/10">
                              {loadingAi[order.id] ? (
                                <div className="flex flex-col items-center justify-center gap-4 py-8">
                                  <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
                                  <p className="text-sm font-medium">جاري معالجة الطلب عبر الذكاء الاصطناعي...</p>
                                </div>
                              ) : (
                                aiSummaries[order.id] || "اضغط على توليد ملخص للحصول على تفاصيل الطلب بشكل مختصر."
                              )}
                            </div>
                            <ScrollArea className="max-h-40 border-t pt-4">
                                <p className="text-xs font-bold text-muted-foreground mb-2">الأصناف المطلوبة:</p>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs mb-1">
                                        <span>{item.quantity}x {item.name}</span>
                                        <span className="text-muted-foreground">{item.price * item.quantity} ر.س</span>
                                    </div>
                                ))}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-2"
                          onClick={() => handleStatusChange(order.id, order.status)}
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                          تغيير الحالة
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