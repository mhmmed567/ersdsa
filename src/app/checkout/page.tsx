
"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, Car, User, Phone, MessageSquare, Info } from "lucide-react";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

const checkoutSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  customerPhoneNumber: z.string().min(10, "رقم الجوال غير صحيح"),
  carType: z.string().min(2, "يرجى إدخال نوع السيارة"),
  carLicensePlate: z.string().min(1, "يرجى إدخال رقم اللوحة"),
  specialRequests: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cart, clearCart } = useStore();
  const db = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhoneNumber: "",
      carType: "",
      carLicensePlate: "",
      specialRequests: "",
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!db) return;

    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      ...values,
      id: orderId,
      customerUid: user?.uid || "guest",
      items: cart,
      totalPrice,
      status: 'pending',
      createdAt: Date.now(),
    };

    const orderRef = doc(db, "orders", orderId);
    
    setDoc(orderRef, orderData)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: orderRef.path,
          operation: 'create',
          requestResourceData: orderData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
    
    clearCart();
    router.push(`/confirmation?orderId=${orderId}`);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2E8D9]">
        <Button onClick={() => router.push("/menu")} className="bg-[#432419] text-white rounded-full px-8 py-4">العودة للمنيو</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2E8D9]">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-headline font-black text-[#432419] mb-8 text-center">بيانات الاستلام</h1>
          
          <Card className="luxury-card border-none overflow-hidden">
            <CardHeader className="bg-[#432419] text-[#F2E8D9] p-8">
              <CardTitle className="text-center font-headline text-xl">أدخل معلوماتك لنخدمك بشكل أسرع</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-[#D48A5A] font-black">
                            <User className="h-4 w-4" /> الاسم الكامل
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="أدخل اسمك الكريم" {...field} className="h-14 rounded-2xl bg-[#432419]/5 border-none focus-visible:ring-1 focus-visible:ring-[#D48A5A]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerPhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-[#D48A5A] font-black">
                            <Phone className="h-4 w-4" /> رقم الجوال
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="05xxxxxxxx" {...field} className="h-14 rounded-2xl bg-[#432419]/5 border-none focus-visible:ring-1 focus-visible:ring-[#D48A5A]" dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="carType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-[#D48A5A] font-black">
                            <Info className="h-4 w-4" /> نوع السيارة
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="مثلاً: تويوتا كامري" {...field} className="h-14 rounded-2xl bg-[#432419]/5 border-none focus-visible:ring-1 focus-visible:ring-[#D48A5A]" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="carLicensePlate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-[#D48A5A] font-black">
                            <Car className="h-4 w-4" /> رقم اللوحة
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="أ ب ج 1 2 3" {...field} className="h-14 rounded-2xl bg-[#432419]/5 border-none focus-visible:ring-1 focus-visible:ring-[#D48A5A]" dir="ltr" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[#D48A5A] font-black">
                          <MessageSquare className="h-4 w-4" /> ملاحظات خاصة
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="هل لديك أي طلبات خاصة؟" 
                            className="bg-[#432419]/5 border-none rounded-2xl min-h-[120px] focus-visible:ring-1 focus-visible:ring-[#D48A5A]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-6">
                    <Button type="submit" className="w-full bg-[#D48A5A] hover:bg-[#8B4E2E] text-white font-black h-16 text-lg rounded-full shadow-xl transition-all active:scale-95">
                      تأكيد الطلب والدفع عند الاستلام
                      <CheckCircle2 className="mr-2 h-6 w-6" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
