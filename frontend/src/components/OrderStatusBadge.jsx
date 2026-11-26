"use client";

import { Check, Package, Truck, CheckCircle2, X } from "lucide-react";

export function normalizeOrderStatus(status) {
  const s = String(status || "PENDING").toUpperCase();
  return s === "APPROVED" ? "ACCEPTED" : s;
}

export function OrderStatusBadge({ status }) {
  const s = normalizeOrderStatus(status);
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
