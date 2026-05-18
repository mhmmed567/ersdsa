"use client";

import Navbar from "@/components/layout/Navbar";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, Car, User, Phone, MessageSquare } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  customerPhoneNumber: z.string().min(10, "رقم الجوال غير صحيح"),
  carLicensePlate: z.string().optional(),
  specialRequests: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { cart, placeOrder } = useStore();
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhoneNumber: "",
      carLicensePlate: "",
      specialRequests: "",
    },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    const order = placeOrder(values);
    router.push(`/confirmation?orderId=${order.id}`);
  };

  if (cart.length === 0) {
    router.push("/menu");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-headline font-bold text-primary mb-8 text-center">إتمام الطلب</h1>
          
          <Card className="border-none shadow-md">
            <CardHeader className="bg-primary text-white rounded-t-lg">
              <CardTitle className="text-center font-headline">معلومات الاستلام</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-accent font-bold">
                          <User className="h-4 w-4" /> الاسم الكامل
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="أدخل اسمك الكريم" {...field} className="bg-muted/30 focus-visible:ring-accent border-muted" />
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
                        <FormLabel className="flex items-center gap-2 text-accent font-bold">
                          <Phone className="h-4 w-4" /> رقم الجوال
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="05xxxxxxxx" {...field} className="bg-muted/30 focus-visible:ring-accent border-muted" />
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
                        <FormLabel className="flex items-center gap-2 text-accent font-bold">
                          <Car className="h-4 w-4" /> رقم لوحة السيارة (اختياري للاستلام من السيارة)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="أ ب ج 1 2 3 4" {...field} className="bg-muted/30 focus-visible:ring-accent border-muted" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-accent font-bold">
                          <MessageSquare className="h-4 w-4" /> ملاحظات خاصة
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="هل لديك أي طلبات خاصة؟ (مثلاً: حليب لوز، سكر زيادة..)" 
                            className="bg-muted/30 focus-visible:ring-accent border-muted resize-none min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-6">
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 text-lg">
                      تأكيد الطلب والدفع عند الاستلام
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <p className="mt-8 text-center text-sm text-muted-foreground">
            بالضغط على "تأكيد الطلب"، فإنك توافق على سياسات Warm Hearth للخصوصية والخدمة.
          </p>
        </div>
      </main>
    </div>
  );
}