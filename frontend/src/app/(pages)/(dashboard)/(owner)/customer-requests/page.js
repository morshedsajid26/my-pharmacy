'use client';

import { useEffect, useState, useMemo } from "react";
import { Heart, RefreshCw, Loader2, Phone, User, Package, Clock } from "lucide-react";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { getMedicineRequestsAdminAction } from "@/lib/actions/online-customer.actions";
import toast from "react-hot-toast";

export default function CustomerRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await getMedicineRequestsAdminAction();
      setRequests(data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  // Compute metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const uniqueCustomers = new Set(requests.map(r => r.customerId)).size;
    
    // Find most requested item
    const counts = {};
    requests.forEach(r => {
      const name = r.medicine.name;
      counts[name] = (counts[name] || 0) + 1;
    });
    let mostRequested = "None";
    let maxCount = 0;
    Object.entries(counts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostRequested = `${name} (${count} reqs)`;
      }
    });

    return { total, uniqueCustomers, mostRequested };
  }, [requests]);

  const requestColumns = useMemo(() => [
    {
      key: "medicine",
      Title: "Medicine Details",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.medicine.name}</span>
          <span className="text-xs text-slate-500">{row.medicine.company} • {row.medicine.category}</span>
        </div>
      )
    },
    {
      key: "stock",
      Title: "Active Stock",
      render: (row) => (
        <span className={`font-bold ${row.medicine.stock < 2 ? "text-red-500" : "text-emerald-600"}`}>
          {row.medicine.stock} units
        </span>
      )
    },
    {
      key: "customer",
      Title: "Requesting Customer",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <User size={12} className="text-slate-400" />
            {row.customer.name}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone size={12} className="text-slate-400" />
            {row.customer.phone}
          </span>
        </div>
      )
    },
    {
      key: "createdAt",
      Title: "Requested At",
      render: (row) => (
        <span className="text-slate-500 text-sm flex items-center gap-1">
          <Clock size={12} className="text-slate-400" />
          {new Date(row.createdAt).toLocaleString()}
        </span>
      )
    }
  ], []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="text-red-500 fill-red-500" size={24} />
            Customer Restock Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track out-of-stock items requested by online customers</p>
        </div>
        <button
          onClick={loadRequests}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-slate-100 shadow-sm relative overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.total}</h3>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
              <Heart size={24} className="fill-red-100" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm relative overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unique Customers</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{metrics.uniqueCustomers}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
              <User size={24} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm relative overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Requested</p>
              <h3 className="text-base font-bold text-slate-800 mt-2 truncate max-w-[200px]" title={metrics.mostRequested}>
                {metrics.mostRequested}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
          <p className="font-semibold animate-pulse text-sm">Loading wishlist requests...</p>
        </div>
      ) : requests.length > 0 ? (
        <Card title="Restock Request Logs">
          <div className="mt-4">
            <Table TableHeads={requestColumns} TableRows={requests} />
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 bg-white border-slate-100 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <Heart size={40} className="text-slate-300 animate-pulse" />
          </div>
          <p className="text-lg font-bold text-slate-900">No active restock requests</p>
          <p className="text-sm text-slate-500">When online customers request out-of-stock items, they will appear here.</p>
        </Card>
      )}
    </div>
  );
}
