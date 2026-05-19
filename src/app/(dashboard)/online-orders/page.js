'use client';

import { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  Clock, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  FileText, 
  Calendar,
  Eye, 
  RefreshCw,
  AlertCircle,
  Package,
  User,
  Loader2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { 
  getOnlineOrdersAction, 
  approveOnlineOrderAction, 
  rejectOnlineOrderAction 
} from "@/lib/actions/online-admin.actions";

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // "PENDING" | "APPROVED" | "REJECTED" | "ALL"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: null, orderId: null, orderNo: "" });

  // Fetch orders from server action
  const loadOrders = async () => {
    setLoading(true);
    try {
      // Pass null to fetch all, otherwise pass status
      const statusFilter = activeTab === "ALL" ? null : activeTab;
      const data = await getOnlineOrdersAction(statusFilter);
      setOrders(data);
    } catch (error) {
      toast.error("Failed to load online orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  // Non-blocking state triggers
  const handleApprove = (orderId, orderNo = "") => {
    const orderNum = orderNo || orders.find(o => o.id === orderId)?.orderNo || selectedOrder?.orderNo || "Order";
    setConfirmAction({ type: "APPROVE", orderId, orderNo: orderNum });
  };

  const handleReject = (orderId, orderNo = "") => {
    const orderNum = orderNo || orders.find(o => o.id === orderId)?.orderNo || selectedOrder?.orderNo || "Order";
    setConfirmAction({ type: "REJECT", orderId, orderNo: orderNum });
  };

  // Execution actions
  const executeApprove = async (orderId) => {
    setConfirmAction({ type: null, orderId: null, orderNo: "" });
    setActionLoading(true);
    try {
      const result = await approveOnlineOrderAction(orderId);
      if (result.success) {
        toast.success(`Order approved! Invoice ${result.invoiceNo} registered.`);
        setSelectedOrder(null);
        loadOrders();
      }
    } catch (error) {
      toast.error(error.message || "Failed to approve order");
    } finally {
      setActionLoading(false);
    }
  };

  const executeReject = async (orderId) => {
    setConfirmAction({ type: null, orderId: null, orderNo: "" });
    setActionLoading(true);
    try {
      const result = await rejectOnlineOrderAction(orderId);
      if (result.success) {
        toast.success("Order has been rejected successfully");
        setSelectedOrder(null);
        loadOrders();
      }
    } catch (error) {
      toast.error(error.message || "Failed to reject order");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-medical-blue-600 w-7 h-7" />
            <span>Online Orders</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor, approve, or reject customer e-commerce orders. Approved orders automatically sync with stock & POS.
          </p>
        </div>

        <button 
          onClick={loadOrders}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-sm font-bold text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Reload</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-slate-200 pb-px">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3.5 font-bold text-sm border-b-2 -mb-px transition-all relative ${
              activeTab === tab 
                ? "border-medical-blue-600 text-medical-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{tab === "PENDING" ? "Pending Approval" : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
            {tab === "PENDING" && orders.length > 0 && activeTab !== "PENDING" && (
              <span className="absolute top-2.5 right-2 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
            <p className="text-slate-400 font-semibold text-sm">Fetching online orders...</p>
          </div>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-extrabold text-xs tracking-wider uppercase border-b border-slate-100">
                  <th className="px-6 py-4">Order No</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-600 font-medium">
                    <td className="px-6 py-4.5 font-bold text-slate-900">{order.orderNo}</td>
                    <td className="px-6 py-4.5">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">{order.customerName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone size={12} />
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 max-w-xs truncate" title={order.address}>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        <span className="truncate">{order.address}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 font-black text-slate-800">৳{order.totalAmount}</td>
                    <td className="px-6 py-4.5">
                      {order.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-150">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
                          <span>Pending</span>
                        </span>
                      ) : order.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-150">
                          <Check size={12} />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-150">
                          <X size={12} />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {order.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(order.id)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                              title="Approve Order"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Reject Order"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No orders found</h3>
          <p className="text-slate-400 text-sm mt-1">There are no orders matching status: <strong>{activeTab}</strong></p>
        </div>
      )}

      {/* DETAILS VIEW MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />

          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col justify-between shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-extrabold text-slate-900">Order {selectedOrder.orderNo} Details</h3>
                <p className="text-xs text-slate-400">Placed: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Delivery Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Customer Details</h4>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm font-extrabold text-slate-800">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{selectedOrder.customerPhone}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Delivery Details</h4>
                  <div className="flex items-start gap-1.5">
                    <MapPin size={14} className="text-slate-400 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-600 leading-tight">{selectedOrder.address}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="flex items-start gap-1.5 pt-1">
                      <FileText size={14} className="text-slate-400 mt-0.5" />
                      <span className="text-xs text-slate-500 leading-tight"><em>Notes: {selectedOrder.notes}</em></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ordered Items</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-50">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 bg-white flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-800 truncate">{item.medicine.name}</div>
                        <div className="text-xs text-slate-400">{item.medicine.company} • {item.medicine.category}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">৳{item.unitPrice} × {item.quantity}</span>
                        <span className="font-bold text-slate-800 w-16 text-right">৳{item.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Calculations Breakdown */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold font-mono">৳{(selectedOrder.subtotal ?? selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Delivery Charge:</span>
                  {(selectedOrder.deliveryCharge ?? 0) === 0 ? (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">FREE</span>
                  ) : (
                    <span className="font-bold font-mono">৳{(selectedOrder.deliveryCharge ?? 0).toFixed(2)}</span>
                  )}
                </div>
                {(selectedOrder.discount ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>Discount applied:</span>
                    <span className="font-bold text-emerald-600 font-mono">-৳{(selectedOrder.discount ?? 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/65 text-sm font-extrabold text-slate-800">
                  <span>Final Total Amount:</span>
                  <span className="text-base font-black text-slate-900 font-mono">৳{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Stock Warning Indicators (Only for PENDING status) */}
              {selectedOrder.status === "PENDING" && (
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => {
                    const isLowStock = item.medicine.stock < item.quantity;
                    if (isLowStock) {
                      return (
                        <div key={item.id} className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs font-semibold">
                          <AlertCircle size={14} />
                          <span>Warning: {item.medicine.name} only has {item.medicine.stock} left in stock. (Ordered: {item.quantity})</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary & Action Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-400">Total Order Amount:</span>
                <span className="text-2xl font-black text-slate-900 font-mono">৳{selectedOrder.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all"
                >
                  Close
                </button>

                {selectedOrder.status === "PENDING" && (
                  <>
                    <button 
                      onClick={() => handleReject(selectedOrder.id)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold text-sm transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X size={16} />}
                      <span>Reject</span>
                    </button>

                    <button 
                      onClick={() => handleApprove(selectedOrder.id)}
                      disabled={actionLoading}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/10 disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check size={16} />}
                      <span>Approve & Sync POS</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BEAUTIFUL CUSTOM CONFIRMATION MODAL */}
      {confirmAction.type && (
        <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={() => setConfirmAction({ type: null, orderId: null, orderNo: "" })} 
          />
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl z-10 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              confirmAction.type === "APPROVE" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}>
              {confirmAction.type === "APPROVE" ? <Check size={24} /> : <X size={24} />}
            </div>
            
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
              {confirmAction.type === "APPROVE" ? "Approve Online Order" : "Reject Online Order"}
            </h3>
            
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {confirmAction.type === "APPROVE" 
                ? `Are you sure you want to approve order ${confirmAction.orderNo}? This will automatically deduct stock and record a standard POS sale.` 
                : `Are you sure you want to reject order ${confirmAction.orderNo}?`
              }
            </p>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setConfirmAction({ type: null, orderId: null, orderNo: "" })}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === "APPROVE") {
                    executeApprove(confirmAction.orderId);
                  } else {
                    executeReject(confirmAction.orderId);
                  }
                }}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-all shadow-md ${
                  confirmAction.type === "APPROVE" 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10" 
                    : "bg-red-600 hover:bg-red-700 shadow-red-600/10"
                }`}
              >
                {confirmAction.type === "APPROVE" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
