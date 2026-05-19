"use client";

import { useState, useMemo, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Download,
  DollarSign,
  Loader2,
  Package,
  ShoppingBag,
  Inbox,
  TrendingUp as ProfitIcon,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Truck,
} from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  useReports,
  useChartData,
  useTopSelling,
  useTopProfitable,
  useLedgerYears,
  useDailyLedger,
} from "@/hooks/useReports";

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 text-xs font-mono space-y-2.5">
        <p className="font-extrabold border-b border-slate-800 pb-1 text-slate-300">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-6">
            <span className="text-sky-400 font-bold">REVENUE:</span>
            <span className="font-black">৳{(data.sales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="pl-3 space-y-0.5 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>• Shop Sales:</span>
              <span>৳{(data.shopSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span>• Online Sales:</span>
              <span>৳{(data.onlineSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-rose-400 font-bold">PURCHASES:</span>
          <span className="font-black">৳{(data.purchase || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between gap-6 border-t border-slate-800 pt-1">
          <span className="text-emerald-400 font-bold">NET PROFIT:</span>
          <span className="font-black text-emerald-300">৳{(data.profit || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [range, setRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // TanStack Table states
  const [sorting, setSorting] = useState([]);

  // Dynamic API / React Query hooks
  const { summary, isLoading: isSummaryLoading } = useReports();
  const { charts, isLoading: isChartsLoading } = useChartData(range);
  const { topSelling, isLoading: isTopSellingLoading } = useTopSelling();
  const { topProfitable, isLoading: isTopProfitableLoading } = useTopProfitable();
  const { years, isLoading: isYearsLoading } = useLedgerYears();
  const { ledger, isLoading: isLedgerLoading } = useDailyLedger(selectedYear, selectedMonth);

  // Synchronize dynamic year once loaded
  useEffect(() => {
    if (years && years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0]);
    }
  }, [years, selectedYear]);

  const isLoading = isSummaryLoading || isChartsLoading;

  // Chart data calculations
  const chartData = useMemo(() => {
    return charts?.monthlyData || [];
  }, [charts]);

  const categoryData = useMemo(() => {
    return charts?.categoryData || [];
  }, [charts]);

  const categoryTotal = useMemo(() => {
    return categoryData.reduce((acc, curr) => acc + (curr.value || 0), 0);
  }, [categoryData]);
  // Ledger summation calculations (calculated on the whole dataset to preserve absolute totals)
  const ledgerTotals = useMemo(() => {
    if (!ledger || ledger.length === 0) return { sales: 0, shopSales: 0, onlineSales: 0, purchases: 0, profit: 0, transactions: 0 };
    return ledger.reduce(
      (acc, day) => {
        acc.sales += day.sales || 0;
        acc.shopSales += day.shopSales || 0;
        acc.onlineSales += day.onlineSales || 0;
        acc.purchases += day.purchases || 0;
        acc.profit += day.profit || 0;
        acc.transactions += day.transactions || 0;
        return acc;
      },
      { sales: 0, shopSales: 0, onlineSales: 0, purchases: 0, profit: 0, transactions: 0 }
    );
  }, [ledger]);

  // 1. TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: "day",
        header: "Day / Date",
        cell: (info) => {
          const day = info.getValue();
          return `${String(day).padStart(2, "0")} ${MONTH_NAMES[selectedMonth].substring(0, 3)}`;
        },
      },
      {
        accessorKey: "shopSales",
        header: "Shop Sales (POS)",
        cell: (info) => `৳${(info.getValue() || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
      {
        accessorKey: "onlineSales",
        header: "Online Sales",
        cell: (info) => `৳${(info.getValue() || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
      {
        accessorKey: "sales",
        header: "Total Revenue",
        cell: (info) => `৳${(info.getValue() || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
      {
        accessorKey: "purchases",
        header: "Procurement Expenses",
        cell: (info) => `৳${(info.getValue() || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
      {
        accessorKey: "profit",
        header: "Net Profit",
        cell: (info) => {
          const val = info.getValue() || 0;
          return (
            <span className={val > 0 ? "text-emerald-600 font-bold" : val < 0 ? "text-rose-600 font-bold" : "text-slate-400"}>
              ৳{val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          );
        },
      },
      {
        accessorKey: "transactions",
        header: "Transactions Count",
        cell: (info) => info.getValue() || 0,
      },
    ],
    [selectedMonth]
  );

  // 2. Instantiate TanStack Table
  const table = useReactTable({
    data: ledger || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-medium animate-pulse text-sm">
          Generating analytical reports and auditing ledger...
        </p>
      </div>
    );
  }

  const stats = summary || {
    monthlySales: 0,
    yearlySales: 0,
    totalTransactions: 0,
    totalStockValue: 0,
  };

  const avgOrderValue = stats.totalTransactions > 0 ? (stats.monthlySales / stats.totalTransactions) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time financial sheets, dead stock audits, and transactional ledgers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex">
            <button
              onClick={() => setRange("day")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === "day"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRange("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === "month"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setRange("year")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === "year"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              5 Years
            </button>
          </div>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="gap-2 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50"
          >
            <Download size={14} />
            <span>Print Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Sales Card */}
        <div className="bg-gradient-to-br from-medical-blue-600 to-medical-blue-800 text-white rounded-2xl p-6 shadow-lg shadow-medical-blue-600/10 flex flex-col justify-between group gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-medical-blue-100 text-xs font-bold uppercase tracking-widest">
                Active Monthly Sales
              </p>
              <h3 className="text-3xl font-black font-mono tracking-tight">
                ৳{stats.monthlySales?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <DollarSign size={22} className="text-white" />
            </div>
          </div>
          <div className="border-t border-white/15 pt-3 flex justify-between gap-2 text-[10px] font-bold text-medical-blue-100">
            <div className="space-y-0.5">
              <span className="text-slate-200 block">🏪 Shop POS:</span>
              <span className="text-white font-mono text-xs">৳{(stats.monthlyShopSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-amber-200 block">🌐 Online:</span>
              <span className="text-white font-mono text-xs">৳{(stats.monthlyOnlineSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Stock Valuation Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white rounded-2xl p-6 shadow-lg shadow-indigo-600/10 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">
              Total Stock Valuation
            </p>
            <h3 className="text-3xl font-black font-mono tracking-tight">
              ৳{stats.totalStockValue?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-indigo-200 font-medium pt-1">
              Valued at purchase cost across inventory
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm group-hover:scale-110 transition-transform">
            <Package size={22} className="text-white" />
          </div>
        </div>

        {/* Yearly Sales Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-6 shadow-lg shadow-emerald-600/10 flex flex-col justify-between group gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">
                Active Yearly Sales
              </p>
              <h3 className="text-3xl font-black font-mono tracking-tight">
                ৳{stats.yearlySales?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <DollarSign size={22} className="text-white" />
            </div>
          </div>
          <div className="border-t border-white/15 pt-3 flex justify-between gap-2 text-[10px] font-bold text-emerald-100">
            <div className="space-y-0.5">
              <span className="text-slate-200 block">🏪 Shop POS:</span>
              <span className="text-white font-mono text-xs">৳{(stats.yearlyShopSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-amber-200 block">🌐 Online:</span>
              <span className="text-white font-mono text-xs">৳{(stats.yearlyOnlineSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Avg Order / Delivery Fees Card */}
        <div className="bg-gradient-to-br from-amber-600 to-orange-850 text-white rounded-2xl p-6 shadow-lg shadow-amber-600/10 flex flex-col justify-between group gap-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-amber-100 text-xs font-bold uppercase tracking-widest">
                Avg Transaction Size
              </p>
              <h3 className="text-3xl font-black font-mono tracking-tight">
                ৳{avgOrderValue?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <DollarSign size={22} className="text-white" />
            </div>
          </div>
          <div className="border-t border-white/15 pt-3 flex justify-between gap-2 text-[10px] font-bold text-amber-100">
            <div className="space-y-0.5">
              <span className="text-slate-200 block">💳 Invoices Count:</span>
              <span className="text-white font-mono text-xs">{stats.totalTransactions?.toLocaleString()} tx</span>
            </div>
            <div className="space-y-0.5 text-right">
              <span className="text-slate-200 block">🚚 Delivery Fees:</span>
              <span className="text-white font-mono text-xs">৳{(stats.totalDeliveryCharge || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Composed Cash Flow Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-slate-900 font-extrabold text-base tracking-tight">
                Cash Flow Analytics
              </h3>
              <p className="text-slate-400 text-xs font-medium">
                Sales Revenue vs Procurement Costs vs Net Profits
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500/20 border border-blue-500 rounded-sm inline-block"></span>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-400 rounded-sm inline-block"></span>
                <span>Purchases</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block"></span>
                <span>Net Profit</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis fontSize={11} fontWeight={600} tickLine={false} axisLine={false} stroke="#94a3b8" tickFormatter={(v) => `৳${v}`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Revenue" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                <Bar name="Purchases" dataKey="purchase" fill="#f87171" radius={[4, 4, 0, 0]} barSize={20} opacity={0.8} />
                <Line type="monotone" name="Net Profit" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 3, stroke: "#10b981", strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Doughnut */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-slate-900 font-extrabold text-base tracking-tight">
              Inventory Share
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Medicine category count distribution
            </p>
          </div>
          <div className="h-44 w-full relative flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(v) => [`${v} items`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800 font-mono">{categoryTotal}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Medicines</span>
            </div>
          </div>
          <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-1">
            {categoryData.map((item, index) => {
              const pct = categoryTotal > 0 ? ((item.value / categoryTotal) * 100).toFixed(1) : "0.0";
              return (
                <div key={item.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    ></span>
                    <span className="font-bold text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400">{item.value} items</span>
                    <span className="font-black text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Performance: Top Selling vs Most Profitable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling (by volume) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 p-6 space-y-4">
          <div>
            <h3 className="text-slate-900 font-extrabold text-base tracking-tight flex items-center gap-2">
              <ShoppingBag size={18} className="text-medical-blue-600" />
              <span>Top Selling Medicines</span>
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Top 5 medicines ranked by total unit quantity sold
            </p>
          </div>
          <div className="space-y-4 min-h-[220px]">
            {isTopSellingLoading ? (
              <div className="h-44 w-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : topSelling && topSelling.length > 0 ? (
              topSelling.map((med, index) => {
                const maxQty = topSelling[0]?.quantitySold || 1;
                const pct = (med.quantitySold / maxQty) * 100;
                return (
                  <div key={med.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-black text-slate-900">{med.name}</span>
                        <span className="text-slate-400 font-medium ml-2 text-[10px]">({med.company})</span>
                      </div>
                      <span className="font-bold text-slate-700">{med.quantitySold} units sold</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className="bg-medical-blue-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900 w-16 text-right">
                        ৳{med.totalRevenue?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-44 w-full flex flex-col items-center justify-center text-slate-300 italic text-xs gap-2">
                <Inbox size={28} />
                <span>No sales transaction logs found</span>
              </div>
            )}
          </div>
        </div>

        {/* Most Profitable (by net yield) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-100/50 p-6 space-y-4">
          <div>
            <h3 className="text-slate-900 font-extrabold text-base tracking-tight flex items-center gap-2">
              <ProfitIcon size={18} className="text-emerald-600" />
              <span>Most Profitable Medicines (সবচেয়ে বেশি লাভ)</span>
            </h3>
            <p className="text-slate-400 text-xs font-medium">
              Top 5 medicines ranked by total profit generated
            </p>
          </div>
          <div className="space-y-4 min-h-[220px]">
            {isTopProfitableLoading ? (
              <div className="h-44 w-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
            ) : topProfitable && topProfitable.length > 0 ? (
              topProfitable.map((med, index) => {
                const maxProfit = topProfitable[0]?.totalProfit || 1;
                const pct = (med.totalProfit / maxProfit) * 100;
                return (
                  <div key={med.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-black text-slate-900">{med.name}</span>
                        <span className="text-slate-400 font-medium ml-2 text-[10px]">({med.company})</span>
                      </div>
                      <span className="font-bold text-emerald-600">৳{med.totalProfit?.toLocaleString()} profit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400 w-16 text-right">
                        {med.quantitySold} units
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-44 w-full flex flex-col items-center justify-center text-slate-300 italic text-xs gap-2">
                <Inbox size={28} />
                <span>No sales transaction logs found</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Historical Daily Financial Ledger Section */}
      <Card
        className="shadow-sm shadow-slate-100/50 overflow-hidden border border-slate-100"
        title="Detailed Daily Financial Ledger"
        subtitle="Audited ledger logs of sales, expenses, and profits day-by-day."
      >
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Select Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full sm:w-32 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-bold outline-none focus:border-medical-blue-500 transition-colors shadow-sm"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Select Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full sm:w-40 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-bold outline-none focus:border-medical-blue-500 transition-colors shadow-sm"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>{name}</option>
                ))}
              </select>
            </div>
            
            <div className="hidden sm:block text-slate-400 text-xs font-semibold ml-auto flex items-center gap-1">
              <CalendarCheck size={14} />
              <span>Auditing logs for {MONTH_NAMES[selectedMonth]}, {selectedYear}</span>
            </div>
          </div>

          {/* TanStack Data Table implementation */}
          <div className="space-y-4">
            {/* Daily Table element */}
            <div className="border border-slate-100 rounded-xl overflow-x-auto bg-white">
              <table className="w-full text-xs text-left min-w-[700px] border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 select-none">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-5 py-3.5"
                          style={{ width: header.getSize() }}
                        >
                          <div
                            className={`flex items-center gap-1.5 cursor-pointer hover:text-medical-blue-600 transition-colors ${
                              header.id !== "day" ? "justify-end text-right" : "justify-start text-left"
                            }`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="text-slate-400 shrink-0">
                                {{
                                  asc: <ArrowUp size={12} className="text-medical-blue-600" />,
                                  desc: <ArrowDown size={12} className="text-medical-blue-600" />,
                                }[header.column.getIsSorted()] ?? <ArrowUpDown size={12} />}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {isLedgerLoading ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                        <Loader2 className="animate-spin text-medical-blue-600 inline-block w-6 h-6 mr-2" />
                        Auditing daily journals...
                      </td>
                    </tr>
                  ) : table.getRowModel().rows.length > 0 ? (
                    <>
                      {table.getRowModel().rows.map((row) => {
                        const dayVal = row.original.day;
                        const isFuture = selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth() && dayVal > new Date().getDate();
                        
                        return (
                           <tr
                            key={row.id}
                            className={`hover:bg-slate-50/50 transition-colors ${
                              isFuture ? "opacity-35 bg-slate-50/10 cursor-not-allowed" : ""
                            }`}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td
                                key={cell.id}
                                className={`px-5 py-3 ${
                                  cell.column.id === "day"
                                    ? "font-bold text-slate-800 text-left"
                                    : cell.column.id === "transactions"
                                    ? "text-center font-bold font-mono text-slate-500"
                                    : "text-right font-mono font-bold text-slate-900"
                                }`}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      
                      {/* Grand Ledger Totals Row */}
                      <tr className="bg-slate-950 text-white font-extrabold border-t-2 border-slate-950">
                        <td className="px-5 py-4 font-black uppercase tracking-wider text-left">Ledger Totals</td>
                        <td className="px-5 py-4 text-right font-mono text-xs text-sky-300">
                          ৳{ledgerTotals.shopSales?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-xs text-amber-300">
                          ৳{ledgerTotals.onlineSales?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-sm tracking-tight text-sky-400">
                          ৳{ledgerTotals.sales?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-sm tracking-tight text-rose-300">
                          ৳{ledgerTotals.purchases?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-sm tracking-tight text-emerald-400">
                          ৳{ledgerTotals.profit?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-4 text-center font-mono text-slate-300">{ledgerTotals.transactions} tx</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic">
                        No accounting logs found matching search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls footer */}
            {table.getPageCount() > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">
                <div className="text-xs text-slate-500 font-bold">
                  Page <span className="text-slate-950 font-black">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                  <span className="text-slate-950 font-black">{table.getPageCount()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-medical-blue-50 hover:text-medical-blue-600 hover:border-medical-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {table.getPageOptions().map((pageIdx) => (
                    <button
                      key={pageIdx}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                        table.getState().pagination.pageIndex === pageIdx
                          ? "bg-medical-blue-600 text-white shadow-md shadow-medical-blue-600/20"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={() => table.setPageIndex(pageIdx)}
                    >
                      {pageIdx + 1}
                    </button>
                  ))}
                  <button
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-medical-blue-50 hover:text-medical-blue-600 hover:border-medical-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
