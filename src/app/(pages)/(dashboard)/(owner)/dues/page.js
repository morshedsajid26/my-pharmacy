'use client';

import { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Search, 
  Loader2, 
  CreditCard, 
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  TrendingDown
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

export default function DuesPage() {
  const { customers, isLoading, collectDue, isCollecting } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  // Due Collection Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [waiveAmount, setWaiveAmount] = useState("");
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  // Filtered and only due-bearing accounts
  const dueCustomers = useMemo(() => {
    return customers.filter(c => c.dueAmount > 0);
  }, [customers]);

  const filteredDueCustomers = useMemo(() => {
    return dueCustomers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
    );
  }, [dueCustomers, searchTerm]);

  // Statistical calculations
  const stats = useMemo(() => {
    const totalDues = dueCustomers.reduce((acc, c) => acc + c.dueAmount, 0);
    const activeDueAccounts = dueCustomers.length;
    const vipDueAccounts = dueCustomers.filter(c => c.status === "VIP").length;
    const averageDue = activeDueAccounts > 0 ? totalDues / activeDueAccounts : 0;
    return { totalDues, activeDueAccounts, vipDueAccounts, averageDue };
  }, [dueCustomers]);

  const remainingDue = useMemo(() => {
    if (!selectedCustomer) return 0;
    const payment = parseFloat(collectAmount) || 0;
    const waive = parseFloat(waiveAmount) || 0;
    return Math.max(0, parseFloat((selectedCustomer.dueAmount - payment - waive).toFixed(2)));
  }, [selectedCustomer, collectAmount, waiveAmount]);

  const handleCollectDue = async () => {
    if (!collectAmount || parseFloat(collectAmount) <= 0) {
      toast.error("Please enter a valid payment amount!");
      return;
    }
    const payment = parseFloat(collectAmount);
    const waive = parseFloat(waiveAmount) || 0;

    const totalPaymentAndWaive = parseFloat((payment + waive).toFixed(2));
    const outstandingDue = parseFloat(selectedCustomer.dueAmount.toFixed(2));

    if (totalPaymentAndWaive > outstandingDue) {
      toast.error(`Total payment and waive amount (৳${totalPaymentAndWaive.toFixed(2)}) exceeds the outstanding due (৳${outstandingDue.toFixed(2)})!`);
      return;
    }
    try {
      await collectDue({
        customerId: selectedCustomer.id,
        amount: payment,
        waiveAmount: waive
      });
      setIsCollectModalOpen(false);
      setCollectAmount("");
      setWaiveAmount("");
      setSelectedCustomer(null);
    } catch (err) {}
  };

  const columns = useMemo(() => [
    {
      key: "name",
      Title: "Customer Name",
      width: "25%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center font-bold text-rose-600 shrink-0">
            {row.name.charAt(0)}
          </div>
          <span className="font-bold text-slate-900">{row.name}</span>
        </div>
      )
    },
    {
      key: "phone",
      Title: "Phone Number",
      width: "20%",
      render: (row) => (
        <span className="text-slate-600 font-semibold flex items-center gap-1.5">
          <Smartphone size={14} className="text-slate-400" />
          <span>{row.phone}</span>
        </span>
      )
    },
    {
      key: "status",
      Title: "Membership Status",
      width: "15%",
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
      Title: "Total Purchases",
      width: "15%",
      render: (row) => <span className="font-mono font-bold text-slate-500">৳{row.totalSpent?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    },
    {
      key: "dueAmount",
      Title: "Outstanding Due",
      width: "15%",
      render: (row) => (
        <span className="px-2.5 py-1 rounded-xl text-xs font-black font-mono bg-rose-50 text-rose-600 border border-rose-100">
          ৳{row.dueAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      )
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
            onClick={() => {
              setSelectedCustomer(row);
              setIsCollectModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs gap-1 border-emerald-600 shadow-sm shadow-emerald-600/10 rounded-xl px-3 py-1.5 h-auto"
          >
            <CreditCard size={14} />
            <span>Pay Due</span>
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Due & Credit Management </h1>
          <p className="text-slate-500 text-sm mt-1">Collect due payments, track market outstanding credits, and clear residual invoices</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Market Due"
          value={stats.totalDues}
          icon={DollarSign}
          gradientFrom="from-rose-400"
          gradientTo="to-red-600"
          isCurrency={true}
        />
        <StatCard
          title="Due Accounts Count"
          value={stats.activeDueAccounts}
          icon={ShieldAlert}
          gradientFrom="from-sky-400"
          gradientTo="to-medical-blue-600"
        />
        <StatCard
          title="VIP Due Accounts"
          value={stats.vipDueAccounts}
          icon={CheckCircle2}
          gradientFrom="from-purple-400"
          gradientTo="to-indigo-600"
        />
        <StatCard
          title="Avg Due per Client"
          value={stats.averageDue}
          icon={TrendingDown}
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
              placeholder="Search due accounts by customer name or phone number..." 
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {filteredDueCustomers.length > 0 ? (
          <Table 
            TableHeads={columns} 
            TableRows={filteredDueCustomers}
            isLoading={isLoading}
          />
        ) : (
          <div className="py-16 text-center text-slate-400 font-medium italic border border-dashed rounded-2xl border-slate-200">
            🎉 Awesome! All accounts are fully cleared. No outstanding dues!
          </div>
        )}
      </Card>

      {/* Collect Due Modal */}
      <Modal
        isOpen={isCollectModalOpen}
        onClose={() => setIsCollectModalOpen(false)}
        title="Collect Due Payment "
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setIsCollectModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCollectDue} 
              disabled={isCollecting} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 border-emerald-600 shadow-sm"
            >
              {isCollecting ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
              <span>Collect Payment</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Customer:</span>
              <span className="font-bold text-slate-900">{selectedCustomer?.name} ({selectedCustomer?.phone})</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Membership Status:</span>
              <span className="font-bold text-slate-900">{selectedCustomer?.status}</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200/60">
              <span className="text-rose-600 font-bold text-sm">Outstanding Due:</span>
              <span className="font-black text-rose-600 font-mono text-base">৳{selectedCustomer?.dueAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-medium text-sm">Remaining Due:</span>
              <span className={`font-black font-mono text-base ${remainingDue === 0 ? "text-emerald-600 font-bold animate-pulse" : "text-slate-700"}`}>
                ৳{remainingDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Payment Received" 
              placeholder="e.g. 500" 
              type="number"
              value={collectAmount}
              onChange={(e) => setCollectAmount(e.target.value)}
            />
            <InputField 
              label="Discount/Waive " 
              placeholder="e.g. 2 (Optional)" 
              type="number"
              value={waiveAmount}
              onChange={(e) => setWaiveAmount(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
