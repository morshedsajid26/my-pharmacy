"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  BarChart3,
  PackageCheck,
  Truck,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Navigation,
  ExternalLink,
  Receipt,
  CalendarDays,
  Layers,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useStaffDetails } from "@/hooks/useStaff";
import { Table } from "@/components/Table";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { parseLocationFromAddress } from "@/lib/locationUtils";

const VIEW_TABS = [
  { key: "ASSIGNED_ORDERS", label: "Assigned Orders", icon: PackageCheck },
  { key: "DAILY_SALES", label: "Daily Sales", icon: CalendarDays },
  { key: "MONTHLY_SALES", label: "Monthly Sales", icon: BarChart3 },
  { key: "YEARLY_SALES", label: "Yearly Sales", icon: Layers },
  { key: "RECENT_INVOICES", label: "Sales Invoices", icon: Receipt },
];

export default function ViewStaffPage() {
  const params = useParams();
  const staffId = params?.id;

  const { details, isLoading, isError, refetch } = useStaffDetails(staffId);
  const [activeTab, setActiveTab] = useState("ASSIGNED_ORDERS");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

  const staff = details?.staff;
  const salesSummary = details?.salesSummary || {};
  const ordersSummary = details?.ordersSummary || {};
  const assignedOrders = details?.assignedOrders || [];
  const dailySales = details?.dailySales || [];
  const monthlySales = details?.monthlySales || [];
  const yearlySales = details?.yearlySales || [];
  const recentSales = details?.recentSales || [];

  const filteredAssignedOrders = useMemo(() => {
    if (orderStatusFilter === "ALL") return assignedOrders;
    return assignedOrders.filter(
      (o) => String(o.status || "").toUpperCase() === orderStatusFilter
    );
  }, [assignedOrders, orderStatusFilter]);

  const assignedOrdersColumns = useMemo(
    () => [
      {
        key: "orderNo",
        Title: "Order No",
        align: "left",
        width: "16%",
        render: (order) => (
          <div className="text-left">
            <div className="font-extrabold text-slate-900 font-mono text-xs">
              {order.orderNo}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>
        ),
      },
      {
        key: "customerName",
        Title: "Customer",
        align: "left",
        width: "16%",
        render: (order) => (
          <div className="text-left">
            <div className="font-bold text-slate-800 text-xs">{order.customerName}</div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Phone size={10} />
              <span>{order.customerPhone}</span>
            </div>
          </div>
        ),
      },
      {
        key: "address",
        Title: "Delivery Location",
        align: "left",
        width: "24%",
        render: (order) => {
          const loc = parseLocationFromAddress(order.address);
          return (
            <a
              href={loc.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-medical-blue-600 text-left max-w-[230px]"
            >
              <Navigation size={12} className="text-medical-blue-600 shrink-0" />
              <span className="truncate font-medium group-hover:underline">
                {loc.cleanAddress}
              </span>
              <ExternalLink size={10} className="shrink-0 opacity-60" />
            </a>
          );
        },
      },
      {
        key: "totalAmount",
        Title: "Amount",
        width: "12%",
        render: (order) => (
          <div>
            <div className="font-black text-slate-900 font-mono text-xs">
              ৳{Number(order.totalAmount || 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-400">
              {order.items?.length || 0} items
            </div>
          </div>
        ),
      },
      {
        key: "paymentStatus",
        Title: "Payment",
        width: "11%",
        render: (order) => (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              {order.paymentMethod || "COD"}
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                order.paymentStatus === "PAID"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {order.paymentStatus || "UNPAID"}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        Title: "Status",
        width: "11%",
        render: (order) => <OrderStatusBadge status={order.status} />,
      },
      {
        key: "deliveredAt",
        Title: "Updated",
        width: "10%",
        render: (order) => (
          <span className="text-[11px] text-slate-500">
            {order.deliveredAt
              ? new Date(order.deliveredAt).toLocaleDateString()
              : order.shippedAt
              ? new Date(order.shippedAt).toLocaleDateString()
              : new Date(order.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  const dailySalesColumns = useMemo(
    () => [
      {
        key: "date",
        Title: "Date",
        align: "left",
        width: "35%",
        render: (row) => (
          <span className="font-bold text-slate-900 text-xs">{row.displayDate}</span>
        ),
      },
      {
        key: "salesCount",
        Title: "POS Bills",
        width: "25%",
        render: (row) => (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs font-mono">
            {row.salesCount}
          </span>
        ),
      },
      {
        key: "totalAmount",
        Title: "POS Sales Amount",
        align: "right",
        width: "40%",
        render: (row) => (
          <span className="font-black text-emerald-700 font-mono text-sm">
            ৳{Number(row.totalAmount || 0).toFixed(2)}
          </span>
        ),
      },
    ],
    []
  );

  const monthlySalesColumns = useMemo(
    () => [
      {
        key: "monthKey",
        Title: "Month",
        align: "left",
        width: "35%",
        render: (row) => (
          <span className="font-bold text-slate-900 text-xs">{row.monthLabel}</span>
        ),
      },
      {
        key: "salesCount",
        Title: "POS Bills",
        width: "25%",
        render: (row) => (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs font-mono">
            {row.salesCount}
          </span>
        ),
      },
      {
        key: "totalAmount",
        Title: "Monthly POS Total",
        align: "right",
        width: "40%",
        render: (row) => (
          <span className="font-black text-emerald-700 font-mono text-sm">
            ৳{Number(row.totalAmount || 0).toFixed(2)}
          </span>
        ),
      },
    ],
    []
  );

  const yearlySalesColumns = useMemo(
    () => [
      {
        key: "year",
        Title: "Year",
        align: "left",
        width: "35%",
        render: (row) => (
          <span className="font-black text-slate-900 font-mono text-sm">{row.year}</span>
        ),
      },
      {
        key: "salesCount",
        Title: "POS Bills",
        width: "25%",
        render: (row) => (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs font-mono">
            {row.salesCount}
          </span>
        ),
      },
      {
        key: "totalAmount",
        Title: "Yearly POS Total",
        align: "right",
        width: "40%",
        render: (row) => (
          <span className="font-black text-emerald-700 font-mono text-sm">
            ৳{Number(row.totalAmount || 0).toFixed(2)}
          </span>
        ),
      },
    ],
    []
  );

  const recentSalesColumns = useMemo(
    () => [
      {
        key: "invoiceNo",
        Title: "Invoice No",
        align: "left",
        width: "20%",
        render: (row) => (
          <span className="font-bold text-slate-900 font-mono text-xs">{row.invoiceNo}</span>
        ),
      },
      {
        key: "date",
        Title: "Date & Time",
        width: "18%",
        render: (row) => (
          <span className="text-xs text-slate-500">
            {new Date(row.date).toLocaleString()}
          </span>
        ),
      },
      {
        key: "customerName",
        Title: "Customer",
        align: "left",
        width: "20%",
        render: (row) => (
          <span className="font-semibold text-slate-800 text-xs">{row.customerName}</span>
        ),
      },
      {
        key: "isOnline",
        Title: "Channel",
        width: "12%",
        render: (row) =>
          row.isOnline ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
              Online Delivery
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              POS Walk-in
            </span>
          ),
      },
      {
        key: "itemsCount",
        Title: "Items",
        width: "10%",
        render: (row) => (
          <span className="font-mono text-xs font-bold text-slate-600">{row.itemsCount}</span>
        ),
      },
      {
        key: "totalAmount",
        Title: "Total Amount",
        align: "right",
        width: "20%",
        render: (row) => (
          <span className="font-black text-slate-900 font-mono text-xs">
            ৳{Number(row.totalAmount || 0).toFixed(2)}
          </span>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-9 h-9 animate-spin text-medical-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading staff performance report...</p>
      </div>
    );
  }

  if (isError || !staff) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900">Staff Account Not Found</h2>
        <p className="text-xs text-slate-500">
          This staff member may have been removed or the ID is invalid.
        </p>
        <Link
          href="/staff-management"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-medical-blue-600 text-white font-bold text-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Staff Management</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Back Link & Top Actions */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/staff-management"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-medical-blue-600 transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Staff Management</span>
        </Link>

        <button
          onClick={refetch}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer shadow-2xs"
        >
          <RefreshCw size={13} />
          <span>Refresh Report</span>
        </button>
      </div>

      {/* Staff Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-medical-blue-50 border border-medical-blue-200 text-medical-blue-700 flex items-center justify-center text-2xl font-black shrink-0">
            {staff.name ? staff.name.charAt(0).toUpperCase() : "S"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {staff.name}
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-200">
                Staff Member
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>{staff.email}</span>
              </span>
              {staff.phone && (
                <a
                  href={`tel:${staff.phone}`}
                  className="inline-flex items-center gap-1.5 hover:text-medical-blue-600"
                >
                  <Phone size={13} className="text-slate-400" />
                  <span>{staff.phone}</span>
                </a>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Joined {new Date(staff.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Orders Mini Status Breakdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-[85px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned</p>
            <p className="text-lg font-black text-slate-900 font-mono">{ordersSummary.total || 0}</p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200/80 text-center min-w-[85px]">
            <p className="text-[10px] font-bold text-sky-600 uppercase">Shipped</p>
            <p className="text-lg font-black text-sky-700 font-mono">{ordersSummary.shipped || 0}</p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200/80 text-center min-w-[85px]">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">Delivered</p>
            <p className="text-lg font-black text-emerald-700 font-mono">{ordersSummary.delivered || 0}</p>
          </div>
        </div>
      </div>

      {/* Sales Performance KPI Cards (Daily, Monthly, Yearly, All-Time) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today&apos;s POS Sales</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">
              ৳{Number(salesSummary.today?.amount || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {salesSummary.today?.count || 0} POS bills today
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly POS Sales</p>
            <p className="text-2xl font-black text-indigo-700 font-mono mt-1">
              ৳{Number(salesSummary.monthly?.amount || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {salesSummary.monthly?.count || 0} POS bills this month
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BarChart3 size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Yearly POS Sales</p>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
              ৳{Number(salesSummary.yearly?.amount || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {salesSummary.yearly?.count || 0} POS bills this year
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">All-Time POS Sales</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">
              ৳{Number(salesSummary.allTime?.amount || 0).toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {salesSummary.allTime?.count || 0} total POS bills
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Receipt size={20} />
          </div>
        </div>
      </div>

      {/* Tabbed Tables Section */}
      <div className="space-y-4">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/85 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {VIEW_TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-medical-blue-600 text-white border-medical-blue-600 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <t.icon size={14} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === "ASSIGNED_ORDERS" && (
            <div className="flex items-center gap-1.5">
              {[
                { key: "ALL", label: `All (${ordersSummary.total || 0})` },
                { key: "SHIPPED", label: `Shipped (${ordersSummary.shipped || 0})` },
                { key: "DELIVERED", label: `Delivered (${ordersSummary.delivered || 0})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setOrderStatusFilter(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    orderStatusFilter === f.key
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "ASSIGNED_ORDERS" && (
          <Table
            TableHeads={assignedOrdersColumns}
            TableRows={filteredAssignedOrders}
            emptyMessage="No assigned online orders found for this staff member."
          />
        )}

        {activeTab === "DAILY_SALES" && (
          <Table
            TableHeads={dailySalesColumns}
            TableRows={dailySales}
            emptyMessage="No daily sales recorded by this staff member yet."
          />
        )}

        {activeTab === "MONTHLY_SALES" && (
          <Table
            TableHeads={monthlySalesColumns}
            TableRows={monthlySales}
            emptyMessage="No monthly sales recorded by this staff member yet."
          />
        )}

        {activeTab === "YEARLY_SALES" && (
          <Table
            TableHeads={yearlySalesColumns}
            TableRows={yearlySales}
            emptyMessage="No yearly sales recorded by this staff member yet."
          />
        )}

        {activeTab === "RECENT_INVOICES" && (
          <Table
            TableHeads={recentSalesColumns}
            TableRows={recentSales}
            emptyMessage="No sales invoices found for this staff member yet."
          />
        )}
      </div>
    </div>
  );
}
