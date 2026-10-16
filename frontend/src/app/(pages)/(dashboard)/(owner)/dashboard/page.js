"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Truck,
  BarChart3,
  Package,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useReports, useChartData } from "@/hooks/useReports";
import { DashboardCharts } from "@/components/DashboardCharts";

const SummaryCard = ({
  title,
  value,
  icon: IconComponent,
  trend,
  trendValue,
  gradientFrom,
  gradientTo,
  iconColor,
  isCurrency = true,
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/50 hover:translate-y-[-4px] transition-all duration-300 group flex items-center justify-between">
    <div className="space-y-2">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
        {isCurrency
          ? `৳${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : Number(value || 0).toLocaleString()}
      </h3>
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}
        >
          <div
            className={`p-0.5 rounded-full ${trend === "up" ? "bg-emerald-50" : "bg-rose-50"}`}
          >
            {trend === "up" ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
          </div>
          <span>{trendValue}% from last month</span>
        </div>
      )}
    </div>
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradientFrom} ${gradientTo} flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
    >
      <IconComponent size={22} className={iconColor || "text-white"} />
    </div>
  </div>
);

export default function DashboardPage() {
  const [range, setRange] = useState("month");
  const { summary, isLoading: isSummaryLoading } = useReports();
  const { charts, isLoading: isChartLoading } = useChartData(range);

  const isLoading = isSummaryLoading || isChartLoading;

  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-medium animate-pulse">
          Loading dashboard statistics...
        </p>
      </div>
    );
  }

  // Fallback if data is not yet available
  const stats = summary || {
    todaySales: 0,
    todayPurchase: 0,
    todayProfit: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    stockOutCount: 0,
  };

  const salesData = charts?.monthlyData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Today Total Sales"
          value={stats.todaySales}
          icon={ShoppingCart}
          gradientFrom="from-sky-400"
          gradientTo="to-medical-blue-600"
        />
        <SummaryCard
          title="Today Purchase"
          value={stats.todayPurchase}
          icon={Truck}
          gradientFrom="from-rose-400"
          gradientTo="to-pink-600"
        />
        <SummaryCard
          title="Today Net Profit"
          value={stats.todayProfit}
          icon={BarChart3}
          gradientFrom="from-emerald-400"
          gradientTo="to-teal-600"
        />
        <SummaryCard
          title="Total Stock Value"
          value={stats.totalStockValue}
          icon={Package}
          gradientFrom="from-indigo-500"
          gradientTo="to-purple-600"
        />
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-amber-50 to-orange-50/20 border border-amber-100/70 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <AlertTriangle className="text-white w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Low Stock Medicines
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Needs restocking soon
              </p>
            </div>
          </div>
          <span className="text-3xl font-black text-amber-700 bg-white border border-amber-100 px-4 py-1.5 rounded-2xl shadow-sm">
            {stats.lowStockCount}
          </span>
        </div>

        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-rose-50 to-red-50/20 border border-rose-100/70 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <XCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Stock Out Medicines
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                Critical: zero items left
              </p>
            </div>
          </div>
          <span className="text-3xl font-black text-rose-700 bg-white border border-rose-100 px-4 py-1.5 rounded-2xl shadow-sm">
            {stats.stockOutCount}
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <DashboardCharts
        salesData={salesData}
        activeRange={range}
        onRangeChange={setRange}
      />
    </div>
  );
}
