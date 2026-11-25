"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Check,
  X,
  Phone,
  FileText,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  Package,
  Truck,
  CheckCircle2,
  User,
  UserCheck,
  Loader2,
  Navigation,
  ExternalLink,
  Search,
  Clock,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useOnlineOrders } from "@/hooks/useOnlineOrders";
import { useStaff } from "@/hooks/useStaff";
import { parseLocationFromAddress } from "@/lib/locationUtils";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "ACCEPTED", label: "Accepted" },
  { key: "PACKED", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ALL", label: "All Orders" },
];

const normalizeStatus = (status) => {
  const s = String(status || "PENDING").toUpperCase();
  return s === "APPROVED" ? "ACCEPTED" : s;
};

export function OrderStatusBadge({ status }) {
  const s = normalizeStatus(status);
  if (s === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        <span>Pending</span>
      </span>
    );
  }
  if (s === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
        <Check size={11} strokeWidth={2.5} />
        <span>Accepted</span>
      </span>
    );
  }
  if (s === "PACKED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap">
        <Package size={11} />
        <span>Packed</span>
      </span>
    );
  }
  if (s === "SHIPPED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 whitespace-nowrap">
        <Truck size={11} />
        <span>Shipped</span>
      </span>
    );
  }
  if (s === "DELIVERED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 whitespace-nowrap">
        <CheckCircle2 size={11} />
        <span>Delivered</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 whitespace-nowrap">
      <X size={11} strokeWidth={2.5} />
      <span>Rejected</span>
    </span>
  );
}

