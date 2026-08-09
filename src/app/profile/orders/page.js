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
  X
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Table } from "@/components/Table";
import { 
  getCurrentCustomer, 
  getCustomerOrdersAction, 
  logoutCustomerAction 
} from "@/lib/actions/online-customer.actions";

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Load customer details
  const loadCustomerData = async () => {
    try {
      const data = await getCurrentCustomer();
      if (!data) {
        toast.error("Please sign in to view your orders");
        router.push("/");
        return;
      }
      setCustomer(data);
    } catch (e) {
      toast.error("Failed to load customer profile details");
    } finally {
      setLoadingCustomer(false);
    }
  };

  // Load customer orders
  const loadOrdersData = async () => {
    try {
      const data = await getCustomerOrdersAction();
      setOrders(data || []);
    } catch (e) {
      toast.error("Failed to load orders history");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  useEffect(() => {
    if (customer) {
      loadOrdersData();
    }
  }, [customer]);

  const handleSignOut = async () => {
    try {
      await logoutCustomerAction();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (e) {
      toast.error("Sign out failed");
    }
  };

  const [viewingOrder, setViewingOrder] = useState(null);

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
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    { 
      key: "address", 
      Title: "Delivery", 
      render: (row) => (
        <div className="text-xs text-slate-500 max-w-[200px] truncate mx-auto flex items-center justify-center gap-1" title={row.address}>
          <MapPin size={12} className="text-slate-400" />
          {row.address}
        </div>
      )
    },
    { 
      key: "totalAmount", 
      Title: "Amount", 
      render: (row) => <span className="text-xs font-bold text-slate-800 font-mono">৳{row.totalAmount}</span>
    },
    { 
      key: "status", 
      Title: "Status", 
      render: (row) => (
        row.status === "PENDING" ? (
          <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Reviewing
          </span>
        ) : row.status === "APPROVED" ? (
          <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle size={12} className="text-emerald-500" />
            Approved
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            <XCircle size={12} className="text-red-500" />
            Rejected
          </span>
        )
      )
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

  if (loadingCustomer) {
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
                    {viewingOrder.status === "PENDING" ? (
                      <span className="inline-flex items-center gap-1.5 font-black text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <span>Pending Approval</span>
                      </span>
                    ) : viewingOrder.status === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1.5 font-black text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle size={12} className="text-emerald-500" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-black text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                        <XCircle size={12} className="text-red-500" />
                        <span>Rejected</span>
                      </span>
                    )}
                  </div>
                </div>

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
                        {viewingOrder.items.map((item, idx) => (
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
                  <div className="bg-white p-3 rounded-xl border border-slate-200/50 space-y-1.5">
                    <div className="flex items-start gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">
                        Shipping Location:<br/>
                        <strong className="text-slate-700 font-bold">{viewingOrder.address}</strong>
                      </span>
                    </div>
                    {viewingOrder.notes && (
                      <div className="flex items-start gap-1.5 text-slate-500 border-t border-slate-100 pt-1.5 mt-1.5">
                        <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>Notes: <em className="text-slate-600">{viewingOrder.notes}</em></span>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={14} className="text-slate-400" />
                        <span>Payment Method:</span>
                      </span>
                      <span className="font-extrabold text-slate-700">Cash on Delivery</span>
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
