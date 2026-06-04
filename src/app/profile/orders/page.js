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
  ArrowLeft,
  PlusCircle,
  LogOut,
  FileText,
  Package,
  Calendar,
  CreditCard
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
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

  if (loadingCustomer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600 mb-2" />
        <span className="text-slate-500 font-bold text-sm">Loading your orders portal...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Toaster position="top-center" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-medical-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <PlusCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                S&S<span className="text-medical-blue-600">Pharmacy</span>
              </h1>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mt-1 block">
                Customer Orders Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
            >
              <ArrowLeft size={14} />
              <span>Back to Shop</span>
            </Link>

            <button 
              onClick={handleSignOut}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all border border-red-100 flex items-center gap-1.5 font-bold text-xs sm:text-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* PROFILE SIDEBAR & ORDERS GRID LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
        <aside className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Account Menu
            </div>
            
            <Link 
              href="/profile"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all border border-transparent"
            >
              <User size={16} />
              <span>Personal Details</span>
            </Link>

            <Link 
              href="/profile/orders"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-medical-blue-50 text-medical-blue-700 transition-all border border-medical-blue-100/50"
            >
              <ShoppingBag size={16} />
              <span>My Orders History</span>
            </Link>

            <Link 
              href="/profile/prescriptions"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all border border-transparent"
            >
              <FileText size={16} />
              <span>Prescription Orders</span>
            </Link>
          </div>
        </aside>

        {/* RIGHT COLUMN: ORDERS STATUS LIST TRACKER */}
        <section className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-6 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Live Order History</h2>
                <p className="text-xs text-slate-400 mt-0.5">Track your pending shipments and view full receipt details.</p>
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600 mb-2" />
                <span className="text-slate-400 text-xs font-bold">Retrieving order database...</span>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-slate-50 rounded-2xl border border-slate-200/60 p-4 sm:p-6 space-y-4 hover:border-slate-300 transition-colors"
                  >
                    
                    {/* Header: Order No, Date, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
                          <Package size={18} />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">{order.orderNo}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                            <Calendar size={12} />
                            <span>Ordered: {new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {order.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1.5 font-black text-xs text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            <span>Pending Approval</span>
                          </span>
                        ) : order.status === "APPROVED" ? (
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
                              <th className="p-3 text-right">Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {order.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-3">{item.medicine?.name || "Unknown Medicine"}</td>
                                <td className="p-3 text-center text-slate-500">{item.quantity}</td>
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
                            <strong className="text-slate-700 font-bold">{order.address}</strong>
                          </span>
                        </div>
                        {order.notes && (
                          <div className="flex items-start gap-1.5 text-slate-500 border-t border-slate-100 pt-1.5 mt-1.5">
                            <FileText size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>Notes: <em className="text-slate-600">{order.notes}</em></span>
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
                          <span className="font-black text-slate-900 text-lg">৳{order.totalAmount}</span>
                        </div>
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-slate-200 rounded-3xl">
                <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
                <h3 className="font-extrabold text-slate-700 text-sm">No order history found</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-[240px]">
                  You haven't placed any online medicine orders yet. Visit the catalog and build your cart!
                </p>
                <Link 
                  href="/"
                  className="mt-6 px-6 py-2.5 rounded-xl bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold text-xs transition-all shadow-md"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
