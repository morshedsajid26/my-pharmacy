"use client";

import React, { useState, useMemo } from "react";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Truck,
  Receipt,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Clock,
  Filter,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { useCashSummary, useCashMutations } from "@/hooks/useCashManagement";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EXPENSE_CATEGORIES = [
  "Tea & Snacks",
  "Utilities & Electricity",
  "Polythene & Packaging",
  "Transportation & Delivery",
  "Staff Salary & Advance",
  "Shop Rent",
  "Supplier Cash Payment",
  "Maintenance & Cleaning",
  "General & Miscellaneous",
];

const toDateStr = (d = new Date()) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function CashManagementPage() {
  const todayStr = useMemo(() => toDateStr(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonth = useMemo(() => new Date().getMonth(), []);

  // Timeframe state
  const [timeframe, setTimeframe] = useState("day"); // 'day', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Filter state for daily transactions table
  const [txFilter, setTxFilter] = useState("ALL"); // 'ALL', 'SALE', 'PURCHASE', 'EXPENSE', 'ADJUSTMENT'

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isOpenRegisterModalOpen, setIsOpenRegisterModalOpen] = useState(false);
  const [isCloseRegisterModalOpen, setIsCloseRegisterModalOpen] = useState(false);

  // Forms state
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "Tea & Snacks",
    amount: "",
    note: "",
    paymentMethod: "CASH",
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    type: "CASH_IN",
    amount: "",
    reason: "",
  });

  const [openRegisterForm, setOpenRegisterForm] = useState({
    openingBalance: "",
    note: "",
  });

  const [closeRegisterForm, setCloseRegisterForm] = useState({
    closingBalance: "",
    note: "",
  });

  // Data fetching via TanStack Query
  const {
    summary = {},
    register = null,
    transactions = [],
    dailyLedger = [],
    monthlyLedger = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCashSummary({
    timeframe,
    date: selectedDate,
    year: selectedYear,
    month: selectedMonth,
  });

  // Mutations
  const {
    openRegister,
    isOpeningRegister,
    closeRegister,
    isClosingRegister,
    addExpense,
    isAddingExpense,
    deleteExpense,
    isDeletingExpense,
    addAdjustment,
    isAddingAdjustment,
  } = useCashMutations();

  // Handlers
  const handleOpenRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!openRegisterForm.openingBalance) return;
    await openRegister({
      dateStr: selectedDate,
      openingBalance: parseFloat(openRegisterForm.openingBalance),
      note: openRegisterForm.note,
    });
    setIsOpenRegisterModalOpen(false);
    setOpenRegisterForm({ openingBalance: "", note: "" });
  };

  const handleCloseRegisterSubmit = async (e) => {
    e.preventDefault();
    if (closeRegisterForm.closingBalance === "") return;
    await closeRegister({
      dateStr: selectedDate,
      closingBalance: parseFloat(closeRegisterForm.closingBalance),
      note: closeRegisterForm.note,
    });
    setIsCloseRegisterModalOpen(false);
    setCloseRegisterForm({ closingBalance: "", note: "" });
  };

  const handleAddExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;
    await addExpense({
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      date: new Date(selectedDate + "T12:00:00"),
    });
    setIsExpenseModalOpen(false);
    setExpenseForm({
      title: "",
      category: "Tea & Snacks",
      amount: "",
      note: "",
      paymentMethod: "CASH",
    });
  };

  const handleAddAdjustmentSubmit = async (e) => {
    e.preventDefault();
    if (!adjustmentForm.amount || !adjustmentForm.reason) return;
    await addAdjustment({
      ...adjustmentForm,
      amount: parseFloat(adjustmentForm.amount),
      date: new Date(selectedDate + "T12:00:00"),
    });
    setIsAdjustmentModalOpen(false);
    setAdjustmentForm({
      type: "CASH_IN",
      amount: "",
      reason: "",
    });
  };

  const handleDeleteExpense = async (id) => {
    if (confirm("Are you sure you want to delete this expense entry?")) {
      await deleteExpense(id);
    }
  };

  // Filtered transactions for Daily view
  const filteredTransactions = useMemo(() => {
    if (txFilter === "ALL") return transactions;
    if (txFilter === "ADJUSTMENT") {
      return transactions.filter((t) => t.type === "CASH_IN" || t.type === "CASH_OUT");
    }
    return transactions.filter((t) => t.type === txFilter);
  }, [transactions, txFilter]);

  // Years options for selector
  const yearsList = useMemo(() => {
    const list = [];
    for (let y = currentYear; y >= currentYear - 4; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // TanStack Table Heads: Daily View
  const dailyTableHeads = useMemo(
    () => [
      {
        key: "date",
        Title: "Time",
        align: "left",
        width: 100,
        render: (row) => {
          const dateObj = new Date(row.date);
          return (
            <span className="font-mono text-slate-500 whitespace-nowrap">
              {dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          );
        },
      },
      {
        key: "type",
        Title: "Activity Type",
        align: "left",
        width: 130,
        render: (row) => (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
              row.type === "SALE"
                ? "bg-teal-50 text-teal-700 border border-teal-200/60"
                : row.type === "PURCHASE"
                ? "bg-slate-100 text-slate-700 border border-slate-200"
                : row.type === "EXPENSE"
                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            }`}
          >
            {row.type}
          </span>
        ),
      },
      {
        key: "title",
        Title: "Description / Title",
        align: "left",
        minWidth: 240,
        className: "font-bold text-slate-900 whitespace-nowrap",
      },
      {
        key: "party",
        Title: "Party / Reason",
        align: "left",
        width: 160,
        className: "text-slate-600 whitespace-nowrap",
        render: (row) => (
          <span className="truncate max-w-[150px] inline-block" title={row.party || row.category || "-"}>
            {row.party || row.category || "-"}
          </span>
        ),
      },
      {
        key: "cashIn",
        Title: "Cash In (+)",
        align: "right",
        width: 135,
        render: (row) =>
          row.flow === "IN" ? (
            <span className="font-mono font-bold text-emerald-600 whitespace-nowrap">
              +৳{Number(row.amount || 0).toFixed(2)}
            </span>
          ) : (
            <span className="text-slate-400 font-mono">-</span>
          ),
      },
      {
        key: "cashOut",
        Title: "Cash Out (-)",
        align: "right",
        width: 135,
        render: (row) =>
          row.flow !== "IN" ? (
            <span className="font-mono font-bold text-rose-600 whitespace-nowrap">
              -৳{Number(row.amount || 0).toFixed(2)}
            </span>
          ) : (
            <span className="text-slate-400 font-mono">-</span>
          ),
      },
      {
        key: "profit",
        Title: "Profit / Net",
        align: "right",
        width: 135,
        render: (row) => {
          if (row.profit !== undefined) {
            return (
              <span className="font-mono font-bold text-emerald-700 whitespace-nowrap">
                +৳{Number(row.profit).toFixed(2)}
              </span>
            );
          }
          if (row.type === "EXPENSE") {
            return (
              <span className="font-mono font-bold text-rose-600 whitespace-nowrap">
                -৳{Number(row.amount).toFixed(2)}
              </span>
            );
          }
          return <span className="text-slate-400 font-mono">-</span>;
        },
      },
    ],
    []
  );

  // TanStack Table Heads: Monthly View
  const monthlyTableHeads = useMemo(
    () => [
      {
        key: "day",
        Title: "Day / Date",
        align: "left",
        width: 110,
        render: (row) => (
          <span className="font-bold text-slate-900 font-mono whitespace-nowrap">
            {row.day} {MONTH_NAMES[selectedMonth]?.slice(0, 3)}
          </span>
        ),
      },
      {
        key: "shopSales",
        Title: "Shop Sales",
        align: "right",
        width: 120,
        render: (row) => (
          <span className="font-mono whitespace-nowrap">৳{Number(row.shopSales || 0).toFixed(2)}</span>
        ),
      },
      {
        key: "onlineSales",
        Title: "Online Sales",
        align: "right",
        width: 120,
        render: (row) => (
          <span className="font-mono whitespace-nowrap">৳{Number(row.onlineSales || 0).toFixed(2)}</span>
        ),
      },
      {
        key: "sales",
        Title: "Total Revenue",
        align: "right",
        width: 130,
        render: (row) => (
          <span className="font-mono font-bold text-teal-700 whitespace-nowrap">
            ৳{Number(row.sales || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "purchases",
        Title: "Purchases (Cost)",
        align: "right",
        width: 130,
        render: (row) => (
          <span className="font-mono text-slate-700 whitespace-nowrap">
            ৳{Number(row.purchases || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "expenses",
        Title: "Store Expenses",
        align: "right",
        width: 130,
        render: (row) => (
          <span className="font-mono text-rose-600 font-bold whitespace-nowrap">
            ৳{Number(row.expenses || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "grossProfit",
        Title: "Gross Profit",
        align: "right",
        width: 130,
        render: (row) => (
          <span className="font-mono font-bold text-slate-800 whitespace-nowrap">
            ৳{Number(row.grossProfit || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "netProfit",
        Title: "Real Net Profit",
        align: "right",
        width: 130,
        render: (row) => (
          <span
            className={`font-mono font-bold whitespace-nowrap ${
              row.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            ৳{Number(row.netProfit || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "transactions",
        Title: "Tx Count",
        align: "center",
        width: 90,
        render: (row) => (
          <span className="font-mono text-slate-400 whitespace-nowrap">{row.transactions}</span>
        ),
      },
    ],
    [selectedMonth]
  );

  // Grand Totals Footer for Monthly View
  const monthlyFooter = useMemo(
    () => (
      <tr className="bg-slate-950 text-white font-extrabold border-t-2 border-slate-950">
        <td className="py-3.5 px-4 uppercase font-black tracking-wider text-left text-white">
          Month Grand Totals
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300">
          ৳{dailyLedger.reduce((sum, d) => sum + (d.shopSales || 0), 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300">
          ৳{dailyLedger.reduce((sum, d) => sum + (d.onlineSales || 0), 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-teal-300">
          ৳{Number(summary.totalSales || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-slate-200">
          ৳{Number(summary.totalPurchases || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-rose-300">
          ৳{Number(summary.totalExpenses || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-slate-100">
          ৳{Number(summary.totalGrossProfit || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-emerald-300">
          ৳{Number(summary.totalNetProfit || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
          {dailyLedger.reduce((sum, d) => sum + (d.transactions || 0), 0)} tx
        </td>
      </tr>
    ),
    [dailyLedger, summary]
  );

  // TanStack Table Heads: Yearly View
  const yearlyTableHeads = useMemo(
    () => [
      {
        key: "monthName",
        Title: "Month",
        align: "left",
        width: 120,
        className: "font-bold text-slate-900 whitespace-nowrap",
      },
      {
        key: "sales",
        Title: "Total Revenue",
        align: "right",
        width: 140,
        render: (row) => (
          <span className="font-mono font-bold text-teal-700 whitespace-nowrap">
            ৳{Number(row.sales || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "purchases",
        Title: "Procurement Cost",
        align: "right",
        width: 140,
        render: (row) => (
          <span className="font-mono text-slate-700 whitespace-nowrap">
            ৳{Number(row.purchases || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "expenses",
        Title: "Store Expenses",
        align: "right",
        width: 140,
        render: (row) => (
          <span className="font-mono text-rose-600 font-bold whitespace-nowrap">
            ৳{Number(row.expenses || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "grossProfit",
        Title: "Gross Profit",
        align: "right",
        width: 140,
        render: (row) => (
          <span className="font-mono font-bold text-slate-800 whitespace-nowrap">
            ৳{Number(row.grossProfit || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: "margin",
        Title: "Net Profit Margin",
        align: "right",
        width: 130,
        render: (row) => (
          <span className="font-mono text-slate-500 whitespace-nowrap">
            {row.sales > 0 ? ((row.netProfit / row.sales) * 100).toFixed(1) : "0.0"}%
          </span>
        ),
      },
      {
        key: "netProfit",
        Title: "Real Net Profit",
        align: "right",
        width: 140,
        render: (row) => (
          <span
            className={`font-mono font-bold whitespace-nowrap ${
              row.netProfit >= 0 ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            ৳{Number(row.netProfit || 0).toFixed(2)}
          </span>
        ),
      },
    ],
    []
  );

  // Grand Totals Footer for Yearly View
  const yearlyFooter = useMemo(
    () => (
      <tr className="bg-slate-950 text-white font-extrabold border-t-2 border-slate-950">
        <td className="py-3.5 px-4 uppercase font-black tracking-wider text-left text-white">
          Annual Grand Totals
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-teal-300">
          ৳{Number(summary.totalSales || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-slate-200">
          ৳{Number(summary.totalPurchases || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-rose-300">
          ৳{Number(summary.totalExpenses || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-slate-100">
          ৳{Number(summary.totalGrossProfit || 0).toFixed(2)}
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-400">
          {summary.totalSales > 0
            ? ((summary.totalNetProfit / summary.totalSales) * 100).toFixed(1)
            : "0.0"}
          %
        </td>
        <td className="py-3.5 px-4 text-right font-mono text-sm tracking-tight text-emerald-300">
          ৳{Number(summary.totalNetProfit || 0).toFixed(2)}
        </td>
      </tr>
    ),
    [summary]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-700 shadow-2xs">
              <Wallet size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Cash Management & Ledger
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time cash in hand, store expenses, sales revenue, procurement outlay, and net profits
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            variant="outline"
            className="gap-2 text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <Plus size={14} className="text-rose-600" />
            <span>Add Expense</span>
          </Button>

          <Button
            onClick={() => setIsAdjustmentModalOpen(true)}
            variant="outline"
            className="gap-2 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <ArrowUpRight size={14} className="text-slate-500" />
            <span>Cash In / Out</span>
          </Button>

          {timeframe === "day" && (
            <Button
              onClick={() => {
                if (register?.status === "CLOSED") {
                  setIsCloseRegisterModalOpen(true);
                } else {
                  setIsCloseRegisterModalOpen(true);
                }
              }}
              className="gap-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
            >
              <Lock size={14} />
              <span>{register?.status === "CLOSED" ? "Re-Check Closing" : "Close Register"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar: Timeframe Selector & Date/Period Filter */}
      <div className="bg-white rounded-2xl border border-slate-200/85 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        {/* Timeframe Pills */}
        <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: "day", label: "Daily" },
            { id: "month", label: "Monthly" },
            { id: "year", label: "Yearly" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === t.id
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Date / Month / Year Picker */}
        <div className="flex flex-wrap items-center gap-3">
          {timeframe === "day" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold outline-none focus:border-teal-600 focus:bg-white transition-colors"
              />
              {selectedDate !== todayStr && (
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className="px-2.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                >
                  Today
                </button>
              )}
            </div>
          )}

          {timeframe === "month" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold outline-none focus:border-teal-600 focus:bg-white transition-colors"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold outline-none focus:border-teal-600 focus:bg-white transition-colors"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {timeframe === "year" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold outline-none focus:border-teal-600 focus:bg-white transition-colors"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => refetch()}
            title="Refresh data"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-teal-600" : ""} />
          </button>
        </div>
      </div>

      {/* Top Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Cash in Hand / Net Cash Flow */}
        <div className="bg-white rounded-xl border border-slate-200/85 p-5 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === "day" ? "Cash in Hand (Drawer)" : "Net Cash Inflow"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-700 shrink-0">
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              ৳
              {Number(
                timeframe === "day"
                  ? summary.expectedCashInDrawer || 0
                  : (summary.totalSales || 0) - (summary.totalExpenses || 0)
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              {timeframe === "day" ? (
                register?.status === "CLOSED" ? (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Lock size={11} className="text-amber-600" /> Closed (Counted: ৳
                    {Number(register?.closingBalance || 0).toFixed(2)})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <Unlock size={11} /> Register Active / Open
                  </span>
                )
              ) : (
                `Sales - Store Expenses`
              )}
            </p>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-white rounded-xl border border-slate-200/85 p-5 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === "day"
                ? "Today Total Sales"
                : timeframe === "month"
                ? "Monthly Sales"
                : "Yearly Sales"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-700 shrink-0">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              ৳
              {Number(summary.totalSales || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              POS & Online fulfilled revenue
            </p>
          </div>
        </div>

        {/* Card 3: Total Purchases */}
        <div className="bg-white rounded-xl border border-slate-200/85 p-5 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === "day"
                ? "Purchases (Stock)"
                : timeframe === "month"
                ? "Monthly Purchases"
                : "Yearly Purchases"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Truck size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              ৳
              {Number(summary.totalPurchases || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Medicine supplier procurement
            </p>
          </div>
        </div>

        {/* Card 4: Daily / Store Expenses */}
        <div className="bg-white rounded-xl border border-slate-200/85 p-5 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === "day"
                ? "Today Expenses"
                : timeframe === "month"
                ? "Monthly Expenses"
                : "Yearly Expenses"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-700 shrink-0">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-rose-700">
              ৳
              {Number(summary.totalExpenses || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Tea, electricity, rent, bills & misc
            </p>
          </div>
        </div>

        {/* Card 5: Real Net Profit */}
        <div className="bg-white rounded-xl border border-slate-200/85 p-5 flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {timeframe === "day"
                ? "Real Net Profit"
                : timeframe === "month"
                ? "Monthly Net Profit"
                : "Yearly Net Profit"}
            </span>
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                (summary.netProfit || 0) >= 0
                  ? "bg-emerald-50 border-emerald-200/70 text-emerald-700"
                  : "bg-amber-50 border-amber-200/70 text-amber-700"
              }`}
            >
              {(summary.netProfit || 0) >= 0 ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
            </div>
          </div>
          <div>
            <h3
              className={`text-2xl font-bold font-mono tracking-tight ${
                (summary.netProfit || 0) >= 0 ? "text-emerald-700" : "text-rose-600"
              }`}
            >
              ৳
              {Number(summary.netProfit || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Gross profit minus all expenses
            </p>
          </div>
        </div>
      </div>

      {/* DAILY VIEW: Cash Register Card + Transactions Timeline */}
      {timeframe === "day" && (
        <div className="space-y-6">
          {/* Cash Register Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      register?.status === "CLOSED"
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                        : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                    }`}
                  >
                    {register?.status === "CLOSED" ? <Lock size={12} /> : <Unlock size={12} />}
                    {register?.status === "CLOSED" ? "REGISTER CLOSED" : "REGISTER OPEN"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Audited date: {selectedDate}
                  </span>
                </div>
                <h3 className="text-lg font-bold">
                  Daily Drawer Reconciliation & Closing
                </h3>
                <p className="text-xs text-slate-300">
                  Morning Opening Float:{" "}
                  <span className="font-bold font-mono text-white">
                    ৳{Number(summary.openingCash || 0).toFixed(2)}
                  </span>
                  {" • "}
                  Expected in Drawer:{" "}
                  <span className="font-bold font-mono text-teal-300">
                    ৳{Number(summary.expectedCashInDrawer || 0).toFixed(2)}
                  </span>
                  {register?.status === "CLOSED" && (
                    <>
                      {" • "}
                      Counted Cash:{" "}
                      <span className="font-bold font-mono text-white">
                        ৳{Number(register?.closingBalance || 0).toFixed(2)}
                      </span>
                      {" • "}
                      Variance:{" "}
                      <span
                        className={`font-bold font-mono ${
                          Math.abs(register?.difference || 0) < 0.01
                            ? "text-emerald-400"
                            : (register?.difference || 0) < 0
                            ? "text-rose-400"
                            : "text-amber-400"
                        }`}
                      >
                        {(register?.difference || 0) >= 0 ? "+" : ""}৳
                        {Number(register?.difference || 0).toFixed(2)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    setOpenRegisterForm({
                      openingBalance: summary.openingCash || "",
                      note: register?.note || "",
                    });
                    setIsOpenRegisterModalOpen(true);
                  }}
                  variant="outline"
                  className="text-xs font-bold bg-white/10 hover:bg-white/20 border-white/20 text-white cursor-pointer"
                >
                  Set Opening Cash
                </Button>

                <Button
                  onClick={() => {
                    setCloseRegisterForm({
                      closingBalance: register?.closingBalance ?? summary.expectedCashInDrawer ?? "",
                      note: register?.note || "",
                    });
                    setIsCloseRegisterModalOpen(true);
                  }}
                  className="text-xs font-bold bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold cursor-pointer"
                >
                  {register?.status === "CLOSED" ? "Re-Close Register" : "Close Register"}
                </Button>
              </div>
            </div>
          </div>

          {/* Daily Transactions Timeline Table */}
          <Card
            title="Daily Transaction Flow & Journal"
            subtitle={`All cash & ledger activities recorded on ${selectedDate}`}
          >
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-slate-100 pb-3">
              {[
                { id: "ALL", label: "All Activities" },
                { id: "SALE", label: "Sales (POS/Online)" },
                { id: "PURCHASE", label: "Purchases" },
                { id: "EXPENSE", label: "Expenses" },
                { id: "ADJUSTMENT", label: "Cash Adjustments" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTxFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    txFilter === f.id
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* TanStack Table: Daily Transactions */}
            <Table
              TableHeads={dailyTableHeads}
              TableRows={filteredTransactions}
              isLoading={isLoading}
              pageSize={15}
              emptyMessage="No transactions recorded for this date and filter."
              tableClass="min-w-[700px]"
            />
          </Card>
        </div>
      )}

      {/* MONTHLY VIEW: Full 30/31 Day Monthly Ledger Table */}
      {timeframe === "month" && (
        <Card
          title={`Monthly Financial Ledger — ${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
          subtitle="Day-by-day complete audit of revenue, procurement, operational expenses, and net profit margins"
        >
          <Table
            TableHeads={monthlyTableHeads}
            TableRows={dailyLedger}
            pageSize={31}
            isLoading={isLoading}
            footer={monthlyFooter}
            tableClass="min-w-[850px]"
            emptyMessage="No ledger data found for this month."
          />
        </Card>
      )}

      {/* YEARLY VIEW: 12 Months Annual Ledger Table */}
      {timeframe === "year" && (
        <Card
          title={`Annual Financial Audit Ledger — ${selectedYear}`}
          subtitle="Month-by-month financial statement of revenue, procurement, expenses, and realized margins"
        >
          <Table
            TableHeads={yearlyTableHeads}
            TableRows={monthlyLedger}
            pageSize={12}
            isLoading={isLoading}
            footer={yearlyFooter}
            tableClass="min-w-[750px]"
            emptyMessage="No ledger data found for this year."
          />
        </Card>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. ADD EXPENSE MODAL */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Record Daily Store Expense"
      >
        <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Expense Title / Purpose *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tea & snacks for staff, Electric bulb change"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition-colors"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (৳) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:border-teal-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition-colors"
              >
                <option value="CASH">Cash Drawer (নগদ ড্রয়ার)</option>
                <option value="BKASH">bKash / Mobile Banking</option>
                <option value="BANK">Bank Account</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date
              </label>
              <input
                type="text"
                disabled
                value={selectedDate}
                className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid to courier boy, Receipt #124"
              value={expenseForm.note}
              onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpenseModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddingExpense}
              className="text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
            >
              {isAddingExpense ? "Saving..." : "Save Expense"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. CASH IN / OUT ADJUSTMENT MODAL */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Record Cash In / Cash Out (Drawer Adjustment)"
      >
        <form onSubmit={handleAddAdjustmentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Transaction Direction *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentForm({ ...adjustmentForm, type: "CASH_IN" })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  adjustmentForm.type === "CASH_IN"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                + Cash In (টাকা ড্রয়ারে যোগ)
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentForm({ ...adjustmentForm, type: "CASH_OUT" })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  adjustmentForm.type === "CASH_OUT"
                    ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                - Cash Out (টাকা উত্তোলন / ড্রপ)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Amount (৳) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={adjustmentForm.amount}
              onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason / Source *
            </label>
            <input
              type="text"
              required
              placeholder={
                adjustmentForm.type === "CASH_IN"
                  ? "e.g. Owner added extra float, Withdrawn from Bank"
                  : "e.g. Cash dropped to bank, Owner took cash home"
              }
              value={adjustmentForm.reason}
              onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAdjustmentModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isAddingAdjustment}
              className="text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
            >
              {isAddingAdjustment ? "Saving..." : "Save Adjustment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. SET OPENING CASH MODAL */}
      <Modal
        isOpen={isOpenRegisterModalOpen}
        onClose={() => setIsOpenRegisterModalOpen(false)}
        title="Set Morning Opening Cash"
      >
        <form onSubmit={handleOpenRegisterSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Set the cash float available in the drawer at the start of{" "}
            <span className="font-bold text-slate-700">{selectedDate}</span>.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Opening Float Amount (৳) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 2000.00"
              value={openRegisterForm.openingBalance}
              onChange={(e) =>
                setOpenRegisterForm({ ...openRegisterForm, openingBalance: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Previous night balance carried forward"
              value={openRegisterForm.note}
              onChange={(e) => setOpenRegisterForm({ ...openRegisterForm, note: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpenRegisterModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isOpeningRegister}
              className="text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
            >
              {isOpeningRegister ? "Saving..." : "Set Opening Cash"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. CLOSE REGISTER MODAL */}
      <Modal
        isOpen={isCloseRegisterModalOpen}
        onClose={() => setIsCloseRegisterModalOpen(false)}
        title="Day-End Cash Reconciliation & Closing"
      >
        <form onSubmit={handleCloseRegisterSubmit} className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Opening Balance:</span>
              <span className="font-mono font-bold text-slate-800">
                ৳{Number(summary.openingCash || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Today Shop Cash Sales:</span>
              <span className="font-mono font-bold text-emerald-600">
                +৳{Number(summary.shopSales || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Today Cash Expenses:</span>
              <span className="font-mono font-bold text-rose-600">
                -৳{Number(summary.cashExpenses || 0).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-xs">Expected in Drawer:</span>
              <span className="font-mono font-bold text-base text-teal-700">
                ৳{Number(summary.expectedCashInDrawer || 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Counted Physical Cash (গুনে পাওয়া নগদ টাকা) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 5430.00"
              value={closeRegisterForm.closingBalance}
              onChange={(e) =>
                setCloseRegisterForm({ ...closeRegisterForm, closingBalance: e.target.value })
              }
              className="w-full px-3.5 py-2 text-sm bg-white border-2 border-teal-600 rounded-xl text-slate-900 font-mono font-bold outline-none"
            />
          </div>

          {/* Live Variance Calculation */}
          {closeRegisterForm.closingBalance !== "" && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                Math.abs(
                  parseFloat(closeRegisterForm.closingBalance || 0) -
                    (summary.expectedCashInDrawer || 0)
                ) < 0.01
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : parseFloat(closeRegisterForm.closingBalance || 0) -
                      (summary.expectedCashInDrawer || 0) <
                    0
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {Math.abs(
                  parseFloat(closeRegisterForm.closingBalance || 0) -
                    (summary.expectedCashInDrawer || 0)
                ) < 0.01 ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Exact Match! No shortage or excess.</span>
                  </>
                ) : parseFloat(closeRegisterForm.closingBalance || 0) -
                    (summary.expectedCashInDrawer || 0) <
                  0 ? (
                  <>
                    <AlertCircle size={16} className="text-rose-600" />
                    <span>Cash Shortage (ঘাটতি):</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-amber-600" />
                    <span>Cash Excess (অতিরিক্ত):</span>
                  </>
                )}
              </div>
              <span className="font-mono font-bold text-sm">
                ৳
                {Math.abs(
                  parseFloat(closeRegisterForm.closingBalance || 0) -
                    (summary.expectedCashInDrawer || 0)
                ).toFixed(2)}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reconciliation Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 200 taka shortage due to unrecorded snack or coin change"
              value={closeRegisterForm.note}
              onChange={(e) =>
                setCloseRegisterForm({ ...closeRegisterForm, note: e.target.value })
              }
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-teal-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCloseRegisterModalOpen(false)}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isClosingRegister}
              className="text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white"
            >
              {isClosingRegister ? "Closing Register..." : "Confirm & Close Day"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
