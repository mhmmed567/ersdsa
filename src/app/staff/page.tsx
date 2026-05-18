
"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, getDoc, collection, updateDoc, query, orderBy, addDoc, deleteDoc, setDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Order, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, Coffee, Car, Phone, Plus, Trash2, LayoutDashboard, ShoppingBag, Loader2, Users, PieChart, Settings, Image as ImageIcon, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function StaffDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isStaffConfirmed, setIsStaffConfirmed] = useState<boolean | null>(null);

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
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().role === "staff") {
          setIsStaffConfirmed(true);
        } else {
          setIsStaffConfirmed(false);
          router.push("/menu");
        }
      } catch (e) {
        setIsStaffConfirmed(false);
        router.push("/menu");
      }
    };
    if (!userLoading && db && user) checkRole();
  }, [user, userLoading, db, router]);

  // Data Queries
  const ordersQuery = useMemoFirebase(() => {
    if (!db || isStaffConfirmed !== true) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"));
  }, [db, isStaffConfirmed]);
  const { data: ordersData, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  const productsQuery = useMemoFirebase(() => {
    if (!db || isStaffConfirmed !== true) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db, isStaffConfirmed]);
  const { data: productsData } = useCollection<MenuItem>(productsQuery);

  const staffQuery = useMemoFirebase(() => {
    if (!db || isStaffConfirmed !== true) return null;
    return query(collection(db, "users"), where("role", "==", "staff"));
  }, [db, isStaffConfirmed]);
  const { data: staffData } = useCollection<any>(staffQuery);

  // Analytics Calculations
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

    return {
      dailyCount: dailyOrders.length,
      popularProduct: popular
    };
  }, [ordersData]);

  const handleStatusChange = async (orderId: string, currentStatus: Order['status']) => {
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (db) {
      const orderRef = doc(db, "orders", orderId);
      updateDoc(orderRef, { status: nextStatus }).catch(() => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: orderRef.path, operation: 'update' }));
      });
    }
  };

  const handleUpdateLogo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const logoUrl = formData.get("logoUrl") as string;
    
    setDoc(doc(db, "settings", "app"), { logoUrl, updatedAt: Date.now() }, { merge: true })
      .then(() => toast({ title: "تم التحديث", description: "تم تغيير الشعار بنجاح" }))
      .catch(() => toast({ title: "خطأ", description: "فشل تحديث الشعار", variant: "destructive" }));
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const newProduct = {
      name: formData.get("name") as string,
      price: Number(formData.get("price")),
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      image: formData.get("imageUrl") as string || "https://picsum.photos/seed/default/600/400",
      createdAt: Date.now()
    };

    addDoc(collection(db, "products"), newProduct)
      .then(() => {
        toast({ title: "تمت الإضافة", description: "تم إضافة المنتج بنجاح" });
        (e.target as HTMLFormElement).reset();
      });
  };

  if (userLoading || isStaffConfirmed === null) {
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
            <h1 className="text-xl font-black">Diamond Staff Panel</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/menu")} className="text-white border-white/20 bg-white/10 hover:bg-white/20">المنيو</Button>
            <Button variant="ghost" onClick={() => router.push("/")} className="text-[#F2E8D9]">الرئيسية</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Statistics Bar */}
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

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-10 bg-white/40 p-1.5 rounded-full overflow-hidden">
            <TabsTrigger value="orders" className="rounded-full py-2.5 font-black text-xs">الطلبات</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full py-2.5 font-black text-xs">المنيو</TabsTrigger>
            <TabsTrigger value="staff" className="rounded-full py-2.5 font-black text-xs">الموظفين</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full py-2.5 font-black text-xs">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ordersData?.map((order) => (
                <Card key={order.id} className="p-6 luxury-card bg-white hover:shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-sm">{order.customerName}</h3>
                    <Badge className={`${order.status === 'completed' ? 'bg-green-600' : 'bg-[#432419]'} text-[10px]`}>{order.status}</Badge>
                  </div>
                  <div className="text-[11px] text-[#8B4E2E] space-y-2 mb-4">
                    <div className="flex items-center gap-2"><Car className="h-3 w-3" /> {order.carType} - {order.carLicensePlate}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {order.customerPhoneNumber}</div>
                  </div>
                  <div className="border-t border-dashed py-3 space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-[10px] font-bold">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-[#D48A5A]">{item.price * item.quantity} ر.س</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-2 h-10 bg-[#432419] text-white rounded-xl text-xs font-black" onClick={() => handleStatusChange(order.id, order.status)}>تحديث الحالة</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 p-6 luxury-card h-fit sticky top-24">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-black text-[#432419]">إضافة صنف جديد</CardTitle>
                </CardHeader>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <Input name="name" placeholder="اسم المنتج" required className="bg-muted border-none rounded-xl" />
                  <Input name="price" type="number" placeholder="السعر (ر.س)" required className="bg-muted border-none rounded-xl" />
                  <Input name="category" placeholder="التصنيف (مثلاً: قهوة باردة)" required className="bg-muted border-none rounded-xl" />
                  <Input name="imageUrl" placeholder="رابط صورة المنتج (URL)" className="bg-muted border-none rounded-xl" />
                  <Input name="description" placeholder="وصف بسيط" className="bg-muted border-none rounded-xl" />
                  <Button type="submit" className="w-full bg-[#D48A5A] text-white h-12 rounded-xl font-black">حفظ المنتج</Button>
                </form>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productsData?.map((product) => (
                  <Card key={product.id} className="p-4 flex items-center justify-between luxury-card bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                        <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-[#432419]">{product.name}</h4>
                        <p className="text-[10px] text-[#D48A5A] font-bold">{product.price} ر.س</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc(db!, "products", product.id))} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="luxury-card p-6 bg-white mb-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-lg text-[#432419]">فريق عمل دايموند</h3>
                <Button onClick={() => router.push("/register-staff")} className="bg-[#432419] text-white rounded-xl">
                  <Plus className="ml-2 h-4 w-4" /> إضافة موظف جديد
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffData?.map((staff: any) => (
                  <div key={staff.uid} className="flex items-center justify-between p-4 bg-[#F2E8D9]/30 rounded-2xl border border-[#432419]/5">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#432419] text-white w-10 h-10 rounded-full flex items-center justify-center font-black">
                        {staff.displayName?.[0] || staff.email?.[0]}
                      </div>
                      <div>
                        <p className="font-black text-xs">{staff.displayName || "موظف"}</p>
                        <p className="text-[10px] text-muted-foreground">{staff.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-[#D48A5A]/10 text-[#D48A5A] border-none">مسؤول</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="luxury-card p-8 bg-white max-w-xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#432419] p-4 rounded-3xl text-white"><Settings className="h-8 w-8" /></div>
                <div>
                  <h3 className="font-black text-xl">إعدادات التطبيق</h3>
                  <p className="text-xs text-muted-foreground">تحكم في هوية Diamond</p>
                </div>
              </div>

              <form onSubmit={handleUpdateLogo} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-[#432419]/60 uppercase flex items-center gap-2">
                    <ImageIcon className="h-3 w-3" /> رابط شعار التطبيق (Logo URL)
                  </label>
                  <Input 
                    name="logoUrl" 
                    defaultValue={appSettings?.logoUrl || ""}
                    placeholder="https://example.com/logo.png" 
                    className="h-14 rounded-2xl bg-[#432419]/5 border-none focus-visible:ring-1 focus-visible:ring-[#D48A5A] text-left" 
                    dir="ltr"
                  />
                  <p className="text-[9px] text-[#8B4E2E]/60">سيتم تغيير الشعار في الشاشة الافتتاحية وبار التنقل فوراً.</p>
                </div>

                {appSettings?.logoUrl && (
                  <div className="p-6 bg-[#F2E8D9]/20 rounded-3xl border border-dashed border-[#432419]/10 flex flex-col items-center gap-4">
                    <p className="text-[10px] font-black text-[#D48A5A]">معاينة الشعار الحالي</p>
                    <div className="relative w-32 h-32">
                      <img src={appSettings.logoUrl} alt="Logo Preview" className="object-contain w-full h-full" />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-14 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-2xl font-black text-base shadow-lg transition-all active:scale-95">
                  حفظ الإعدادات
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
