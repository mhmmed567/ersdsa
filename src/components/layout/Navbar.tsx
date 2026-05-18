"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { ShoppingCart, LogOut, Menu as MenuIcon, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { cart, setRole } = useStore();
  const router = useRouter();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/menu" className="flex items-center gap-2">
            <Coffee className="h-6 w-6 text-accent" />
            <span className="font-headline text-xl font-bold text-primary">Warm Hearth</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/menu" className="text-sm font-medium hover:text-accent transition-colors">قائمة الطعام</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-white border-2 border-background">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => { setRole(null); router.push("/"); }} className="hidden sm:flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            <span>خروج</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}