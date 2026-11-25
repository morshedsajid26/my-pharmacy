"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Pill,
  PackageCheck,
  Truck,
  CheckCircle2,
  Phone,
  Navigation,
  ExternalLink,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useStaffDashboard, useStaffAssignedOrders } from "@/hooks/useOnlineOrders";
import { parseLocationFromAddress } from "@/lib/locationUtils";

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading, refetch } = useStaffDashboard();
  const { completeDelivery, isCompleting } = useStaffAssignedOrders("SHIPPED");

  const [confirmDeliverOrder, setConfirmDeliverOrder] = useState(null);

  const handleConfirmDeliver = async () => {
    if (!confirmDeliverOrder) return;
    try {
      await completeDelivery(confirmDeliverOrder.id);
      setConfirmDeliverOrder(null);
      refetch();
    } catch {
      // Handled in hook
    }
  };

  const recentAssigned = Array.isArray(stats?.recentAssignedOrders)
    ? stats.recentAssignedOrders
    : [];

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Welcome Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-200/70 mb-2">
            <LayoutDashboard size={12} />
            <span>Staff Dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.name || "Staff Member"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage walk-in POS sales, check medicine inventory, and complete your assigned online deliveries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={refetch}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <Link
            href="/sales"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <ShoppingCart size={14} />
            <span>New POS Sale</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Deliveries</p>
            <p className="text-3xl font-black text-sky-700 font-mono mt-1">
              {stats?.activeAssignedCount ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Assigned &amp; Shipped</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Truck size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivered Today</p>
            <p className="text-3xl font-black text-emerald-700 font-mono mt-1">
              {stats?.deliveredTodayCount ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Total delivered: {stats?.totalDeliveredCount ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today&apos;s POS Sales</p>
            <p className="text-3xl font-black text-slate-900 font-mono mt-1">
              {stats?.todaySalesCount ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              ৳{Number(stats?.todaySalesAmount || 0).toFixed(0)} billed today
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicines Catalog</p>
            <p className="text-3xl font-black text-slate-900 font-mono mt-1">
              {stats?.totalMedicinesCount ?? 0}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold mt-1">
              {stats?.lowStockCount ?? 0} low stock items
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Pill size={24} />
          </div>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/sales"
          className="group bg-white rounded-2xl border border-slate-200/90 hover:border-medical-blue-400 hover:shadow-md p-5 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Sales (POS)</h3>
              <p className="text-xs text-slate-500">Create walk-in customer bills</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-medical-blue-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/medicines"
          className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 hover:shadow-md p-5 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Pill size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Medicines</h3>
              <p className="text-xs text-slate-500">Check stock, generics &amp; prices</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/assigned-orders"
          className="group bg-white rounded-2xl border border-slate-200/90 hover:border-sky-400 hover:shadow-md p-5 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <PackageCheck size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Assigned Orders</h3>
              <p className="text-xs text-slate-500">Deliver &amp; mark orders complete</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Active Assigned Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Truck size={18} className="text-sky-600" />
              <span>Your Active Assigned Deliveries</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Orders currently shipped and assigned to you for delivery.
            </p>
          </div>
          <Link
            href="/assigned-orders"
            className="text-xs font-bold text-medical-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {isLoading ? (
          <div className="h-44 flex items-center justify-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin text-medical-blue-600" />
          </div>
        ) : recentAssigned.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentAssigned.map((order) => {
              const loc = parseLocationFromAddress(order.address);
              return (
                <div
                  key={order.id}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">{order.orderNo}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        SHIPPED
                      </span>
                      <span className="text-xs font-black text-slate-800 font-mono">
                        ৳{Number(order.totalAmount || 0).toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {order.paymentStatus === "PAID" ? "PAID" : `${order.paymentMethod || "COD"} - Collect Cash`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="font-bold text-slate-800">{order.customerName}</span>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="inline-flex items-center gap-1 font-semibold text-medical-blue-600 hover:underline"
                      >
                        <Phone size={12} />
                        <span>{order.customerPhone}</span>
                      </a>
                    </div>

                    <a
                      href={loc.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-medical-blue-600 font-medium"
                    >
                      <Navigation size={12} className="text-medical-blue-600 shrink-0" />
                      <span className="truncate max-w-md">{loc.cleanAddress}</span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={loc.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Navigation size={13} />
                      <span>Navigate</span>
                    </a>
                    <button
                      onClick={() => setConfirmDeliverOrder(order)}
                      disabled={isCompleting}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      <span>Delivery Complete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-14 text-center text-slate-400">
            <PackageCheck className="w-10 h-10 mx-auto text-slate-200 mb-2" />
            <p className="text-sm font-bold text-slate-700">No active deliveries right now</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Orders assigned to you by the owner will appear here automatically.
            </p>
          </div>
        )}
      </div>

      {/* Confirm Delivery Complete Modal */}
      {confirmDeliverOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setConfirmDeliverOrder(null)}
          />
          <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Complete Delivery?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Confirm you have handed over order <strong>{confirmDeliverOrder.orderNo}</strong> to{" "}
                <strong>{confirmDeliverOrder.customerName}</strong>
                {confirmDeliverOrder.paymentStatus !== "PAID"
                  ? ` and collected ৳${Number(confirmDeliverOrder.totalAmount || 0).toFixed(2)}.`
                  : "."}
              </p>
            </div>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDeliverOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeliver}
                disabled={isCompleting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {isCompleting ? "Updating..." : "Yes, Delivered"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
