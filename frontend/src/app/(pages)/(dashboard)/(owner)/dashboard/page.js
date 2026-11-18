"use client";

import { useState } from "react";
import Link from "next/link";
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
  ArrowUpRight,
} from "lucide-react";
import { useReports, useChartData } from "@/hooks/useReports";
import { DashboardCharts } from "@/components/DashboardCharts";

const SummaryCard = ({
  title,
  subtitle,
  value,
  icon: IconComponent,
  trend,
  trendValue,
  accentClass = "bg-medical-blue-50 text-medical-blue-600 border-medical-blue-100",
  isCurrency = true,
}) => (
  <div className="bg-white rounded-xl border border-slate-200/85 p-5 hover:border-slate-300 transition-colors flex flex-col justify-between gap-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      <div
        className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${accentClass}`}
      >
        <IconComponent size={18} />
      </div>
    </div>

    <div>
      <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
        {isCurrency
          ? `৳${Number(value || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : Number(value || 0).toLocaleString()}
      </h3>
      {subtitle && (
        <p className="text-[11px] text-slate-400 font-medium mt-1">
          {subtitle}
        </p>
      )}
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-semibold mt-1.5 ${
            trend === "up" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}
          <span>{trendValue}% from last month</span>
        </div>
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const [range, setRange] = useState("day");
  const { summary, isLoading: isSummaryLoading } = useReports();
  const { charts, isLoading: isChartLoading } = useChartData(range);

  const isLoading = isSummaryLoading || isChartLoading;

  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
        <p className="text-sm font-medium text-slate-500">
          Loading dispensary analytics...
        </p>
      </div>
    );
  }

  const stats = summary || {
    todaySales: 0,
    todayPurchase: 0,
    todayProfit: 0,
    monthlySales: 0,
    monthlyPurchase: 0,
    monthlyProfit: 0,
    yearlySales: 0,
    yearlyPurchase: 0,
    yearlyProfit: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    stockOutCount: 0,
  };

  const salesData = charts?.monthlyData || [];

  const getPeriodStats = () => {
    if (range === "day") {
      return {
        salesTitle: "Today Total Sales",
        salesSubtitle: "POS & online fulfilled today",
        salesValue: stats.todaySales ?? 0,
        purchaseTitle: "Today Purchase",
        purchaseSubtitle: "Inventory procurement today",
        purchaseValue: stats.todayPurchase ?? 0,
        profitTitle: "Today Net Profit",
        profitSubtitle: "Realized net margin today",
        profitValue: stats.todayProfit ?? 0,
      };
    }
    if (range === "year") {
      return {
        salesTitle: "Yearly Total Sales",
        salesSubtitle: "POS & online fulfilled this year",
        salesValue:
          stats.yearlySales ??
          (salesData?.reduce((acc, curr) => acc + (curr.sales || 0), 0) || 0),
        purchaseTitle: "Yearly Purchase",
        purchaseSubtitle: "Inventory procurement this year",
        purchaseValue:
          stats.yearlyPurchase ??
          (salesData?.reduce((acc, curr) => acc + (curr.purchase || 0), 0) || 0),
        profitTitle: "Yearly Net Profit",
        profitSubtitle: "Realized net margin this year",
        profitValue:
          stats.yearlyProfit ??
          (salesData?.reduce((acc, curr) => acc + (curr.profit || 0), 0) || 0),
      };
    }
    // Default: 'month'
    return {
      salesTitle: "Monthly Total Sales",
      salesSubtitle: "POS & online fulfilled this month",
      salesValue:
        stats.monthlySales ??
        (salesData?.reduce((acc, curr) => acc + (curr.sales || 0), 0) || 0),
      purchaseTitle: "Monthly Purchase",
      purchaseSubtitle: "Inventory procurement this month",
      purchaseValue:
        stats.monthlyPurchase ??
        (salesData?.reduce((acc, curr) => acc + (curr.purchase || 0), 0) || 0),
      profitTitle: "Monthly Net Profit",
      profitSubtitle: "Realized net margin this month",
      profitValue:
        stats.monthlyProfit ??
        (salesData?.reduce((acc, curr) => acc + (curr.profit || 0), 0) || 0),
    };
  };

  const periodStats = getPeriodStats();

  const summaryItems = [
    {
      title: periodStats.salesTitle,
      subtitle: periodStats.salesSubtitle,
      value: periodStats.salesValue,
      icon: ShoppingCart,
      accentClass:
        "bg-medical-blue-50 text-medical-blue-600 border-medical-blue-100",
    },
    {
      title: periodStats.purchaseTitle,
      subtitle: periodStats.purchaseSubtitle,
      value: periodStats.purchaseValue,
      icon: Truck,
      accentClass: "bg-slate-100 text-slate-700 border-slate-200/80",
    },
    {
      title: periodStats.profitTitle,
      subtitle: periodStats.profitSubtitle,
      value: periodStats.profitValue,
      icon: BarChart3,
      accentClass: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    },
    {
      title: "Total Stock Value",
      subtitle: "Current active inventory valuation",
      value: stats.totalStockValue,
      icon: Package,
      accentClass:
        "bg-medical-blue-50 text-medical-blue-700 border-medical-blue-100",
    },
  ];

  const alertItems = [
    {
      title: "Low Stock Medicines",
      subtitle: "Items below minimum threshold requiring restock",
      count: stats.lowStockCount,
      icon: AlertTriangle,
      href: "/low-stock",
      borderClass: "border-l-4 border-l-amber-500 border-slate-200/85",
      iconClass: "bg-amber-50 text-amber-600 border-amber-200/70",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Stock Out Medicines",
      subtitle: "Critical: zero units remaining in dispensary",
      count: stats.stockOutCount,
      icon: XCircle,
      href: "/low-stock",
      borderClass: "border-l-4 border-l-rose-500 border-slate-200/85",
      iconClass: "bg-rose-50 text-rose-600 border-rose-200/70",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dispensary Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time financial metrics, stock valuation, and inventory alerts
          </p>
        </div>

        {/* Range Selector Header Tabs */}
        <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/70 p-1 rounded-xl self-start sm:self-auto shadow-2xs">
          {[
            { id: "day", label: "Daily" },
            { id: "month", label: "Monthly" },
            { id: "year", label: "Yearly" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                range === r.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards (Mapped) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryItems.map((item) => (
          <SummaryCard key={item.title} {...item} />
        ))}
      </div>

      {/* Operational Inventory Alerts (Mapped) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertItems.map((alert) => {
          const AlertIcon = alert.icon;
          return (
            <Link
              key={alert.title}
              href={alert.href}
              className={`flex items-center justify-between p-5 bg-white border rounded-xl hover:bg-slate-50/60 transition-colors group ${alert.borderClass}`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${alert.iconClass}`}
                >
                  <AlertIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-medical-blue-700 transition-colors">
                    {alert.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {alert.subtitle}
                  </p>
                </div>
              </div>
              <span
                className={`text-xl font-bold font-mono border px-3.5 py-1 rounded-lg ${alert.badgeClass}`}
              >
                {alert.count}
              </span>
            </Link>
          );
        })}
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
