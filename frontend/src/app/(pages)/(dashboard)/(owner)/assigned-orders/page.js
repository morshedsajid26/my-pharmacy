"use client";

import { useState } from "react";
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
  Loader2,
  Pill,
  User,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useStaffAssignedOrders } from "@/hooks/useOnlineOrders";
import { parseLocationFromAddress } from "@/lib/locationUtils";

const TABS = [
  { key: "SHIPPED", label: "Pending Delivery (Shipped)" },
  { key: "DELIVERED", label: "Delivered" },
  { key: "ALL", label: "All Assigned" },
];

export default function AssignedOrdersPage() {
  const [activeTab, setActiveTab] = useState("SHIPPED");
  const [confirmOrder, setConfirmOrder] = useState(null);

  const { orders, isLoading, refetch, completeDelivery, isCompleting } =
    useStaffAssignedOrders(activeTab);

  const handleCompleteDelivery = async () => {
    if (!confirmOrder) return;
    try {
      await completeDelivery(confirmOrder.id);
      setConfirmOrder(null);
    } catch {
      // Handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <PackageCheck className="text-medical-blue-600 w-7 h-7" />
            <span>Assigned Online Orders</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View orders assigned to you for delivery, navigate to customer GPS locations, and mark deliveries complete.
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          <span>Reload</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 pb-px gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 font-bold text-xs sm:text-sm border-b-2 -mb-px transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? "border-medical-blue-600 text-medical-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
          <span className="text-sm font-medium">Loading your assigned orders...</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {orders.map((order) => {
            const loc = parseLocationFromAddress(order.address);
            const isShipped = order.status === "SHIPPED";
            const isDelivered = order.status === "DELIVERED";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-4">
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">
                          {order.orderNo}
                        </span>
                        {isShipped ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            <Truck size={11} />
                            <span>Shipped</span>
                          </span>
                        ) : isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} />
                            <span>Delivered</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                            {order.status}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Calendar size={11} />
                        <span>
                          {isDelivered && order.deliveredAt
                            ? `Delivered: ${new Date(order.deliveredAt).toLocaleString()}`
                            : order.shippedAt
                            ? `Assigned: ${new Date(order.shippedAt).toLocaleString()}`
                            : new Date(order.createdAt).toLocaleString()}
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 font-mono block">
                        ৳{Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                      <span
                        className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-0.5 ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus === "PAID"
                          ? "PAID"
                          : `${order.paymentMethod || "COD"} • Collect Cash`}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Address */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
                        <User size={13} className="text-slate-400" />
                        <span>{order.customerName}</span>
                      </div>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-medical-blue-600 font-bold hover:bg-medical-blue-50 transition-colors"
                      >
                        <Phone size={12} />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Delivery Address
                          </span>
                          {loc.hasCoordinates && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-700">
                              GPS PINNED
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-slate-700 leading-snug">
                          {loc.cleanAddress}
                        </p>
                      </div>

                      <a
                        href={loc.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold text-[11px] transition-colors"
                      >
                        <Navigation size={12} />
                        <span>Map</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                      <FileText size={13} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong>Note:</strong> {order.notes}
                      </span>
                    </div>
                  )}

                  {/* Items Summary */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Medicines ({order.items?.length || 0})
                    </span>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      {(order.items || []).map((item) => (
                        <div
                          key={item.id}
                          className="px-3 py-2 flex items-center justify-between text-xs bg-white"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Pill size={12} className="text-medical-blue-500 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">
                              {item.medicine?.name || "Medicine"}
                            </span>
                          </div>
                          <span className="font-bold text-slate-600 shrink-0 ml-2 font-mono">
                            × {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Phone size={13} />
                    <span>Call Customer</span>
                  </a>

                  {isShipped ? (
                    <button
                      onClick={() => setConfirmOrder(order)}
                      disabled={isCompleting}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      <span>Delivery Complete</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                      <CheckCircle2 size={15} />
                      <span>Completed</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <PackageCheck className="w-12 h-12 text-slate-200 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No assigned orders found</h3>
          <p className="text-slate-400 text-sm mt-1">
            There are no assigned orders in <strong>{activeTab}</strong> right now.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
