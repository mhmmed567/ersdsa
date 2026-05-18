
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
import { LogOut, Coffee, Car, Phone, Plus, Trash2, LayoutDashboard, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function StaffDashboard() {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isStaff, setIsStaff] = useState<boolean | null>(null);

  // Orders Query - stabilized with useMemoFirebase
  const ordersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "orders"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: ordersData } = useCollection<Order>(ordersQuery);

  // Products Query - stabilized with useMemoFirebase
  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "products"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: productsData } = useCollection<MenuItem>(productsQuery);

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
      });
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "products", id));
  };

  if (userLoading || isStaff === null) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9]"><div className="animate-spin h-12 w-12 border-4 border-[#432419] border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F2E8D9]">
      <header className="bg-[#432419] text-[#F2E8D9] p-6 sticky top-0 z-50 shadow-2xl">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#D48A5A] p-2 rounded-xl"><Coffee className="h-6 w-6 text-white" /></div>
            <h1 className="text-xl font-black">Diamond Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")} className="text-[#F2E8D9] hover:bg-white/10"><LogOut className="ml-2 h-4 w-4" /> خروج</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-white/50 p-1 rounded-2xl">
            <TabsTrigger value="orders" className="rounded-xl font-black data-[state=active]:bg-[#432419] data-[state=active]:text-white">
              <ShoppingBag className="ml-2 h-4 w-4" /> الطلبات
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl font-black data-[state=active]:bg-[#432419] data-[state=active]:text-white">
              <LayoutDashboard className="ml-2 h-4 w-4" /> المنيو
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ordersData?.map((order) => (
                <Card key={order.id} className="luxury-card p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-lg">{order.customerName}</h3>
                    <Badge className="bg-[#D48A5A]">{order.status}</Badge>
                  </div>
                  <div className="text-xs space-y-1 opacity-70">
                    <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {order.customerPhoneNumber}</p>
                    <p className="flex items-center gap-2"><Car className="h-3 w-3" /> {order.carType} - {order.carLicensePlate}</p>
                  </div>
                  <div className="border-t pt-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>{item.price * item.quantity} ر.س</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-[#432419]" onClick={() => handleStatusChange(order.id, order.status)}>تحديث الحالة</Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid gap-8">
              <Card className="p-6 luxury-card max-w-2xl mx-auto w-full">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-right"><Plus className="h-5 w-5" /> إضافة منتج جديد</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right" dir="rtl">
                  <Input name="name" placeholder="اسم المنتج" required className="text-right" />
                  <Input name="price" type="number" placeholder="السعر" required className="text-right" />
                  <Input name="category" placeholder="التصنيف (مثلاً: قهوة مختصة)" required className="text-right" />
                  <Input name="description" placeholder="وصف قصير" required className="text-right" />
                  <Button type="submit" className="sm:col-span-2 bg-[#D48A5A]">إضافة للمنيو</Button>
                </form>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
                {productsData?.map((product) => (
                  <Card key={product.id} className="p-4 luxury-card flex items-center justify-between">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="text-right">
                      <h4 className="font-black text-sm">{product.name}</h4>
                      <p className="text-xs opacity-60">{product.price} ر.س</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
