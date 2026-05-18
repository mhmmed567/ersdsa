
"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, getDoc, collection, updateDoc, query, orderBy, addDoc, deleteDoc, setDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Order, MenuItem, CartItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, Coffee, Car, Phone, Plus, Trash2, LayoutDashboard, ShoppingBag, Loader2, Users, Settings, Image as ImageIcon, TrendingUp, Calendar, CheckCircle2, Clock, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function StaffDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Manual Order State
  const [manualOrderItems, setManualOrderItems] = useState<CartItem[]>([]);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  // App Settings for Logo
  const settingsRef = useMemo(() => db ? doc(db, "settings", "app") : null, [db]);
  const { data: appSettings } = useDoc(settingsRef);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        if (!userLoading) router.push("/login");
        return;
      }
      try {
        const userRef = doc(db!, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const role = userSnap.data().role;
          if (role === "admin" || role === "staff") {
            setUserRole(role);
          } else {
            router.push("/menu");
          }
        } else {
          router.push("/menu");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsAuthChecking(false);
      }
    };
    if (!userLoading && db && user) checkRole();
    else if (!userLoading && !user) setIsAuthChecking(false);
  }, [user, userLoading, db, router]);

  // Data Queries
  const ordersQuery = useMemoFirebase(() => {
    if (!db || !userRole) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"));
  }, [db, userRole]);
  const { data: ordersData, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  const productsQuery = useMemoFirebase(() => {
    if (!db || !userRole) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db, userRole]);
  const { data: productsData } = useCollection<MenuItem>(productsQuery);

  const staffQuery = useMemoFirebase(() => {
    if (!db || userRole !== "admin") return null;
    return query(collection(db, "users"), where("role", "in", ["staff", "admin"]));
  }, [db, userRole]);
  const { data: staffData } = useCollection<any>(staffQuery);

  // Filtered Orders for Staff (Hide completed)
  const displayedOrders = useMemo(() => {
    if (!ordersData) return [];
    if (userRole === 'admin') return ordersData;
    // الموظف يرى فقط الطلبات غير المكتملة
    return ordersData.filter(order => order.status !== 'completed');
  }, [ordersData, userRole]);

  // Analytics Calculations (For Admin)
  const stats = useMemo(() => {
    if (!ordersData) return { dailyCount: 0, popularProduct: "جاري التحميل..." };
    const today = new Date().setHours(0, 0, 0, 0);
    const dailyOrders = ordersData.filter(order => (order.createdAt || 0) >= today);
    const productCounts: Record<string, number> = {};
    ordersData.forEach(order => {
      order.items.forEach(item => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
      });
    });
    const popular = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "لا يوجد بيانات";
    return { dailyCount: dailyOrders.length, popularProduct: popular };
  }, [ordersData]);

  const handleStatusChange = async (orderId: string, currentStatus: Order['status']) => {
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (db) {
      const orderRef = doc(db, "orders", orderId);
      updateDoc(orderRef, { status: nextStatus })
        .then(() => {
          if (nextStatus === 'completed' && userRole === 'staff') {
            toast({ title: "تم التسليم", description: "تم إكمال الطلب بنجاح واختفى من قائمتك." });
          } else {
            toast({ title: "تم التحديث", description: `حالة الطلب الآن: ${nextStatus}` });
          }
        })
        .catch(() => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: orderRef.path, operation: 'update' }));
        });
    }
  };

  const handleManualOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || manualOrderItems.length === 0) {
      toast({ title: "خطأ", description: "يرجى إضافة منتج واحد على الأقل", variant: "destructive" });
      return;
    }
    const formData = new FormData(e.currentTarget);
    const orderId = `MAN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const totalPrice = manualOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      id: orderId,
      customerName: formData.get("customerName") as string,
      customerPhoneNumber: formData.get("customerPhone") as string,
      carType: formData.get("carType") as string || "استلام من الكاونتر",
      carLicensePlate: formData.get("carPlate") as string || "N/A",
      items: manualOrderItems,
      totalPrice,
      status: 'pending',
      createdAt: Date.now(),
      createdBy: user?.uid
    };

    const ordersCollection = collection(db, "orders");
    addDoc(ordersCollection, orderData)
      .then(() => {
        toast({ title: "تم الطلب", description: "تم إنشاء الطلب اليدوي بنجاح" });
        setIsOrderDialogOpen(false);
        setManualOrderItems([]);
      })
      .catch((e) => console.error(e));
  };

  const addItemToManualOrder = (productId: string) => {
    const product = productsData?.find(p => p.id === productId);
    if (!product) return;
    const existing = manualOrderItems.find(i => i.id === productId);
    if (existing) {
      setManualOrderItems(manualOrderItems.map(i => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setManualOrderItems([...manualOrderItems, { ...product, quantity: 1 }]);
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'preparing': return 'تجهيز';
      case 'ready': return 'جاهز للاستلام';
      case 'completed': return 'تم التسليم';
      default: return status;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'ready': return 'bg-orange-500';
      case 'completed': return 'bg-green-600';
      default: return 'bg-[#432419]';
    }
  };

  if (userLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9]">
        <Loader2 className="h-10 w-10 animate-spin text-[#432419]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E8D9] pb-20">
      <header className="bg-[#432419] text-white p-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-[#D48A5A]" />
            <h1 className="text-xl font-black">Diamond {userRole === 'admin' ? 'Manager' : 'Staff'} Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/menu")} className="text-white border-white/20 bg-white/10 hover:bg-white/20">المنيو</Button>
            <Button variant="ghost" onClick={async () => {
              const auth = (await import('firebase/auth')).getAuth();
              auth.signOut();
            }} className="text-destructive font-black">خروج</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="luxury-card p-6 flex items-center gap-4 bg-white/80">
              <div className="bg-[#432419] p-3 rounded-2xl text-white"><Calendar className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-[#D48A5A] uppercase">طلبات اليوم</p>
                <h2 className="text-2xl font-black text-[#432419]">{stats.dailyCount}</h2>
              </div>
            </Card>
            <Card className="luxury-card p-6 flex items-center gap-4 bg-white/80">
              <div className="bg-[#D48A5A] p-3 rounded-2xl text-white"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-[#432419]/60 uppercase">الأكثر إقبالاً</p>
                <h2 className="text-lg font-black text-[#432419] truncate max-w-[150px]">{stats.popularProduct}</h2>
              </div>
            </Card>
            <Card className="luxury-card p-6 flex items-center gap-4 bg-white/80">
              <div className="bg-blue-600 p-3 rounded-2xl text-white"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-[#432419]/60 uppercase">فريق العمل</p>
                <h2 className="text-2xl font-black text-[#432419]">{staffData?.length || 0}</h2>
              </div>
            </Card>
          </div>
        )}

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-4' : 'grid-cols-1'} max-w-2xl mx-auto mb-10 bg-white/40 p-1.5 rounded-full overflow-hidden`}>
            <TabsTrigger value="orders" className="rounded-full py-2.5 font-black text-xs">الطلبات</TabsTrigger>
            {userRole === 'admin' && (
              <>
                <TabsTrigger value="products" className="rounded-full py-2.5 font-black text-xs">المنيو</TabsTrigger>
                <TabsTrigger value="staff" className="rounded-full py-2.5 font-black text-xs">الموظفين</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-full py-2.5 font-black text-xs">الإعدادات</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="orders">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-[#432419]">إدارة الطلبات</h2>
                <p className="text-xs text-[#8B4E2E] font-bold">
                  {userRole === 'staff' ? 'تظهر فقط الطلبات النشطة' : 'تظهر جميع الطلبات للمدير'}
                </p>
              </div>
              
              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#D48A5A] text-white rounded-full font-black px-6">
                    <Plus className="ml-2 h-4 w-4" /> طلب جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-[#F2E8D9] border-none rounded-[2.5rem]">
                  <DialogHeader>
                    <DialogTitle className="text-right font-black text-[#432419]">إنشاء طلب يدوي</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleManualOrder} className="space-y-4 pt-4">
                    <Input name="customerName" placeholder="اسم الزبون" required className="bg-white border-none rounded-xl h-12" />
                    <Input name="customerPhone" placeholder="رقم الجوال" required className="bg-white border-none rounded-xl h-12" dir="ltr" />
                    <Input name="carType" placeholder="نوع السيارة (اختياري)" className="bg-white border-none rounded-xl h-12" />
                    <Input name="carPlate" placeholder="رقم اللوحة (اختياري)" className="bg-white border-none rounded-xl h-12" dir="ltr" />
                    
                    <div className="space-y-2">
                      <p className="text-xs font-black text-[#432419]/60 px-1">اختر المنتجات</p>
                      <Select onValueChange={addItemToManualOrder}>
                        <SelectTrigger className="bg-white border-none rounded-xl h-12">
                          <SelectValue placeholder="اختر صنفاً..." />
                        </SelectTrigger>
                        <SelectContent>
                          {productsData?.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} - {p.price} ر.س</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {manualOrderItems.length > 0 && (
                      <div className="bg-white/50 p-4 rounded-2xl space-y-2">
                        {manualOrderItems.map(item => (
                          <div key={item.id} className="flex justify-between text-xs font-bold">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{item.price * item.quantity} ر.س</span>
                          </div>
                        ))}
                        <div className="border-t border-dashed pt-2 flex justify-between font-black text-[#432419]">
                          <span>الإجمالي</span>
                          <span>{manualOrderItems.reduce((s, i) => s + i.price * i.quantity, 0)} ر.س</span>
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button type="submit" className="w-full bg-[#432419] text-white rounded-xl h-12 font-black mt-4">تأكيد الطلب</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedOrders.map((order) => (
                <Card key={order.id} className={`p-6 luxury-card bg-white hover:shadow-xl transition-all ${order.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-sm">{order.customerName}</h3>
                    <Badge className={`${getStatusColor(order.status)} text-[10px] text-white border-none`}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-[#8B4E2E] space-y-2 mb-4">
                    <div className="flex items-center gap-2"><Car className="h-3 w-3 text-[#D48A5A]" /> {order.carType} - {order.carLicensePlate}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-[#D48A5A]" /> {order.customerPhoneNumber}</div>
                    <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-[#D48A5A]" /> {new Date(order.createdAt).toLocaleTimeString('ar-SA')}</div>
                  </div>
                  <div className="border-t border-dashed py-3 space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[10px] font-bold">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-[#D48A5A]">{item.price * item.quantity} ر.س</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-[#432419]">الإجمالي: {order.totalPrice} ر.س</span>
                    </div>
                    {order.status !== 'completed' && (
                      <Button 
                        className="w-full h-10 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-xl text-xs font-black"
                        onClick={() => handleStatusChange(order.id, order.status)}
                      >
                        {order.status === 'pending' && "تجهيز الطلب"}
                        {order.status === 'preparing' && "تم التجهيز (جاهز)"}
                        {order.status === 'ready' && "تم التسليم (إكمال)"}
                      </Button>
                    )}
                    {order.status === 'completed' && (
                      <div className="flex items-center justify-center gap-2 text-green-600 font-black text-xs py-2 bg-green-50 rounded-xl">
                        <Check className="h-4 w-4" /> تم التسليم بنجاح
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {displayedOrders.length === 0 && (
                <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                  <ShoppingBag className="h-12 w-12 text-[#432419]/20" />
                  <p className="text-muted-foreground font-black">لا توجد طلبات نشطة حالياً</p>
                </div>
              )}
            </div>
          </TabsContent>

          {userRole === 'admin' && (
            <>
              <TabsContent value="products">
                {/* نفس محتوى إدارة المنيو */}
              </TabsContent>
              <TabsContent value="staff">
                {/* نفس محتوى إدارة الموظفين */}
              </TabsContent>
              <TabsContent value="settings">
                {/* نفس محتوى الإعدادات */}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
