'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Calendar,
  X,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { Table } from "@/components/Table";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import InputField from "@/components/InputField";
import Dropdown from "@/components/Dropdown";
import toast from "react-hot-toast";
import { getAllPrescriptionOrders, updatePrescriptionOrderStatus } from "@/lib/actions/prescription.actions";

export default function PrescriptionOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal states
  const [viewingOrder, setViewingOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllPrescriptionOrders({ status: filterStatus });
      setOrders(data || []);
    } catch (error) {
      toast.error("Failed to fetch prescription orders");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      await updatePrescriptionOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.customer?.phone?.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower)
      );
    });
  }, [orders, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>;
      case "APPROVED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">Approved</span>;
      case "REJECTED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">Rejected</span>;
      default:
        return status;
    }
  };

  const columns = useMemo(() => [
    { key: "id", Title: "Order ID", width: "10%", render: (row) => (
      <span className="text-xs font-mono text-slate-500">{row.id.slice(-4)}</span>
    )},
    { key: "customer", Title: "Customer", width: "20%", render: (row) => (
      <div>
        <p className="font-bold text-slate-800 text-sm">{row.customer?.name || "Unknown"}</p>
      </div>
    )},

    {
      key:'phone',
      Title:'Phone',
      width:'20%',
      render:(row)=>(
        <div>
          <span className="text-xs font-semibold text-slate-600 block">{row.customer?.phone}</span>
        </div>
      )
    },
    { key: "createdAt", Title: "Date", width: "20%", render: (row) => (
      <div>
        <span className="text-xs font-semibold text-slate-600 block">{new Date(row.createdAt).toLocaleDateString()}</span>
      </div>
    )},
    { key: "status", Title: "Status", width: "15%", render: (row) => getStatusBadge(row.status) },
    { key: "actions", Title: "Actions", width: "25%", sortable: false, render: (row) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setViewingOrder(row)}
          className="px-2.5 py-1.5 text-xs font-bold bg-medical-blue-50 text-medical-blue-600 hover:bg-medical-blue-100 rounded-lg transition-colors flex items-center gap-1"
        >
          <Eye size={14} /> View
        </button>
        {row.status === "PENDING" && (
          <>
            <button 
              onClick={() => handleStatusChange(row.id, "APPROVED")}
              disabled={isUpdating}
              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
              title="Approve"
            >
              <CheckCircle size={16} />
            </button>
            <button 
              onClick={() => handleStatusChange(row.id, "REJECTED")}
              disabled={isUpdating}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Reject"
            >
              <XCircle size={16} />
            </button>
          </>
        )}
      </div>
    )},
  ], [isUpdating]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescription Orders</h1>
          <p className="text-slate-500 text-sm mt-1">Review and process uploaded prescriptions from online customers.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex-1">
            <InputField 
              placeholder="Search by customer name or phone..." 
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <Dropdown 
                className="w-48"
                options={["ALL", "PENDING", "APPROVED", "REJECTED"]}
                value={filterStatus}
                onSelect={(val) => setFilterStatus(val)}
             />
          </div>
        </div>

        {/* Table */}
        <Table 
          TableHeads={columns} 
          TableRows={filteredOrders}
          isLoading={isLoading}
        />
      </Card>

      {/* VIEW MODAL */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Left side: Document Viewer */}
            <div className="flex-1 bg-slate-100 flex items-center justify-center relative p-4 border-r border-slate-200 min-h-[50vh] md:min-h-full">
              {viewingOrder.prescriptionFile.includes("application/pdf") ? (
                <iframe src={viewingOrder.prescriptionFile} className="w-full h-full min-h-[60vh] rounded-xl border border-slate-200 bg-white shadow-sm" title="PDF Preview" />
              ) : (
                <img src={viewingOrder.prescriptionFile} alt="Prescription" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-sm border border-slate-200 bg-white" />
              )}
            </div>

            {/* Right side: Details panel */}
            <div className="w-full md:w-96 flex flex-col bg-white overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-medical-blue-600" />
                  Order Details
                </h3>
                <button 
                  onClick={() => setViewingOrder(null)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-6">
                
                {/* Status Header */}
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Current Status</span>
                  {getStatusBadge(viewingOrder.status)}
                </div>

                {/* Actions */}
                {viewingOrder.status === "PENDING" && (
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleStatusChange(viewingOrder.id, "APPROVED")}
                      disabled={isUpdating}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                      <CheckCircle size={16} /> Approve
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange(viewingOrder.id, "REJECTED")}
                      disabled={isUpdating}
                      variant="outline"
                      className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 border-red-200"
                    >
                      <XCircle size={16} /> Reject
                    </Button>
                  </div>
                )}

                {/* Customer Info */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Customer Information</h4>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">Full Name</p>
                      <p className="font-bold text-slate-800 text-sm">{viewingOrder.customer?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-medical-blue-500" />
                      <p className="font-semibold text-slate-700 text-sm">{viewingOrder.customer?.phone}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-medical-blue-500 mt-0.5" />
                      <p className="font-semibold text-slate-700 text-sm leading-relaxed">{viewingOrder.customer?.address || "No address provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Prescription Request</h4>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-medical-blue-500" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Uploaded on {new Date(viewingOrder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-medical-blue-500" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Duration: <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{viewingOrder.durationDays}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {viewingOrder.notes && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Customer Notes</h4>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100/50">
                      <p className="text-sm font-medium text-amber-900 italic leading-relaxed">"{viewingOrder.notes}"</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
