
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
          // محاولة ثانية مع انتظار بسيط لمعالجة تأخر المزامنة
          setTimeout(async () => {
            const retryDoc = await getDoc(userRef);
            if (retryDoc.exists() && retryDoc.data().role === "staff") {
              setIsStaffConfirmed(true);
            } else {
              setIsStaffConfirmed(false);
              toast({ 
                title: "عذراً", 
                description: "ليس لديك صلاحيات الوصول، يرجى مراجعة الإدارة.", 
                variant: "destructive" 
              });
              router.push("/menu");
            }
          }, 2000);
        }
      } catch (e) {
        setIsStaffConfirmed(false);
        router.push("/menu");
      }
    };

    if (!userLoading && db && user) checkRole();
  }, [user, userLoading, db, router, toast]);

  // استعلام الطلبات - لا يتم إلا بعد تأكيد الصلاحية
  const ordersQuery = useMemoFirebase(() => {
    if (!db || isStaffConfirmed !== true) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"));
  }, [db, isStaffConfirmed]);
  
  const { data: ordersData, loading: ordersLoading } = useCollection<Order>(ordersQuery);

  // استعلام المنتجات - لا يتم إلا بعد تأكيد الصلاحية
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
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="h-12 w-12 text-[#432419] animate-spin" />
          <p className="font-black text-[#432419] text-sm tracking-widest uppercase text-center">
            جاري التحقق من الصلاحيات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E8D9]">
      <header className="bg-[#432419] text-[#F2E8D9] p-6 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Coffee className="h-6 w-6 text-[#D48A5A]" />
            <h1 className="text-xl font-black">Diamond Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")} className="text-[#F2E8D9] hover:bg-white/10">العودة للرئيسية</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-10 bg-white/40 p-1.5 rounded-full">
            <TabsTrigger value="orders" className="rounded-full py-3 font-black data-[state=active]:bg-[#432419] data-[state=active]:text-white">الطلبات</TabsTrigger>
            <TabsTrigger value="products" className="rounded-full py-3 font-black data-[state=active]:bg-[#432419] data-[state=active]:text-white">المنيو</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {ordersLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-[#432419]/20" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ordersData?.map((order) => (
                  <Card key={order.id} className="p-6 luxury-card space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black">{order.customerName}</h3>
                      <Badge className="bg-[#432419]">{order.status}</Badge>
                    </div>
                    <div className="text-xs text-[#8B4E2E] space-y-1">
                      <p>السيارة: {order.carType} - {order.carLicensePlate}</p>
                      <p>الجوال: {order.customerPhoneNumber}</p>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px] font-bold">
                          <span>{item.quantity}x {item.name}</span>
                          <span>{item.price * item.quantity} ر.س</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full h-10 bg-[#432419] text-white rounded-xl"
                      onClick={() => handleStatusChange(order.id, order.status)}
                    >
                      تحديث الحالة
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
             <Card className="p-6 luxury-card mb-8">
                <h3 className="font-black mb-4">إضافة صنف جديد</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input name="name" placeholder="الاسم" required className="bg-muted" />
                  <Input name="price" type="number" placeholder="السعر" required className="bg-muted" />
                  <Input name="category" placeholder="التصنيف" required className="bg-muted" />
                  <Input name="description" placeholder="الوصف" required className="bg-muted" />
                  <Button type="submit" className="md:col-span-2 bg-[#D48A5A] text-white">حفظ</Button>
                </form>
             </Card>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {productsData?.map((product) => (
                  <Card key={product.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-sm">{product.name}</h4>
                      <p className="text-[10px] text-[#D48A5A]">{product.price} ر.س</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
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
