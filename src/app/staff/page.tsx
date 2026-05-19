"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { doc, getDoc, collection, updateDoc, query, orderBy, deleteDoc, setDoc, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Order, MenuItem, CartItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, LayoutDashboard, Loader2, Users, TrendingUp, Calendar, Check, PlusCircle, AlertCircle, Clock, Trash2, Plus } from "lucide-react";
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

  const displayedOrders = useMemo(() => {
    if (!ordersData) return [];
    if (userRole === 'admin') return ordersData;
    return ordersData.filter(order => order.status !== 'completed');
  }, [ordersData, userRole]);

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
    const subtotal = manualOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const vat = subtotal * 0.05;
    const totalPrice = subtotal + vat;

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
      <div className="min-h-screen flex items-center justify-center bg-[#110b09]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#D48A5A]" />
          <p className="text-sm font-black text-[#F2E8D9]/60">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110b09] pb-20">
      <header className="bg-[#1a0f0a] border-b border-white/5 text-white p-6 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-[#D48A5A]" />
            <h1 className="text-xl font-black text-[#F2E8D9]">Diamond {userRole === 'admin' ? 'Manager' : 'Staff'}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/menu")} className="text-[#F2E8D9] border-white/10 bg-white/5 hover:bg-white/10">المنيو</Button>
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
            <Card className="luxury-card p-6 flex items-center gap-4 bg-[#1a0f0a] border-white/5">
              <div className="bg-[#D48A5A] p-3 rounded-2xl text-[#110b09]"><Calendar className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-[#D48A5A] uppercase">طلبات اليوم</p>
                <h2 className="text-2xl font-black text-[#F2E8D9]">{stats.dailyCount}</h2>
              </div>
            </Card>
            <Card className="luxury-card p-6 flex items-center gap-4 bg-[#1a0f0a] border-white/5">
              <div className="bg-[#2a1811] border border-[#D48A5A]/30 p-3 rounded-2xl text-[#D48A5A]"><TrendingUp className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-[#F2E8D9]/60 uppercase">الأكثر إقبالاً</p>
                <h2 className="text-lg font-black text-[#F2E8D9] truncate max-w-[150px]">{stats.popularProduct}</h2>
              </div>
            </Card>
            <Card className="luxury-card p-6 flex items-center gap-4 bg-[#1a0f0a] border-white/5">
              <div className="bg-blue-900/40 p-3 rounded-2xl text-blue-400"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-[#F2E8D9]/60 uppercase">فريق العمل</p>
                <h2 className="text-2xl font-black text-[#F2E8D9]">{staffData?.length || 0}</h2>
              </div>
            </Card>
          </div>
        )}

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-4' : 'grid-cols-1'} max-w-2xl mx-auto mb-10 bg-white/5 p-1.5 rounded-full overflow-hidden`}>
            <TabsTrigger value="orders" className="rounded-full py-2.5 font-black text-xs data-[state=active]:bg-[#D48A5A] data-[state=active]:text-[#110b09]">الطلبات</TabsTrigger>
            {userRole === 'admin' && (
              <>
                <TabsTrigger value="products" className="rounded-full py-2.5 font-black text-xs data-[state=active]:bg-[#D48A5A] data-[state=active]:text-[#110b09]">المنيو</TabsTrigger>
                <TabsTrigger value="staff" className="rounded-full py-2.5 font-black text-xs data-[state=active]:bg-[#D48A5A] data-[state=active]:text-[#110b09]">الموظفين</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-full py-2.5 font-black text-xs data-[state=active]:bg-[#D48A5A] data-[state=active]:text-[#110b09]">الإعدادات</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="orders">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-[#F2E8D9]">إدارة الطلبات</h2>
              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#D48A5A] hover:bg-[#8B4E2E] text-[#110b09] rounded-full font-black px-6 shadow-lg">
                    <Plus className="ml-2 h-4 w-4" /> طلب جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-[#1a0f0a] border-white/10 rounded-[2rem] text-[#F2E8D9]">
                  <DialogHeader><DialogTitle className="text-right font-black text-[#F2E8D9]">طلب يدوي جديد</DialogTitle></DialogHeader>
                  <form onSubmit={handleManualOrder} className="space-y-4 pt-4">
                    <Input name="customerName" placeholder="اسم الزبون" required className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" />
                    <Input name="customerPhone" placeholder="9xxxxxxx" className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" dir="ltr" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="carType" placeholder="نوع السيارة" className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" />
                      <Input name="carPlate" placeholder="رقم اللوحة" className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" dir="ltr" />
                    </div>
                    <Select onValueChange={addItemToManualOrder}>
                      <SelectTrigger className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9]"><SelectValue placeholder="أضف منتجاً للطلب" /></SelectTrigger>
                      <SelectContent className="bg-[#1a0f0a] border-white/10 text-[#F2E8D9]">{productsData?.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {p.price.toFixed(3)} ر.ع</SelectItem>)}</SelectContent>
                    </Select>
                    {manualOrderItems.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-xl space-y-2 max-h-40 overflow-y-auto">
                        {manualOrderItems.map(item => <div key={item.id} className="flex justify-between text-xs font-bold"><span>{item.quantity}x {item.name}</span><span>{(item.price * item.quantity).toFixed(3)} ر.ع</span></div>)}
                      </div>
                    )}
                    <Button type="submit" className="w-full h-14 bg-[#D48A5A] text-[#110b09] rounded-xl font-black">تأكيد الطلب ({(manualOrderItems.reduce((s,i) => s + i.price*i.quantity, 0) * 1.05).toFixed(3)} ر.ع مع الضريبة)</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#D48A5A]" />
                <p className="text-sm font-black text-[#F2E8D9]/40">جاري جلب الطلبات...</p>
              </div>
            ) : displayedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedOrders.map((order) => (
                  <Card key={order.id} className={`p-6 luxury-card bg-[#1a0f0a] border-white/5 hover:border-[#D48A5A]/30 transition-all ${order.status === 'completed' ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-sm text-[#F2E8D9]">{order.customerName}</h3>
                      <Badge className={`${getStatusColor(order.status)} text-[10px] text-white border-none`}>{getStatusLabel(order.status)}</Badge>
                    </div>
                    <div className="text-[11px] text-[#F2E8D9]/60 space-y-2 mb-4">
                      <div className="flex items-center gap-2"><Car className="h-3 w-3 text-[#D48A5A]" /> {order.carType} {order.carLicensePlate !== "N/A" && `- ${order.carLicensePlate}`}</div>
                      <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-[#D48A5A]" /> {new Date(order.createdAt).toLocaleTimeString('ar-OM')}</div>
                    </div>
                    <div className="border-t border-white/5 py-3 space-y-1">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-bold text-[#F2E8D9]/80">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-[#D48A5A]">{(item.price * item.quantity).toFixed(3)} ر.ع</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center font-black text-xs text-[#F2E8D9]">
                        <span>الإجمالي: {order.totalPrice.toFixed(3)} ر.ع</span>
                      </div>
                      {order.status !== 'completed' && (
                        <Button className="w-full h-10 bg-white/5 hover:bg-[#D48A5A] hover:text-[#110b09] text-[#F2E8D9] rounded-xl text-xs font-black shadow-md transition-all" onClick={() => handleStatusChange(order.id, order.status)}>
                          تحديث إلى: {getStatusLabel(order.status === 'pending' ? 'preparing' : order.status === 'preparing' ? 'ready' : 'completed')}
                        </Button>
                      )}
                      {order.status === 'completed' && (
                        <div className="flex items-center justify-center gap-2 text-green-500 font-black text-xs py-2 bg-green-500/10 rounded-xl">
                          <Check className="h-4 w-4" /> تم التسليم
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                <AlertCircle className="h-12 w-12 text-white/10 mb-4" />
                <h3 className="text-lg font-black text-white/20">لا توجد طلبات حالية</h3>
              </div>
            )}
          </TabsContent>

          {userRole === 'admin' && (
            <>
              <TabsContent value="products">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-[#F2E8D9]">إدارة المنيو</h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-[#D48A5A] text-[#110b09] rounded-full font-black px-6">
                        <PlusCircle className="ml-2 h-4 w-4" /> إضافة منتج
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-[#1a0f0a] border-white/10 rounded-[2rem] text-[#F2E8D9]">
                      <DialogHeader><DialogTitle className="text-right font-black text-[#F2E8D9]">إضافة صنف جديد</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Input placeholder="اسم المنتج" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" />
                        <Input placeholder="السعر (بالريال العماني)" type="number" step="0.001" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" />
                        <Select onValueChange={val => setNewProduct({...newProduct, category: val})}>
                          <SelectTrigger className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9]"><SelectValue placeholder="التصنيف" /></SelectTrigger>
                          <SelectContent className="bg-[#1a0f0a] border-white/10 text-[#F2E8D9]">
                            <SelectItem value="قهوة مختصة">قهوة مختصة</SelectItem>
                            <SelectItem value="مشروبات باردة">مشروبات باردة</SelectItem>
                            <SelectItem value="حلويات فاخرة">حلويات فاخرة</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="رابط صورة المنتج (URL)" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" />
                        <Input placeholder="وصف المنتج" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" />
                        <Button onClick={handleAddProduct} className="w-full h-14 bg-[#D48A5A] text-[#110b09] rounded-xl font-black">حفظ المنتج</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {productsData?.map(product => (
                    <Card key={product.id} className="luxury-card p-4 bg-[#1a0f0a] border-white/5">
                      <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-white/5">
                        {product.image && <img src={product.image} className="w-full h-full object-cover" />}
                      </div>
                      <h3 className="font-black text-sm mb-1 text-[#F2E8D9]">{product.name}</h3>
                      <p className="text-[10px] text-[#D48A5A] mb-3">{product.price.toFixed(3)} ر.ع</p>
                      <Button variant="destructive" size="sm" className="w-full rounded-lg h-9" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="ml-2 h-3.5 w-3.5" /> حذف
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="staff">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black text-[#F2E8D9]">فريق العمل</h2>
                  <Link href="/register-staff">
                    <Button className="bg-[#D48A5A] text-[#110b09] rounded-full font-black px-6">
                      <PlusCircle className="ml-2 h-4 w-4" /> إضافة موظف
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffData?.map(member => (
                    <Card key={member.uid} className="luxury-card p-4 bg-[#1a0f0a] border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D48A5A]/10 flex items-center justify-center text-[#D48A5A] font-black uppercase">{member.displayName?.[0] || 'U'}</div>
                        <div>
                          <p className="font-black text-sm text-[#F2E8D9]">{member.displayName}</p>
                          <p className="text-[10px] text-white/40">{member.email}</p>
                        </div>
                      </div>
                      <Badge className={member.role === 'admin' ? 'bg-[#D48A5A] text-[#110b09]' : 'bg-white/10 text-white'}>{member.role === 'admin' ? 'مدير' : 'موظف'}</Badge>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <div className="max-w-md mx-auto">
                  <Card className="luxury-card p-8 bg-[#1a0f0a] border-white/5">
                    <h2 className="text-xl font-black text-[#F2E8D9] mb-6 text-center">إعدادات التطبيق</h2>
                    <form onSubmit={handleUpdateLogo} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black text-[#F2E8D9]/60 uppercase">رابط الشعار الجديد (Logo URL)</Label>
                        <Input name="logoUrl" placeholder="https://..." defaultValue={appSettings?.logoUrl} className="rounded-xl bg-white/5 border-none h-12 text-[#F2E8D9] placeholder:text-white/20" required />
                      </div>
                      {appSettings?.logoUrl && (
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-[10px] text-white/40">الشعار الحالي:</p>
                          <img src={appSettings.logoUrl} className="h-20 object-contain p-2 bg-white/5 rounded-xl" />
                        </div>
                      )}
                      <Button type="submit" className="w-full h-14 bg-[#D48A5A] text-[#110b09] rounded-xl font-black shadow-lg">تحديث الشعار</Button>
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