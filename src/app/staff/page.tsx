
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
import { Label } from "@/components/ui/label";
import { LogOut, Coffee, Car, Phone, Plus, Trash2, LayoutDashboard, Loader2, Users, Settings, TrendingUp, Calendar, Check, PlusCircle, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from "next/link";

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

  // Product Edit State
  const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "قهوة مختصة", description: "", image: "" });

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
          // محاولة ثانية في حال تأخر إنشاء الملف الشخصي
          setTimeout(async () => {
            const retrySnap = await getDoc(userRef);
            if (retrySnap.exists()) {
              setUserRole(retrySnap.data().role);
            } else {
              router.push("/menu");
            }
          }, 2000);
        }
      } catch (e) {
        console.error("Role check error:", e);
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

  const staffDataQuery = useMemoFirebase(() => {
    if (!db || !userRole || userRole !== 'admin') return null;
    return query(collection(db, "users"), where("role", "in", ["staff", "admin"]));
  }, [db, userRole]);
  const { data: staffData } = useCollection<any>(staffDataQuery);

  // Filtered Orders logic
  const displayedOrders = useMemo(() => {
    if (!ordersData) return [];
    // الموظف يرى فقط غير المكتمل، المدير يرى كل شيء
    if (userRole === 'admin') return ordersData;
    return ordersData.filter(order => order.status !== 'completed');
  }, [ordersData, userRole]);

  // Analytics Calculations
  const stats = useMemo(() => {
    if (!ordersData) return { dailyCount: 0, popularProduct: "جاري الحساب..." };
    const today = new Date().setHours(0, 0, 0, 0);
    const dailyOrders = ordersData.filter(order => (order.createdAt || 0) >= today);
    
    const productCounts: Record<string, number> = {};
    ordersData.forEach(order => {
      order.items?.forEach(item => {
        productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
      });
    });
    const popular = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "لا توجد بيانات";
    
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
          toast({ title: "تم التحديث", description: `حالة الطلب الآن: ${getStatusLabel(nextStatus)}` });
        })
        .catch(() => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({ path: orderRef.path, operation: 'update' }));
        });
    }
  };

  const handleAddProduct = async () => {
    if (!db) return;
    const productId = `PROD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const productRef = doc(db, "products", productId);
    
    setDoc(productRef, {
      ...newProduct,
      id: productId,
      price: Number(newProduct.price),
      createdAt: Date.now()
    }).then(() => {
      toast({ title: "تم الإضافة", description: "تمت إضافة المنتج الجديد للمنيو بنجاح" });
      setNewProduct({ name: "", price: "", category: "قهوة مختصة", description: "", image: "" });
    });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "products", id)).then(() => {
      toast({ title: "تم الحذف", description: "تم حذف المنتج من المنيو" });
    });
  };

  const handleUpdateLogo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const formData = new FormData(e.currentTarget);
    const logoUrl = formData.get("logoUrl") as string;
    
    setDoc(doc(db, "settings", "app"), { logoUrl, updatedAt: Date.now() }, { merge: true })
      .then(() => {
        toast({ title: "تم التحديث", description: "تم تغيير شعار التطبيق بنجاح" });
      });
  };

  const handleManualOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db || manualOrderItems.length === 0) {
      toast({ title: "تنبيه", description: "يرجى إضافة منتج واحد على الأقل للطلب اليدوي", variant: "destructive" });
      return;
    }
    const formData = new FormData(e.currentTarget);
    const orderId = `MAN-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const totalPrice = manualOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      id: orderId,
      customerName: formData.get("customerName") as string,
      customerPhoneNumber: formData.get("customerPhone") as string || "N/A",
      carType: formData.get("carType") as string || "استلام كاونتر",
      carLicensePlate: formData.get("carPlate") as string || "N/A",
      items: manualOrderItems,
      totalPrice,
      status: 'pending',
      createdAt: Date.now(),
      createdBy: user?.uid
    };

    const orderRef = doc(db, "orders", orderId);
    setDoc(orderRef, orderData)
      .then(() => {
        toast({ title: "تم إنشاء الطلب", description: `رقم الطلب: ${orderId}` });
        setIsOrderDialogOpen(false);
        setManualOrderItems([]);
      });
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
      case 'pending': return 'انتظار';
      case 'preparing': return 'تجهيز';
      case 'ready': return 'جاهز';
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
      default: return 'bg-slate-500';
    }
  };

  if (userLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#432419]" />
          <p className="text-sm font-black text-[#432419]/60">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E8D9] pb-20">
      <header className="bg-[#432419] text-white p-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-[#D48A5A]" />
            <h1 className="text-xl font-black">Diamond {userRole === 'admin' ? 'Manager' : 'Staff'}</h1>
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
              <h2 className="text-xl font-black text-[#432419]">إدارة الطلبات</h2>
              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#D48A5A] text-white rounded-full font-black px-6 shadow-lg">
                    <Plus className="ml-2 h-4 w-4" /> طلب جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-[#F2E8D9] border-none rounded-[2rem]">
                  <DialogHeader><DialogTitle className="text-right font-black">طلب يدوي جديد</DialogTitle></DialogHeader>
                  <form onSubmit={handleManualOrder} className="space-y-4 pt-4">
                    <Input name="customerName" placeholder="اسم الزبون" required className="rounded-xl border-none h-12" />
                    <Input name="customerPhone" placeholder="رقم الجوال" className="rounded-xl border-none h-12" dir="ltr" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="carType" placeholder="نوع السيارة" className="rounded-xl border-none h-12" />
                      <Input name="carPlate" placeholder="رقم اللوحة" className="rounded-xl border-none h-12" dir="ltr" />
                    </div>
                    <Select onValueChange={addItemToManualOrder}>
                      <SelectTrigger className="rounded-xl border-none h-12 bg-white"><SelectValue placeholder="أضف منتجاً للطلب" /></SelectTrigger>
                      <SelectContent>{productsData?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.price} ر.س</SelectItem>)}</SelectContent>
                    </Select>
                    {manualOrderItems.length > 0 && (
                      <div className="bg-white/40 p-4 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                        {manualOrderItems.map(item => <div key={item.id} className="flex justify-between text-xs font-bold"><span>{item.quantity}x {item.name}</span><span>{item.price * item.quantity} ر.س</span></div>)}
                      </div>
                    )}
                    <Button type="submit" className="w-full h-14 bg-[#432419] text-white rounded-xl font-black">تأكيد الطلب ({manualOrderItems.reduce((s,i) => s + i.price*i.quantity, 0)} ر.س)</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#432419]/40" />
                <p className="text-sm font-black text-[#432419]/40">جاري جلب الطلبات...</p>
              </div>
            ) : displayedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedOrders.map((order) => (
                  <Card key={order.id} className={`p-6 luxury-card bg-white hover:shadow-xl transition-all ${order.status === 'completed' ? 'opacity-60 bg-slate-50' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-sm">{order.customerName}</h3>
                      <Badge className={`${getStatusColor(order.status)} text-[10px] text-white border-none`}>{getStatusLabel(order.status)}</Badge>
                    </div>
                    <div className="text-[11px] text-[#8B4E2E] space-y-2 mb-4">
                      <div className="flex items-center gap-2"><Car className="h-3 w-3 text-[#D48A5A]" /> {order.carType} {order.carLicensePlate !== "N/A" && `- ${order.carLicensePlate}`}</div>
                      <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-[#D48A5A]" /> {new Date(order.createdAt).toLocaleTimeString('ar-SA')}</div>
                    </div>
                    <div className="border-t border-dashed py-3 space-y-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-bold">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-[#D48A5A]">{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center font-black text-xs text-[#432419]">
                        <span>الإجمالي: {order.totalPrice} ر.س</span>
                      </div>
                      {order.status !== 'completed' && (
                        <Button className="w-full h-10 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-xl text-xs font-black shadow-md" onClick={() => handleStatusChange(order.id, order.status)}>
                          تحديث إلى: {getStatusLabel(order.status === 'pending' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'completed')}
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white/40 rounded-[2.5rem] border border-dashed border-[#432419]/20">
                <AlertCircle className="h-12 w-12 text-[#432419]/20 mb-4" />
                <h3 className="text-lg font-black text-[#432419]/60">لا توجد طلبات حالية</h3>
                <p className="text-xs font-bold text-[#432419]/40 mt-1">بمجرد وصول طلب جديد سيظهر هنا فوراً.</p>
              </div>
            )}
          </TabsContent>

          {userRole === 'admin' && (
            <>
              <TabsContent value="products">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-[#432419]">إدارة المنيو</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#432419] text-white rounded-full font-black px-6">
                        <PlusCircle className="ml-2 h-4 w-4" /> إضافة منتج
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-[#F2E8D9] border-none rounded-[2rem]">
                      <DialogHeader><DialogTitle className="text-right font-black">إضافة صنف جديد</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Input placeholder="اسم المنتج" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="rounded-xl border-none h-12" />
                        <Input placeholder="السعر" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="rounded-xl border-none h-12" />
                        <Select onValueChange={val => setNewProduct({...newProduct, category: val})}>
                          <SelectTrigger className="rounded-xl border-none h-12 bg-white"><SelectValue placeholder="التصنيف" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="قهوة مختصة">قهوة مختصة</SelectItem>
                            <SelectItem value="مشروبات باردة">مشروبات باردة</SelectItem>
                            <SelectItem value="حلويات فاخرة">حلويات فاخرة</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="رابط صورة المنتج (URL)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="rounded-xl border-none h-12" />
                        <Input placeholder="وصف المنتج" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="rounded-xl border-none h-12" />
                        <Button onClick={handleAddProduct} className="w-full h-14 bg-[#432419] text-white rounded-xl font-black">حفظ المنتج</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {productsData?.map(product => (
                    <Card key={product.id} className="luxury-card p-4 bg-white">
                      <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-muted">
                        {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                      </div>
                      <h3 className="font-black text-sm mb-1">{product.name}</h3>
                      <p className="text-[10px] text-slate-500 mb-3">{product.price} ر.س</p>
                      <Button variant="destructive" size="sm" className="w-full rounded-lg h-9" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="ml-2 h-3.5 w-3.5" /> حذف
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="staff">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-[#432419]">فريق العمل</h2>
                  <Link href="/register-staff">
                    <Button className="bg-[#432419] text-white rounded-full font-black px-6">
                      <PlusCircle className="ml-2 h-4 w-4" /> إضافة موظف
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffData?.map(member => (
                    <Card key={member.uid} className="luxury-card p-4 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#432419]/5 flex items-center justify-center text-[#432419] font-black uppercase">{member.displayName?.[0] || 'U'}</div>
                        <div>
                          <p className="font-black text-sm">{member.displayName}</p>
                          <p className="text-[10px] text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <Badge className={member.role === 'admin' ? 'bg-[#D48A5A]' : 'bg-[#432419]'}>{member.role === 'admin' ? 'مدير' : 'موظف'}</Badge>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="max-w-md mx-auto">
                  <Card className="luxury-card p-8 bg-white">
                    <h2 className="text-xl font-black text-[#432419] mb-6 text-center">إعدادات التطبيق</h2>
                    <form onSubmit={handleUpdateLogo} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-slate-500 uppercase">رابط الشعار الجديد (Logo URL)</Label>
                        <Input name="logoUrl" placeholder="https://..." defaultValue={appSettings?.logoUrl} className="rounded-xl border-none bg-slate-50 h-12" required />
                      </div>
                      {appSettings?.logoUrl && (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-[10px] text-slate-400">الشعار الحالي:</p>
                          <img src={appSettings.logoUrl} className="h-20 object-contain p-2 bg-slate-100 rounded-xl" />
                        </div>
                      )}
                      <Button type="submit" className="w-full h-14 bg-[#432419] text-white rounded-xl font-black shadow-lg">تحديث الشعار</Button>
                    </form>
                  </Card>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
