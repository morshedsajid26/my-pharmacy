"use client";

import { useState, useMemo } from "react";
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Phone,
  Navigation,
  ExternalLink,
  Calendar,
  FileText,
  RefreshCw,
  Pill,
  User,
  Search,
  Eye,
  X,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useStaffAssignedOrders } from "@/hooks/useOnlineOrders";
import { Table } from "@/components/Table";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";
import { parseLocationFromAddress } from "@/lib/locationUtils";

const TABS = [
  { key: "SHIPPED", label: "Pending Delivery (Shipped)" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "ALL", label: "All Assigned" },
];

export default function AssignedOrdersPage() {
  const [activeTab, setActiveTab] = useState("SHIPPED");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);

  const { orders: allOrders, isLoading, refetch, completeDelivery, isCompleting } =
    useStaffAssignedOrders("ALL");

  const tabCounts = useMemo(() => {
    const shipped = allOrders.filter((o) => String(o.status || "").toUpperCase() === "SHIPPED").length;
    const delivered = allOrders.filter((o) => String(o.status || "").toUpperCase() === "DELIVERED").length;
    return {
      SHIPPED: shipped,
      DELIVERED: delivered,
      ALL: allOrders.length,
    };
  }, [allOrders]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allOrders.filter((order) => {
      const st = String(order.status || "").toUpperCase();
      if (activeTab !== "ALL" && st !== activeTab) return false;
      if (!q) return true;
      return (
        String(order.orderNo || "").toLowerCase().includes(q) ||
        String(order.customerName || "").toLowerCase().includes(q) ||
        String(order.customerPhone || "").toLowerCase().includes(q) ||
        String(order.address || "").toLowerCase().includes(q)
      );
    });
  }, [allOrders, activeTab, searchTerm]);

  const handleCompleteDelivery = async () => {
    if (!confirmOrder) return;
    try {
      await completeDelivery(confirmOrder.id);
      setConfirmOrder(null);
      setViewingOrder(null);
    } catch {
      // Handled in hook
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "orderNo",
        Title: "Order",
        align: "left",
        width: "16%",
        render: (order) => {
          const isDelivered = order.status === "DELIVERED";
          const displayDate =
            isDelivered && order.deliveredAt
              ? order.deliveredAt
              : order.shippedAt || order.createdAt;
          return (
            <div className="text-left">
              <div className="font-extrabold text-slate-900 font-mono text-xs">
                {order.orderNo}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar size={10} className="shrink-0" />
                <span>
                  {new Date(displayDate).toLocaleDateString()}{" "}
                  {new Date(displayDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "customerName",
        Title: "Customer",
        align: "left",
        width: "15%",
        render: (order) => (
          <div className="text-left">
            <div className="font-bold text-slate-800 text-xs truncate max-w-[140px]">
              {order.customerName}
            </div>
            <a
              href={`tel:${order.customerPhone}`}
              className="text-[11px] text-medical-blue-600 hover:underline flex items-center gap-1 mt-0.5 font-semibold"
            >
              <Phone size={10} className="shrink-0" />
              <span>{order.customerPhone}</span>
            </a>
          </div>
        ),
      },
      {
        key: "address",
        Title: "Delivery Address",
        align: "left",
        width: "22%",
        render: (order) => {
          const loc = parseLocationFromAddress(order.address);
          return (
            <a
              href={loc.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-xs text-slate-700 hover:text-medical-blue-600 transition-colors max-w-[220px] text-left"
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
          );
        },
      },
      {
        key: "totalAmount",
        Title: "Amount",
        width: "11%",
        render: (order) => {
          const count = order.items?.length || 0;
          return (
            <div>
              <div className="font-black text-slate-900 font-mono text-xs">
                ৳{Number(order.totalAmount || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {count} {count === 1 ? "item" : "items"}
              </div>
            </div>
          );
        },
      },
      {
        key: "paymentStatus",
        Title: "Payment",
        width: "12%",
        render: (order) => (
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {order.paymentMethod || "COD"}
            </span>
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                order.paymentStatus === "PAID"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {order.paymentStatus === "PAID" ? "PAID" : "Collect Cash"}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        Title: "Status",
        width: "10%",
        render: (order) => <OrderStatusBadge status={order.status} />,
      },
      {
        key: "actions",
        Title: "Actions",
        align: "right",
        width: "14%",
        sortable: false,
        render: (order) => (
          <div className="inline-flex items-center justify-end gap-1.5">
            {order.status === "SHIPPED" && (
              <button
                onClick={() => setConfirmOrder(order)}
                disabled={isCompleting}
                className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs disabled:opacity-50 whitespace-nowrap"
                title="Mark Delivery Complete"
              >
                <CheckCircle2 size={13} />
                <span>Complete</span>
              </button>
            )}
            <button
              onClick={() => setViewingOrder(order)}
              className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors inline-flex items-center justify-center cursor-pointer"
              title="View Order Details & Medicines"
            >
              <Eye size={14} />
            </button>
          </div>
        ),
      },
    ],
    [isCompleting]
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center border border-medical-blue-100">
              <PackageCheck size={20} />
            </div>
            <span>Assigned Online Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View orders assigned to you for delivery, navigate to customer GPS locations, and mark deliveries complete.
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-2xs font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toolbar (Pill Tabs + Search) + Shared Table Component */}
      <div className="space-y-4">
        <div className="p-4 rounded-xl border border-slate-200/85 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-medical-blue-600 text-white border-medical-blue-600 shadow-2xs"
                      : "bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.key === "SHIPPED" && count > 0
                        ? "bg-sky-100 text-sky-800"
                        : "bg-white text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order #, customer, phone, area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-medical-blue-500 focus:ring-1 focus:ring-medical-blue-500 transition-all"
            />
          </div>
        </div>

        <Table
          TableHeads={columns}
          TableRows={filteredOrders}
          isLoading={isLoading}
          emptyMessage={
            searchTerm
              ? `No assigned orders matched "${searchTerm}".`
              : `No assigned orders in ${activeTab} right now.`
          }
        />
      </div>

      {/* View Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setViewingOrder(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col justify-between shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 font-mono">
                    {viewingOrder.orderNo}
                  </h3>
                  <OrderStatusBadge status={viewingOrder.status} />
                </div>
                <p className="text-[11px] text-slate-400">
                  Assigned:{" "}
                  {new Date(viewingOrder.shippedAt || viewingOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Customer & Address */}
              {(() => {
                const loc = parseLocationFromAddress(viewingOrder.address);
                return (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                        <User size={14} className="text-slate-400" />
                        <span>{viewingOrder.customerName}</span>
                      </div>
                      <a
                        href={`tel:${viewingOrder.customerPhone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-medical-blue-600 font-bold hover:bg-medical-blue-50"
                      >
                        <Phone size={12} />
                        <span>{viewingOrder.customerPhone}</span>
                      </a>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200/70 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">
                          Delivery Location
                        </span>
                        <p className="font-semibold text-slate-800 leading-relaxed">
                          {loc.cleanAddress}
                        </p>
                      </div>
                      <a
                        href={loc.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold text-[11px]"
                      >
                        <Navigation size={12} />
                        <span>Map</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                );
              })()}

              {viewingOrder.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                  <FileText size={14} className="shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <strong className="block font-bold">Customer Note:</strong>
                    <span>{viewingOrder.notes}</span>
                  </div>
                </div>
              )}

              {/* Medicines List */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase text-slate-400">
                  Medicines ({viewingOrder.items?.length || 0})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {(viewingOrder.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 flex items-center justify-between text-xs bg-white"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Pill size={13} className="text-medical-blue-500 shrink-0" />
                        <span className="font-bold text-slate-800 truncate">
                          {item.medicine?.name || "Medicine"}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-700 shrink-0 ml-2">
                        × {item.quantity} (৳{Number(item.totalPrice || 0).toFixed(2)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">Grand Total</span>
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded mt-1 ${
                      viewingOrder.paymentStatus === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {viewingOrder.paymentStatus === "PAID"
                      ? "PAID"
                      : `${viewingOrder.paymentMethod || "COD"} • Collect Cash`}
                  </span>
                </div>
                <span className="text-xl font-black text-slate-900 font-mono">
                  ৳{Number(viewingOrder.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2.5">
              <a
                href={`tel:${viewingOrder.customerPhone}`}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5"
              >
                <Phone size={13} />
                <span>Call Customer</span>
              </a>

              <div className="flex items-center gap-2">
                {viewingOrder.status === "SHIPPED" && (
                  <button
                    onClick={() => setConfirmOrder(viewingOrder)}
                    disabled={isCompleting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>Delivery Complete</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setConfirmOrder(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 z-10 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">
                Confirm Delivery Complete?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Order <strong>{confirmOrder.orderNo}</strong> for{" "}
                <strong>{confirmOrder.customerName}</strong> will be marked as{" "}
                <strong className="text-emerald-700">DELIVERED</strong>.
                {confirmOrder.paymentStatus !== "PAID" && (
                  <span className="block mt-1 font-bold text-amber-700">
                    Make sure you collected ৳{Number(confirmOrder.totalAmount || 0).toFixed(2)} cash on delivery.
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setConfirmOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteDelivery}
                disabled={isCompleting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isCompleting ? "Saving..." : "Confirm Delivered"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
