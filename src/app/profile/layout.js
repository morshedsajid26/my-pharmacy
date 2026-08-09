'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerSidebar } from "@/layouts/CustomerSidebar";
import { CustomerNavbar } from "@/layouts/CustomerNavbar";
import { useUI } from "@/context/UIContext";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";
import { getCurrentCustomer } from "@/lib/actions/online-customer.actions";

export default function CustomerDashboardLayout({ children }) {
  const { isSidebarCollapsed } = useUI();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Enforce Route Protection for Customers
  useEffect(() => {
    async function loadAuth() {
      try {
        const data = await getCurrentCustomer();
        if (!data) {
          router.replace("/login");
        } else {
          setCustomer(data);
        }
      } catch (error) {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    loadAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-semibold text-sm text-slate-500 animate-pulse">
          Loading Customer Profile...
        </p>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <CustomerSidebar customer={customer} />
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-w-0",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <CustomerNavbar customer={customer} />
        <main className="p-4 md:p-8 flex-1">
          {/* We pass the customer to children using React Context or cloneElement, but since children are page components in App Router, they will fetch their own data or use a Provider. */}
          {children}
        </main>
      </div>
    </div>
  );
}
