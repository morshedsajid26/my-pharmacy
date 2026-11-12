"use client";

import Link from "next/link";
import {
  ShoppingBag,
  CreditCard,
  Clock,
  FileText,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCustomerOverview } from "@/hooks/useCustomerPortal";

const StatCard = ({
  title,
  value,
  icon: Icon,
  accentClass = "bg-medical-blue-50 text-medical-blue-600 border-medical-blue-100",
}) => (
  <div className="bg-white rounded-xl p-5 border border-slate-200/85 hover:border-slate-300 transition-colors flex flex-col justify-between gap-4">
    <div className="flex justify-between items-center">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <div
        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${accentClass}`}
      >
        <Icon size={18} />
      </div>
    </div>
    <div>
      <h3 className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

export default function CustomerDashboardOverviewPage() {
  const { customer, loading: authLoading } = useAuth();
  const { stats, isLoading: isStatsLoading } = useCustomerOverview();

  const loading = authLoading || isStatsLoading;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-medical-blue-600" />
        <p className="font-medium text-sm">Loading patient portal...</p>
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      accentClass:
        "bg-medical-blue-50 text-medical-blue-600 border-medical-blue-100",
    },
    {
      title: "Total Spent",
      value: `৳${stats.totalSpent}`,
      icon: CreditCard,
      accentClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      accentClass: "bg-amber-50 text-amber-700 border-amber-200/70",
    },
    {
      title: "Prescriptions",
      value: stats.totalPrescriptions,
      icon: FileText,
      accentClass: "bg-slate-100 text-slate-700 border-slate-200/80",
    },
  ];

  const actionItems = [
    {
      title: "Order History & Tracking",
      description:
        "Monitor active deliveries and view itemized receipts from previous purchases.",
      href: "/orders",
      icon: ShoppingBag,
      badge: "Orders",
    },
    {
      title: "Upload Prescription",
      description:
        "Submit a photo of your prescription for direct verification by our licensed pharmacist.",
      href: "/prescriptions",
      icon: FileText,
      badge: "Clinical Desk",
    },
  ];

  return (
    <div className="mx-auto w-full space-y-6">
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {customer?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your prescriptions, medicine refills, and delivery history
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-medical-blue-600 hover:bg-medical-blue-700 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <span>Order Medicines</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {actionItems.map((action) => {
          const ActionIcon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="bg-white rounded-xl p-6 border border-slate-200/85 hover:border-medical-blue-600/50 hover:shadow-sm transition-all group flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-medical-blue-50 border border-medical-blue-100 text-medical-blue-600 flex items-center justify-center group-hover:bg-medical-blue-600 group-hover:text-white transition-colors">
                  <ActionIcon size={20} />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-medical-blue-600 transition-colors">
                  <span>{action.badge}</span>
                  <ArrowUpRight size={14} />
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 group-hover:text-medical-blue-700 transition-colors">
                  {action.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
