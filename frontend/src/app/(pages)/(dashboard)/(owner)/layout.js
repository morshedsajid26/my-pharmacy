'use client';

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/layouts/Sidebar";
import { Navbar } from "@/layouts/Navbar";
import { useUI } from "@/context/UIContext";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

const STAFF_ALLOWED_PATHS = ["/staff-dashboard", "/sales", "/medicines", "/assigned-orders"];

export default function DashboardLayout({ children }) {
  const { isSidebarCollapsed } = useUI();
  const { user, customer, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const role = String(user?.role || "").toLowerCase();
  const isStaff = role === "staff";
  const isAuthorized =
    user && ["admin", "staff", "pharmacist", "owner"].includes(role);

  const isStaffBlockedRoute =
    isStaff && !STAFF_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Enforce Route Protection
  useEffect(() => {
    if (!loading) {
      if (!isAuthorized) {
        if (customer) {
          router.replace("/overview");
        } else {
          router.replace("/login");
        }
      } else if (isStaffBlockedRoute) {
        router.replace("/staff-dashboard");
      }
    }
  }, [isAuthorized, isStaffBlockedRoute, customer, loading, router]);

  // Render Premium Medical Authenticating Screen during initialization
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-semibold text-sm text-slate-500 animate-pulse">
          Authenticating session...
        </p>
      </div>
    );
  }

  // Prevent flash of private dashboard content before redirection
  if (!isAuthorized || isStaffBlockedRoute) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-w-0",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Navbar />
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
