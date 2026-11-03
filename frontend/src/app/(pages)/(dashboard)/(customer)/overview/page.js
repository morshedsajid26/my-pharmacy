"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CreditCard,
  Clock,
  FileText,
  Loader2,
  TrendingUp,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCustomerOverview } from "@/hooks/useCustomerPortal";

const StatCard = ({
  title,
  value,
  icon: Icon,
  bg,
  text,
  trendHover,
  showTrend,
}) => (
  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all h-36">
    <div className="flex justify-between items-start">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${bg} ${text}`}
      >
        <Icon size={24} />
      </div>
      {showTrend && (
        <TrendingUp
          size={20}
          className={`text-slate-300 ${trendHover || ""} transition-colors`}
        />
      )}
    </div>
    <div>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
        {title}
      </p>
    </div>
  </div>
);

export default function CustomerDashboardOverviewPage() {
  const router = useRouter();
  const { customer, loading: authLoading } = useAuth();
  const { stats, isLoading: isStatsLoading } = useCustomerOverview();

  const loading = authLoading || isStatsLoading;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-medical-blue-600" />
        <p className="font-semibold text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      bg: "bg-blue-50",
      text: "text-blue-600",
      trendHover: "group-hover:text-blue-300",
      showTrend: true,
    },
    {
      title: "Total Spent",
      value: `৳${stats.totalSpent}`,
      icon: CreditCard,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      trendHover: "group-hover:text-emerald-300",
      showTrend: true,
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      title: "Prescriptions",
      value: stats.totalPrescriptions,
      icon: FileText,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  return (
    <div className="mx-auto w-full">
      <Toaster position="top-center" />

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {customer?.name}! 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here is an overview of your activity and recent stats.
        </p>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statItems.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link
          href="/orders"
          className="bg-medical-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-medical-blue-900/20 group hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">View Orders</h2>
          <p className="text-medical-blue-100 text-sm font-medium">
            Track your pending shipments and view full receipt details of past
            purchases.
          </p>
        </Link>

        <Link
          href="/prescriptions"
          className="bg-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-purple-900/20 group hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Upload Prescription</h2>
          <p className="text-purple-100 text-sm font-medium">
            Upload a valid prescription and our pharmacists will process your
            medicine quickly.
          </p>
        </Link>
      </div>
    </div>
  );
}