export default function OnlineOrdersPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [confirmAction, setConfirmAction] = useState({
    type: null,
    orderId: null,
    orderNo: "",
  });

  const [assignModal, setAssignModal] = useState({
    isOpen: false,
    order: null,
    staffId: "",
  });

  // Fetch all orders once so tab counts, KPI cards, search & tab switching are instant
  const {
    orders: allOrders,
    isLoading: loading,
    acceptOrder,
    packOrder,
    assignStaffOrder,
    deliverOrder,
    rejectOrder,
    refetch: loadOrders,
  } = useOnlineOrders("ALL");

  const { staffList = [] } = useStaff();

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: allOrders.length,
      PENDING: 0,
      ACCEPTED: 0,
      PACKED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      REJECTED: 0,
    };
    allOrders.forEach((o) => {
      const s = normalizeStatus(o.status);
      if (counts[s] !== undefined) counts[s] += 1;
    });
    return counts;
  }, [allOrders]);

  const deliveredRevenue = useMemo(
    () =>
      allOrders
        .filter((o) => normalizeStatus(o.status) === "DELIVERED")
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    [allOrders]
  );

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allOrders.filter((order) => {
      const s = normalizeStatus(order.status);
      if (activeTab !== "ALL" && s !== activeTab) return false;
      if (!q) return true;
      return (
        String(order.orderNo || "").toLowerCase().includes(q) ||
        String(order.customerName || "").toLowerCase().includes(q) ||
        String(order.customerPhone || "").toLowerCase().includes(q) ||
        String(order.address || "").toLowerCase().includes(q) ||
        String(order.assignedStaff?.name || "").toLowerCase().includes(q)
      );
    });
  }, [allOrders, activeTab, searchTerm]);

  const triggerConfirm = (type, order) => {
    setConfirmAction({
      type,
      orderId: order.id,
      orderNo: order.orderNo || "Order",
    });
  };

  const openAssignModal = (order) => {
    setAssignModal({
      isOpen: true,
      order,
      staffId: order.assignedStaffId || staffList[0]?.id || "",
    });
  };

  const executeConfirmedAction = async () => {
    const { type, orderId } = confirmAction;
    if (!type || !orderId) return;

    setConfirmAction({ type: null, orderId: null, orderNo: "" });
    setActionLoading(true);
    try {
      if (type === "ACCEPT") await acceptOrder(orderId);
      else if (type === "PACK") await packOrder(orderId);
      else if (type === "DELIVER") await deliverOrder(orderId);
      else if (type === "REJECT") await rejectOrder({ orderId });
      setSelectedOrder(null);
    } finally {
      setActionLoading(false);
    }
  };

  const executeAssignAndShip = async () => {
    if (!assignModal.order) return;
    setActionLoading(true);
    try {
      await assignStaffOrder({
        orderId: assignModal.order.id,
        staffId: assignModal.staffId || null,
      });
      setAssignModal({ isOpen: false, order: null, staffId: "" });
      setSelectedOrder(null);
    } finally {
      setActionLoading(false);
    }
  };

  const getConfirmMeta = () => {
    switch (confirmAction.type) {
      case "ACCEPT":
        return {
          title: "Accept Order?",
          desc: `Accept order ${confirmAction.orderNo}? Medicine stock will be reserved immediately.`,
          btnText: "Accept Order",
          btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
          iconBg: "bg-blue-100 text-blue-600",
          Icon: Check,
        };
      case "PACK":
        return {
          title: "Mark Order as Packed?",
          desc: `Confirm that order ${confirmAction.orderNo} is packed and ready for delivery assignment.`,
          btnText: "Mark Packed",
          btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
          iconBg: "bg-indigo-100 text-indigo-600",
          Icon: Package,
        };
      case "DELIVER":
        return {
          title: "Mark as Delivered?",
          desc: `Complete delivery for ${confirmAction.orderNo}? This will record the sale in POS & Cash Management.`,
          btnText: "Complete Delivery",
          btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
          iconBg: "bg-emerald-100 text-emerald-600",
          Icon: CheckCircle2,
        };
      default:
        return {
          title: "Reject Order?",
          desc: `Are you sure you want to reject order ${confirmAction.orderNo}? Any reserved stock will be restored.`,
          btnText: "Reject Order",
          btnClass: "bg-rose-600 hover:bg-rose-700 text-white",
          iconBg: "bg-rose-100 text-rose-600",
          Icon: AlertCircle,
        };
    }
  };

  const confirmMeta = getConfirmMeta();

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center border border-medical-blue-100">
              <ShoppingBag size={20} />
            </div>
            <span>Online Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage order lifecycle: Accept, Pack, Assign Staff (Shipped), Complete Delivery, or Reject.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* KPI SUMMARY STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab("PENDING")}
          className={`text-left bg-white rounded-2xl border p-4 flex items-center justify-between transition-all cursor-pointer ${
            activeTab === "PENDING"
              ? "border-amber-400 ring-2 ring-amber-100 shadow-sm"
              : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-black text-amber-600 font-mono mt-1">{statusCounts.PENDING}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Needs review</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ACCEPTED")}
          className={`text-left bg-white rounded-2xl border p-4 flex items-center justify-between transition-all cursor-pointer ${
            activeTab === "ACCEPTED" || activeTab === "PACKED"
              ? "border-indigo-400 ring-2 ring-indigo-100 shadow-sm"
              : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Preparation</p>
            <p className="text-2xl font-black text-indigo-700 font-mono mt-1">
              {statusCounts.ACCEPTED + statusCounts.PACKED}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {statusCounts.ACCEPTED} accepted · {statusCounts.PACKED} packed
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SHIPPED")}
          className={`text-left bg-white rounded-2xl border p-4 flex items-center justify-between transition-all cursor-pointer ${
            activeTab === "SHIPPED"
              ? "border-sky-400 ring-2 ring-sky-100 shadow-sm"
              : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Out for Delivery</p>
            <p className="text-2xl font-black text-sky-700 font-mono mt-1">{statusCounts.SHIPPED}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Assigned to staff</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Truck size={20} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DELIVERED")}
          className={`text-left bg-white rounded-2xl border p-4 flex items-center justify-between transition-all cursor-pointer ${
            activeTab === "DELIVERED"
              ? "border-emerald-400 ring-2 ring-emerald-100 shadow-sm"
              : "border-slate-200/80 hover:border-slate-300 shadow-2xs"
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Delivered</p>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{statusCounts.DELIVERED}</p>
            <p className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5">
              ৳{deliveredRevenue.toFixed(0)} collected
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </button>
      </div>

      {/* UNIFIED ORDERS TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {/* Card Toolbar: Pill Tabs + Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-slate-50/40">
          {/* Segmented Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 xl:pb-0">
            {TABS.map((tab) => {
              const count = statusCounts[tab.key] || 0;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-medical-blue-600 text-white border-medical-blue-600 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.key === "PENDING" && count > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full xl:w-72 shrink-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order #, customer, phone, staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs font-semibold bg-white border border-slate-200 rounded-xl outline-none focus:border-medical-blue-500 focus:ring-1 focus:ring-medical-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
            <p className="text-slate-500 font-medium text-xs">Fetching online orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-extrabold text-[11px] tracking-wider uppercase border-b border-slate-100">
                  <th className="px-4 py-3.5 w-[16%]">Order</th>
                  <th className="px-4 py-3.5 w-[13%]">Customer</th>
                  <th className="px-4 py-3.5 w-[17%]">Address</th>
                  <th className="px-4 py-3.5 w-[10%]">Amount</th>
                  <th className="px-4 py-3.5 w-[10%]">Payment</th>
                  <th className="px-4 py-3.5 w-[11%]">Staff</th>
                  <th className="px-4 py-3.5 w-[10%]">Status</th>
                  <th className="px-4 py-3.5 w-[13%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map((order) => {
                  const st = normalizeStatus(order.status);
                  const loc = parseLocationFromAddress(order.address);
                  const itemCount = order.items?.length || 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order No & Timestamp */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-extrabold text-slate-900 font-mono text-xs">
                          {order.orderNo}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} className="shrink-0" />
                          <span className="truncate">
                            {new Date(order.createdAt).toLocaleDateString()}{" "}
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-bold text-slate-800 truncate max-w-[140px]">
                          {order.customerName}
                        </div>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-[11px] text-slate-500 hover:text-medical-blue-600 flex items-center gap-1 mt-0.5 font-medium"
                        >
                          <Phone size={10} className="shrink-0" />
                          <span>{order.customerPhone}</span>
                        </a>
                      </td>

                      {/* Delivery Address */}
                      <td className="px-4 py-3.5 align-middle">
                        <a
                          href={loc.directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2 text-xs text-slate-700 hover:text-medical-blue-600 transition-colors max-w-[200px]"
                          title={loc.cleanAddress}
                        >
                          <div className="w-7 h-7 rounded-lg bg-medical-blue-50 text-medical-blue-600 group-hover:bg-medical-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                            <Navigation size={12} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="truncate block font-semibold text-slate-700 group-hover:text-medical-blue-600">
                                {loc.cleanAddress}
                              </span>
                              {loc.hasCoordinates && (
                                <span className="px-1 rounded text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                  GPS
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-medical-blue-600/80 font-bold inline-flex items-center gap-0.5">
                              <span>Map Directions</span>
                              <ExternalLink size={9} />
                            </span>
                          </div>
                        </a>
                      </td>

                      {/* Amount & Item count */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-black text-slate-900 font-mono text-sm">
                          ৳{Number(order.totalAmount || 0).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            {order.paymentMethod || "COD"}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              order.paymentStatus === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : order.paymentStatus === "FAILED"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200/80"
                            }`}
                          >
                            {order.paymentStatus || "UNPAID"}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Staff */}
                      <td className="px-4 py-3.5 align-middle">
                        {order.assignedStaff ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/80 text-[11px] font-bold text-sky-800 max-w-[130px]">
                            <UserCheck size={12} className="text-sky-600 shrink-0" />
                            <span className="truncate">{order.assignedStaff.name}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-middle">
                        <OrderStatusBadge status={st} />
                      </td>

                      {/* Clean Uniform Actions */}
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {st === "PENDING" && (
                            <>
                              <button
                                onClick={() => triggerConfirm("ACCEPT", order)}
                                className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Accept Order"
                              >
                                <Check size={13} />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => triggerConfirm("REJECT", order)}
                                className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 transition-colors inline-flex items-center justify-center cursor-pointer"
                                title="Reject Order"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          {st === "ACCEPTED" && (
                            <>
                              <button
                                onClick={() => triggerConfirm("PACK", order)}
                                className="h-8 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Mark as Packed"
                              >
                                <Package size={12} />
                                <span>Pack</span>
                              </button>
                              <button
                                onClick={() => openAssignModal(order)}
                                className="h-8 px-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Assign Staff & Ship"
                              >
                                <Truck size={12} />
                                <span>Assign</span>
                              </button>
                              <button
                                onClick={() => triggerConfirm("REJECT", order)}
                                className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 transition-colors inline-flex items-center justify-center cursor-pointer"
                                title="Reject Order"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          {st === "PACKED" && (
                            <>
                              <button
                                onClick={() => openAssignModal(order)}
                                className="h-8 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Assign Staff & Ship"
                              >
                                <Truck size={12} />
                                <span>Assign &amp; Ship</span>
                              </button>
                              <button
                                onClick={() => triggerConfirm("REJECT", order)}
                                className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 transition-colors inline-flex items-center justify-center cursor-pointer"
                                title="Reject Order"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          {st === "SHIPPED" && (
                            <>
                              <button
                                onClick={() => triggerConfirm("DELIVER", order)}
                                className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Mark Delivered"
                              >
                                <CheckCircle2 size={12} />
                                <span>Deliver</span>
                              </button>
                              <button
                                onClick={() => openAssignModal(order)}
                                className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Reassign Staff"
                              >
                                Staff
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-300 flex items-center justify-center mb-3">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
            <p className="text-slate-400 text-xs mt-1">
              {searchTerm
                ? `No orders matched "${searchTerm}" in ${activeTab}.`
                : `There are currently no orders in ${activeTab}.`}
            </p>
          </div>
        )}
      </div>

      {/* DETAILS VIEW MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col justify-between shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Order {selectedOrder.orderNo}
                  </h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
                <p className="text-xs text-slate-400">
                  Placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    Customer Details
                  </h4>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm font-extrabold text-slate-800">
                      {selectedOrder.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">
                      {selectedOrder.customerPhone}
                    </span>
                  </div>
                  {selectedOrder.assignedStaff && (
                    <div className="pt-2 border-t border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Assigned Delivery Staff
                      </span>
                      <span className="text-xs font-extrabold text-sky-700 flex items-center gap-1 mt-0.5">
                        <UserCheck size={13} />
                        <span>
                          {selectedOrder.assignedStaff.name}
                          {selectedOrder.assignedStaff.phone
                            ? ` (${selectedOrder.assignedStaff.phone})`
                            : ""}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {(() => {
                  const loc = parseLocationFromAddress(selectedOrder.address);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Delivery Destination
                        </h4>
                        {loc.hasCoordinates && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded uppercase">
                            GPS Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                        {loc.cleanAddress}
                      </p>
                      <a
                        href={loc.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-medical-blue-600 hover:underline"
                      >
                        <Navigation size={12} />
                        <span>Open in Google Maps</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  );
                })()}
              </div>

              {selectedOrder.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                  <FileText size={14} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="block font-bold">Customer Note:</strong>
                    <span>{selectedOrder.notes}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ordered Medicines ({selectedOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {(selectedOrder.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 flex items-center justify-between gap-3 bg-white text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {item.medicine?.name || "Medicine"}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          ৳{Number(item.unitPrice || 0).toFixed(2)} × {item.quantity} unit(s)
                        </p>
                      </div>
                      <span className="font-black text-slate-900 font-mono">
                        ৳{Number(item.totalPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">
                    ৳{Number(selectedOrder.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-mono font-bold">
                    {Number(selectedOrder.deliveryCharge || 0) === 0
                      ? "FREE"
                      : `৳${Number(selectedOrder.deliveryCharge).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total</span>
                  <span className="font-mono">
                    ৳{Number(selectedOrder.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-end gap-2.5">
              {normalizeStatus(selectedOrder.status) === "PENDING" && (
                <>
                  <button
                    onClick={() => triggerConfirm("REJECT", selectedOrder)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={() => triggerConfirm("ACCEPT", selectedOrder)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Accept Order
                  </button>
                </>
              )}

              {normalizeStatus(selectedOrder.status) === "ACCEPTED" && (
                <>
                  <button
                    onClick={() => triggerConfirm("REJECT", selectedOrder)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => triggerConfirm("PACK", selectedOrder)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Mark Packed
                  </button>
                  <button
                    onClick={() => openAssignModal(selectedOrder)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Assign Staff &amp; Ship
                  </button>
                </>
              )}

              {normalizeStatus(selectedOrder.status) === "PACKED" && (
                <>
                  <button
                    onClick={() => triggerConfirm("REJECT", selectedOrder)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openAssignModal(selectedOrder)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Assign Staff &amp; Ship
                  </button>
                </>
              )}

              {normalizeStatus(selectedOrder.status) === "SHIPPED" && (
                <>
                  <button
                    onClick={() => openAssignModal(selectedOrder)}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer"
                  >
                    Reassign Staff
                  </button>
                  <button
                    onClick={() => triggerConfirm("DELIVER", selectedOrder)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Mark Delivered
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN STAFF & SHIP MODAL */}
      {assignModal.isOpen && assignModal.order && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setAssignModal({ isOpen: false, order: null, staffId: "" })}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Assign Staff &amp; Ship Order
                  </h3>
                  <p className="text-xs text-slate-500">Order {assignModal.order.orderNo}</p>
                </div>
              </div>
              <button
                onClick={() => setAssignModal({ isOpen: false, order: null, staffId: "" })}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {staffList.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Select Delivery Staff Member
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {staffList.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        assignModal.staffId === s.id
                          ? "bg-sky-50/70 border-sky-400 ring-1 ring-sky-400"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="radio"
                          name="assign_staff"
                          checked={assignModal.staffId === s.id}
                          onChange={() => setAssignModal({ ...assignModal, staffId: s.id })}
                          className="text-sky-600"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-slate-900 truncate">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {s.phone || s.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        {s.activeDeliveries || 0} active
                      </span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Assigning a staff member will automatically change order status to{" "}
                  <strong className="text-sky-700">SHIPPED</strong> and show it in their Staff Dashboard.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <p className="font-bold">No staff accounts found!</p>
                <p>
                  Create a staff account first to assign deliveries, or you can still ship without assigning a staff member.
                </p>
                <Link
                  href="/staff-management"
                  className="inline-block font-bold text-medical-blue-700 underline"
                >
                  Go to Staff Management →
                </Link>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setAssignModal({ isOpen: false, order: null, staffId: "" })}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeAssignAndShip}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                <span>{assignModal.staffId ? "Assign & Mark Shipped" : "Mark Shipped"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM ACTION MODAL */}
      {confirmAction.type && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setConfirmAction({ type: null, orderId: null, orderNo: "" })}
          />
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 z-10 animate-in zoom-in-95 duration-150">
            <div
              className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${confirmMeta.iconBg}`}
            >
              <confirmMeta.Icon size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">{confirmMeta.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{confirmMeta.desc}</p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setConfirmAction({ type: null, orderId: null, orderNo: "" })}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs cursor-pointer disabled:opacity-50 ${confirmMeta.btnClass}`}
              >
                {actionLoading ? "Processing..." : confirmMeta.btnText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
