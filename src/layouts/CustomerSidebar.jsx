"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, FileText, ChevronLeft, ChevronRight, PlusCircle, X, LayoutDashboard } from "lucide-react";
import { cn } from "../utils/cn";
import { useUI } from "../context/UIContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard Overview", path: "/profile/overview" },
  { icon: ShoppingBag, label: "My Orders History", path: "/profile/orders" },
  { icon: FileText, label: "Prescription Orders", path: "/profile/prescriptions" },
  { icon: User, label: "Personal Details", path: "/profile" },
];

export function CustomerSidebar({ customer }) {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isSidebarCollapsed,
    toggleCollapse,
  } = useUI();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 transition-all duration-300 z-50 flex flex-col pt-4 shadow-xl lg:translate-x-0",
          isSidebarCollapsed ? "w-20" : "w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="px-6 flex items-center justify-between mb-8 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-medical-blue-500 flex items-center justify-center shrink-0">
              <PlusCircle className="text-white w-5 h-5" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-black text-[16px] text-white tracking-tight whitespace-nowrap">
                S&S <span className="text-medical-blue-400">PHARMACY</span>
              </span>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            className="lg:hidden p-1 hover:bg-slate-800 rounded-lg"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-medical-blue-600 text-white shadow-lg shadow-medical-blue-900/20"
                    : "hover:bg-slate-800 hover:text-white",
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-transform duration-200 group-hover:scale-110",
                  )}
                />
                {!isSidebarCollapsed && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed state */}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-medical-blue-600 text-white rounded-full items-center justify-center shadow-lg hover:bg-medical-blue-700 transition-colors z-[60]"
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </button>

        {/* Footer / User Status */}
        <div className="p-4 mt-auto border-t border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-medical-blue-600 flex-shrink-0 border border-slate-700 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                {customer?.name?.charAt(0).toUpperCase() || "C"}
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {customer?.name || "Customer"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Customer Profile
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
