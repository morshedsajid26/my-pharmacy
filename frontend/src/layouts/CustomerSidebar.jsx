"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  FileText,
  Plus,
  X,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useUI } from "../context/UIContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/overview" },
  { icon: ShoppingBag, label: "Order History", path: "/orders" },
  {
    icon: FileText,
    label: "Prescriptions",
    path: "/prescriptions",
  },
  { icon: User, label: "Account Profile", path: "/profile" },
];

export function CustomerSidebar({ customer }) {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
  } = useUI();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden transition-opacity duration-200",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Content - Clean Production Light Surface */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 text-slate-600 transition-all duration-300 z-50 flex flex-col lg:translate-x-0",
          isSidebarCollapsed ? "w-20" : "w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between overflow-hidden shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-medical-blue-600 flex items-center justify-center shrink-0">
              <Plus className="text-white w-4 h-4 stroke-[2.75]" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-bold text-[15px] text-slate-900 tracking-tight whitespace-nowrap">
                  S&amp;S <span className="text-medical-blue-600">Pharmacy</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Customer Portal
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center py-2.5 rounded-lg transition-colors duration-150 group relative",
                  isSidebarCollapsed ? "justify-center" : "gap-3 px-3",
                  isActive
                    ? "bg-medical-blue-50 text-medical-blue-700 font-semibold border border-medical-blue-200/70"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium border border-transparent"
                )}
              >
                <item.icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-colors",
                    isActive
                      ? "text-medical-blue-600"
                      : "text-slate-400 group-hover:text-slate-700"
                  )}
                />
                {!isSidebarCollapsed && (
                  <span className="text-[13px] whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Status */}
        <div className="p-3.5 mt-auto border-t border-slate-200 bg-slate-50/60 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-medical-blue-600 shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
              {customer?.name?.charAt(0).toUpperCase() || "C"}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {customer?.name || "Customer"}
                </p>
                <span className="text-[10px] font-medium text-slate-500 block mt-0.5">
                  Customer Account
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
