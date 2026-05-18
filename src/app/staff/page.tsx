
"use client";

import { useEffect, useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getDoc, collection, updateDoc, query, orderBy, addDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Order, MenuItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, Coffee, Car, Phone, Plus, Trash2, LayoutDashboard, ShoppingBag, Loader2 } from "lucide-react";
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
          // محاولة ثانية مع انتظار بسيط (لمعالجة تأخر المزامنة عند التسجيل الجديد)
          setTimeout(async () => {
            const retryDoc = await getDoc(userRef);
            if (retryDoc.exists() && retryDoc.data().role === "staff") {
              setIsStaffConfirmed(true);
            } else {
              setIsStaffConfirmed(false);
              toast({ 
                title: "عذراً", 
                description: "ليس لديك صلاحيات الوصول لهذه الصفحة، يرجى مراجعة الإدارة.", 
                variant: "destructive" 
              });
              router.push("/menu");
            }
          }, 1500);
        }
      } catch (e) {
        console.error("Permission check failed:", e);
        setIsStaffConfirmed(false);
        router.push("/menu");
      }
    };

    if (!userLoading && db) checkRole();
  }, [user, userLoading, db, router, toast]);

  // استعلام الطلبات - لا يتم إلا بعد تأكيد الصلاحية تماماً
  const ordersQuery = useMemoFirebase(() => {
    if (!db || isStaffConfirmed !== true) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"));
  }, [db, isStaffConfirmed]);
  
  const { data: ordersData, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  // استعلام المنتجات - لا يتم إلا بعد تأكيد الصلاحية تماماً
  const productsQuery = useMemoFirebase(() => {
    if (!db || isStaffConfirmed !== true) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db, isStaffConfirmed]);
  
  const { data: productsData } = useCollection<MenuItem>(productsQuery);

  const handleStatusChange = async (orderId: string, currentStatus: Order['status']) => {
    const statuses: Order['status'][] = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    if (db) {
      const orderRef = doc(db, "orders", orderId);
      updateDoc(orderRef, { status: nextStatus })
        .catch(async () => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: orderRef.path,
            operation: 'update',
          }));
        });
    }
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
      image: "https://picsum.photos/seed/" + Math.random() + "/600/400",
      createdAt: Date.now()
    };

    addDoc(collection(db, "products"), newProduct)
      .then(() => {
        toast({ title: "تمت الإضافة", description: "تم إضافة المنتج بنجاح" });
        (e.target as HTMLFormElement).reset();
      })
      .catch(() => {
         toast({ title: "خطأ", description: "فشل إضافة المنتج، يرجى التحقق من الصلاحيات", variant: "destructive" });
      });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "products", id)).catch(() => {
       toast({ title: "خطأ", description: "لا يمكن حذف المنتج حالياً", variant: "destructive" });
    });
  };

  if (userLoading || isStaffConfirmed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9]">
        <div className="flex flex-col items-center gap-6 animate-pulse">
          <Loader2 className="h-12 w-12 text-[#432419] animate-spin" />
          <p className="font-black text-[#432419] text-sm tracking-widest uppercase text-center">
            جاري تأمين الوصول لـ Diamond Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E8D9]">
      <header className="bg-[#432419] text-[#F2E8D9] p-6 sticky top-0 z-50 shadow-2xl border-b border-white/5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#D48A5A] p-2.5 rounded-2xl shadow-inner"><Coffee className="h-6 w-6 text-white" /></div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black leading-none">Diamond Dashboard</h1>
              <span className="text-[10px] text-[#D48A5A] font-bold uppercase tracking-widest mt-1">Staff Access Only</span>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")} className="text-[#F2E8D9] hover:bg-white/10 rounded-xl font-bold"><LogOut className="ml-2 h-4 w-4" /> العودة للرئيسية</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-10 bg-white/40 backdrop-blur-md p-1.5 rounded-[2rem] shadow-sm">
            <TabsTrigger value="orders" className="rounded-[1.5rem] py-3 font-black data-[state=active]:bg-[#432419] data-[state=active]:text-white transition-all duration-500">
              <ShoppingBag className="ml-2 h-4 w-4" /> الطلبات النشطة
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-[1.5rem] py-3 font-black data-[state=active]:bg-[#432419] data-[state=active]:text-white transition-all duration-500">
              <LayoutDashboard className="ml-2 h-4 w-4" /> إدارة المنيو
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {ordersLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#432419]/20" /></div>
            ) : ordersData?.length === 0 ? (
              <div className="text-center py-24 bg-white/20 rounded-[3rem] border-2 border-dashed border-[#432419]/10">
                <div className="bg-[#432419]/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-[#432419]/30" />
                </div>
                <p className="text-[#432419] font-black text-lg opacity-40">بانتظار طلبات الزبائن...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ordersData?.map((order) => (
                  <Card key={order.id} className="luxury-card p-6 space-y-5 animate-in fade-in slide-in-from-bottom-5 duration-500">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-black text-xl text-[#432419]">{order.customerName}</h3>
                        <p className="text-[10px] text-[#8B4E2E] font-black font-code uppercase opacity-60">#{order.id}</p>
                      </div>
                      <Badge className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                        order.status === 'completed' ? 'bg-green-600 text-white' : 
                        order.status === 'ready' ? 'bg-[#D48A5A] text-white' : 'bg-[#432419] text-white'
                      }`}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#432419]/5 p-3 rounded-2xl flex items-center gap-3">
                        <Phone className="h-4 w-4 text-[#D48A5A]" />
                        <span className="text-xs font-bold" dir="ltr">{order.customerPhoneNumber}</span>
                      </div>
                      <div className="bg-[#432419]/5 p-3 rounded-2xl flex items-center gap-3">
                        <Car className="h-4 w-4 text-[#D48A5A]" />
                        <span className="text-xs font-bold">{order.carType}</span>
                      </div>
                    </div>
                    
                    <div className="bg-[#F2E8D9]/50 p-4 rounded-2xl space-y-2 border border-white/40">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold items-center">
                          <span className="text-[#432419]/80">{item.quantity}x {item.name}</span>
                          <span className="text-[#D48A5A]">{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                      <div className="border-t border-[#432419]/10 pt-2 mt-2 flex justify-between font-black text-sm">
                        <span>الإجمالي</span>
                        <span className="text-[#432419]">{order.totalPrice} ر.س</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full h-12 bg-[#432419] hover:bg-[#D48A5A] text-white rounded-xl font-black text-xs transition-all shadow-lg"
                      onClick={() => handleStatusChange(order.id, order.status)}
                    >
                      تغيير الحالة للمرحلة التالية
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-10">
            <Card className="p-8 luxury-card max-w-2xl mx-auto w-full border-none shadow-2xl">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-right"><Plus className="h-6 w-6 text-[#D48A5A]" /> إضافة صنف جديد للمنيو</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-right" dir="rtl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pr-1">اسم الصنف</label>
                  <Input name="name" placeholder="مثلاً: كورتادو" required className="h-12 rounded-xl bg-[#432419]/5 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pr-1">السعر (ر.س)</label>
                  <Input name="price" type="number" placeholder="25" required className="h-12 rounded-xl bg-[#432419]/5 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pr-1">التصنيف</label>
                  <Input name="category" placeholder="قهوة مختصة" required className="h-12 rounded-xl bg-[#432419]/5 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 pr-1">وصف الصنف</label>
                  <Input name="description" placeholder="وصف قصير جذاب..." required className="h-12 rounded-xl bg-[#432419]/5 border-none font-bold" />
                </div>
                <Button type="submit" className="sm:col-span-2 h-14 bg-[#D48A5A] hover:bg-[#432419] text-white rounded-xl font-black text-base shadow-xl transition-all">
                  تأكيد الإضافة للمنيو
                </Button>
              </form>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" dir="rtl">
              {productsData?.map((product) => (
                <Card key={product.id} className="p-4 luxury-card flex items-center justify-between group hover:border-[#D48A5A]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#432419]/5 flex items-center justify-center font-black text-[#D48A5A] text-xs">
                       {product.price}
                    </div>
                    <div className="text-right">
                      <h4 className="font-black text-sm text-[#432419]">{product.name}</h4>
                      <p className="text-[9px] opacity-50 font-bold uppercase tracking-widest">{product.category}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive/30 hover:text-destructive hover:bg-destructive/5 rounded-full transition-colors" 
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
