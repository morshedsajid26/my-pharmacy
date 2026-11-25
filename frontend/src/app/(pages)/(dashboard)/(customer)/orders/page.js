'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ShoppingBag,
  FileText,
  Package,
  Calendar,
  CreditCard,
  Eye,
  X,
  Navigation,
  ExternalLink,
  Truck,
  Phone,
  Check
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Table } from "@/components/Table";
import { useAuth } from "@/context/AuthContext";
import { useCustomerOrders } from "@/hooks/useCustomerPortal";
import { parseLocationFromAddress } from "@/lib/locationUtils";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, loading: loadingCustomer, logoutCustomer } = useAuth();
  const { orders, isLoading: loadingOrders } = useCustomerOrders();

  useEffect(() => {
    if (!loadingCustomer && !customer) {
      router.replace("/login");
    }
  }, [customer, loadingCustomer, router]);

  const handleSignOut = async () => {
    try {
      await logoutCustomer();
    } catch (e) {
      toast.error("Sign out failed");
    }
  };

  const [viewingOrder, setViewingOrder] = useState(null);

  const renderStatusBadge = (status) => {
    const s = String(status || "PENDING").toUpperCase();
    if (s === "PENDING") {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending
        </span>
      );
    }
    if (s === "ACCEPTED" || s === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          <Check size={12} className="text-blue-600" />
          Accepted
        </span>
      );
    }
    if (s === "PACKED") {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
          <Package size={12} className="text-indigo-600" />
          Packed
        </span>
      );
    }
    if (s === "SHIPPED") {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
          <Truck size={12} className="text-sky-600" />
          Shipped
        </span>
      );
    }
    if (s === "DELIVERED") {
      return (
        <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <CheckCircle size={12} className="text-emerald-600" />
          Delivered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
        <XCircle size={12} className="text-red-500" />
        Rejected
      </span>
    );
  };

  const tableHeads = [
    { 
      key: "orderNo", 
      Title: "Order No", 
      render: (row) => <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{row.orderNo}</span>
    },
    { 
      key: "createdAt", 
      Title: "Date", 
      render: (row) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 justify-center">
          <Calendar size={14} className="text-slate-400" />
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
        </div>
      )
    },
    { 
      key: "address", 
      Title: "Delivery", 
      render: (row) => {
        const loc = parseLocationFromAddress(row.address);
        return (
          <a
            href={loc.directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-medical-blue-600 max-w-[200px] mx-auto transition-colors font-medium"
            title="Click to view Google Maps Directions"
          >
            <Navigation size={12} className="text-medical-blue-500 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="truncate group-hover:underline underline-offset-2">{loc.cleanAddress}</span>
            {loc.hasCoordinates && (
              <span className="px-1 py-0.2 rounded text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                GPS
              </span>
            )}
          </a>
        );
      }
    },
    { 
      key: "totalAmount", 
      Title: "Amount", 
      render: (row) => <span className="text-xs font-bold text-slate-800 font-mono">৳{row.totalAmount}</span>
    },
    {
      key: "payment",
      Title: "Payment",
      render: (row) => (
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{row.paymentMethod || "COD"}</span>
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${row.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : row.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
            {row.paymentStatus || "UNPAID"}
          </span>
        </div>
      )
    },
    { 
      key: "status", 
      Title: "Status", 
      render: (row) => renderStatusBadge(row.status)
    },
    { 
      key: "actions", 
      Title: "Actions", 
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setViewingOrder(row)}
            className="p-2 rounded-xl bg-medical-blue-50 hover:bg-medical-blue-100 text-medical-blue-600 transition-colors shadow-sm cursor-pointer"
            title="View Order Details"
          >
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loadingCustomer || !customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600 mb-2" />
        <span className="text-slate-500 font-bold text-sm">Loading your orders portal...</span>
      </div>
    );
  }

  return (
    <div className=" mx-auto w-full">
      <Toaster position="top-center" />
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">My Orders History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track your past and active orders from the online store.</p>
            </div>
          </div>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600 mb-2" />
                <span className="text-slate-400 text-xs font-bold">Retrieving order database...</span>
              </div>
            ) : orders.length > 0 ? (
              <div className="mt-6">
                <Table 
                  TableHeads={tableHeads} 
                  TableRows={orders} 
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-slate-200 rounded-3xl">
                <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="font-extrabold text-slate-700 text-sm">No order history found</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-[240px]">
                  You haven't placed any online medicine orders yet. Visit the catalog and build your cart!
                </p>
                <Link 
                  href="/shop"
                  className="mt-6 px-6 py-2.5 rounded-xl bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold text-xs transition-all shadow-md"
                >
                  Start Shopping
                </Link>
              </div>
            )}
        </div>
      </div>

      {/* VIEW ORDER MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Package size={18} className="text-medical-blue-600" />
                Order Details
              </h3>
              <button 
                onClick={() => setViewingOrder(null)}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 sm:p-6 space-y-4">
                
                {/* Header: Order No, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
                      <Package size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">{viewingOrder.orderNo}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                        <Calendar size={12} />
                        <span>Ordered: {new Date(viewingOrder.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(viewingOrder.status)}
                  </div>
                </div>

                {/* Live Order Status Tracker */}
                {viewingOrder.status !== "REJECTED" && (() => {
                  const steps = ["PENDING", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED"];
                  const normalized = viewingOrder.status === "APPROVED" ? "ACCEPTED" : viewingOrder.status;
                  const currentIdx = Math.max(0, steps.indexOf(normalized));
                  return (
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-2.5">
                      <div className="grid grid-cols-5 gap-1">
                        {steps.map((step, idx) => {
                          const done = idx <= currentIdx;
                          return (
                            <div key={step} className="flex flex-col items-center text-center gap-1.5">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                  done
                                    ? "bg-medical-blue-600 border-medical-blue-600 text-white"
                                    : "bg-slate-50 border-slate-200 text-slate-400"
                                }`}
                              >
                                {done ? <Check size={12} /> : idx + 1}
                              </div>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-tight ${
                                  done ? "text-medical-blue-700" : "text-slate-400"
                                }`}
                              >
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {viewingOrder.assignedStaff && (
                        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                            <Truck size={13} className="text-sky-600" />
                            <span>Delivery Person:</span>
                            <strong className="text-slate-900">{viewingOrder.assignedStaff.name}</strong>
                          </span>
                          {viewingOrder.assignedStaff.phone && (
                            <a
                              href={`tel:${viewingOrder.assignedStaff.phone}`}
                              className="inline-flex items-center gap-1 font-bold text-medical-blue-600 hover:underline"
                            >
                              <Phone size={12} />
                              <span>{viewingOrder.assignedStaff.phone}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Ordered Items detailed receipt grid */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    Ordered Items:
                  </span>
                  <div className="bg-white rounded-xl border border-slate-200/50 overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                          <th className="p-3">Medicine Name</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        {(viewingOrder.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3">{item.medicine?.name || "Unknown Medicine"}</td>
                            <td className="p-3 text-center text-slate-500">{item.quantity}</td>
                            <td className="p-3 text-right text-slate-500">৳{Number(item.unitPrice).toFixed(2)}</td>
                            <td className="p-3 text-right">৳{(item.unitPrice * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Delivery metadata & summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                  
                  {/* Shipping Info */}
                  {(() => {
                    const loc = parseLocationFromAddress(viewingOrder.address);
                    return (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/50 space-y-2">
                        <div className="flex items-start gap-2 text-slate-500">
                          <MapPin size={15} className="text-medical-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Shipping Location:
                            </span>
                            <strong className="text-slate-800 font-bold block leading-relaxed">{loc.cleanAddress}</strong>
                            {loc.hasCoordinates && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>GPS: {loc.latitude?.toFixed(5)}, {loc.longitude?.toFixed(5)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="pt-1">
                          <a
                            href={loc.directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-medical-blue-50 hover:bg-medical-blue-100 text-medical-blue-700 font-bold text-xs transition-colors"
                          >
                            <Navigation size={12} />
                            <span>Map Directions</span>
                            <ExternalLink size={11} />
                          </a>
                        </div>
                        {viewingOrder.notes && (
                          <div className="flex items-start gap-1.5 text-slate-500 border-t border-slate-100 pt-1.5 mt-1.5">
                            <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>Notes: <em className="text-slate-600">{viewingOrder.notes}</em></span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Payment Summary */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={14} className="text-slate-400" />
                        <span>Payment Method:</span>
                      </span>
                      <span className="font-extrabold text-slate-700 text-[11px]">{viewingOrder.paymentMethod === 'SSLCOMMERZ' ? 'SSLCOMMERZ (Online)' : 'Cash on Delivery'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-slate-500 mt-2">
                      <span className="flex items-center gap-1.5">
                        <span>Payment Status:</span>
                      </span>
                      <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded border ${viewingOrder.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : viewingOrder.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {viewingOrder.paymentStatus || "UNPAID"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      <span className="font-bold text-slate-500">Total Invoice Amount:</span>
                      <span className="font-black text-slate-900 text-lg">৳{viewingOrder.totalAmount}</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
