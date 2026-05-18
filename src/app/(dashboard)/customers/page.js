'use client';

import { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  DollarSign, 
  Loader2, 
  UserCheck, 
  ShieldCheck, 
  Smartphone,
  Edit2
} from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import InputField from "@/components/InputField";
import { useCustomers } from "@/hooks/useCustomers";
import toast from "react-hot-toast";

// Unified design summary card to match dashboard page
const StatCard = ({ title, value, icon: IconComponent, gradientFrom, gradientTo, isCurrency = false }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/50 hover:translate-y-[-4px] transition-all duration-300 group flex items-center justify-between">
    <div className="space-y-2">
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
        {isCurrency
          ? `৳${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : Number(value || 0).toLocaleString()}
      </h3>
    </div>
    <div
      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradientFrom} ${gradientTo} flex items-center justify-center shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
    >
      <IconComponent size={22} className="text-white" />
    </div>
  </div>
);

export default function CustomersPage() {
  const { customers, isLoading, addCustomer, updateCustomer, isAdding, isUpdating } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Registration Modal state
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", phone: "", email: "", status: "Regular" });

  // Edit Modal state
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", email: "", status: "Regular" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  // Statistical calculations
  const stats = useMemo(() => {
    const total = customers.length;
    const vipCount = customers.filter(c => c.status === "VIP").length;
    const regularCount = customers.filter(c => c.status === "Regular").length;
    const averageSpent = total > 0 ? customers.reduce((acc, c) => acc + c.totalSpent, 0) / total : 0;
    return { total, vipCount, regularCount, averageSpent };
  }, [customers]);

  const handleRegister = async () => {
    if (!regForm.name || !regForm.phone) {
      toast.error("Name and Phone Number are required!");
      return;
    }
    try {
      await addCustomer(regForm);
      setIsRegModalOpen(false);
      setRegForm({ name: "", phone: "", email: "", status: "Regular" });
    } catch (err) {}
  };

  const handleEdit = async () => {
    if (!editForm.name || !editForm.phone) {
      toast.error("Name and Phone Number are required!");
      return;
    }
    try {
      await updateCustomer({
        id: editingCustomer.id,
        data: editForm
      });
      setIsEditModalOpen(false);
      setEditingCustomer(null);
    } catch (err) {}
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setEditForm({
      name: cust.name,
      phone: cust.phone,
      email: cust.email || "",
      status: cust.status
    });
    setIsEditModalOpen(true);
  };

  const columns = useMemo(() => [
    {
      key: "name",
      Title: "Customer Name",
      width: "20%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-medical-blue-50 flex items-center justify-center font-bold text-medical-blue-600 shrink-0">
            {row.name.charAt(0)}
          </div>
          <span className="font-bold text-slate-900">{row.name}</span>
        </div>
      )
    },
    {
      key: "phone",
      Title: "Phone Number",
      width: "15%",
      render: (row) => (
        <span className="text-slate-600 font-semibold flex items-center gap-1.5">
          <Smartphone size={14} className="text-slate-400" />
          <span>{row.phone}</span>
        </span>
      )
    },
    {
      key: "status",
      Title: "Status",
      width: "10%",
      render: (row) => (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          row.status === "VIP" 
            ? "bg-purple-50 text-purple-600 border border-purple-100" 
            : row.status === "Credit" 
            ? "bg-amber-50 text-amber-600 border border-amber-100" 
            : "bg-slate-50 text-slate-600 border border-slate-200"
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: "totalSpent",
      Title: "Total Spent",
      width: "15%",
      render: (row) => <span className="font-mono font-bold text-slate-800">৳{row.totalSpent?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    },
    {
      key: "dueAmount",
      Title: "Dues Balance",
      width: "15%",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
          row.dueAmount > 0 
            ? "text-rose-600 font-black bg-rose-50 border border-rose-100" 
            : "text-slate-400 bg-slate-50"
        }`}>
          ৳{row.dueAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: "createdAt",
      Title: "Register Date",
      width: "15%",
      render: (row) => <span className="text-slate-500 font-medium">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      key: "actions",
      Title: "Action",
      width: "10%",
      sortable: false,
      render: (row) => (
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(row)}
            className="font-bold text-xs gap-1 rounded-xl px-3 py-1.5 h-auto hover:bg-slate-50"
          >
            <Edit2 size={13} />
            <span>Edit</span>
          </Button>
        </div>
      )
    }
  ], [updateCustomer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Regular Customer Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage customer profiles, contact directories, and membership tiers</p>
        </div>
        <Button onClick={() => setIsRegModalOpen(true)} className="gap-2 shrink-0">
          <Plus size={18} />
          <span>Register Customer</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered"
          value={stats.total}
          icon={Users}
          gradientFrom="from-sky-400"
          gradientTo="to-medical-blue-600"
        />
        <StatCard
          title="VIP Customers"
          value={stats.vipCount}
          icon={UserCheck}
          gradientFrom="from-purple-400"
          gradientTo="to-indigo-600"
        />
        <StatCard
          title="Regular Status"
          value={stats.regularCount}
          icon={ShieldCheck}
          gradientFrom="from-slate-400"
          gradientTo="to-slate-700"
        />
        <StatCard
          title="Avg Spent per Client"
          value={stats.averageSpent}
          icon={DollarSign}
          gradientFrom="from-emerald-400"
          gradientTo="to-teal-600"
          isCurrency={true}
        />
      </div>

      {/* Main Customers Table Card */}
      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1">
            <InputField 
              placeholder="Search by customer name or phone number..." 
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <Table 
          TableHeads={columns} 
          TableRows={filteredCustomers}
          isLoading={isLoading}
        />
      </Card>

      {/* Register Customer Modal */}
      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Register New Customer"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setIsRegModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={isAdding} className="gap-2">
              {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              <span>Register Customer</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <InputField 
            label="Customer Name" 
            placeholder="e.g. Sajid Ahmed" 
            value={regForm.name}
            onChange={(e) => setRegForm({...regForm, name: e.target.value})}
          />
          <InputField 
            label="Phone Number" 
            placeholder="e.g. 01756899699" 
            value={regForm.phone}
            onChange={(e) => setRegForm({...regForm, phone: e.target.value})}
          />
          <InputField 
            label="Email Address (Optional)" 
            placeholder="e.g. sajid@gmail.com" 
            value={regForm.email}
            onChange={(e) => setRegForm({...regForm, email: e.target.value})}
          />
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Membership Status</label>
            <div className="flex bg-slate-50 border p-1 rounded-xl gap-1">
              {["Regular", "VIP", "Credit"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setRegForm({...regForm, status})}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${regForm.status === status ? "bg-medical-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Customer Profile"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isUpdating} className="gap-2">
              {isUpdating ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>Save Changes</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <InputField 
            label="Customer Name" 
            placeholder="e.g. Sajid Ahmed" 
            value={editForm.name}
            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
          />
          <InputField 
            label="Phone Number" 
            placeholder="e.g. 01756899699" 
            value={editForm.phone}
            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
          />
          <InputField 
            label="Email Address (Optional)" 
            placeholder="e.g. sajid@gmail.com" 
            value={editForm.email}
            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
          />
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Membership Status</label>
            <div className="flex bg-slate-50 border p-1 rounded-xl gap-1">
              {["Regular", "VIP", "Credit"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setEditForm({...editForm, status})}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${editForm.status === status ? "bg-medical-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
