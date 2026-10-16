'use client';

import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, User, Printer, Save, Loader2, ChevronLeft, ChevronRight, Eye, PlusCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import InputField from "@/components/InputField";
import Dropdown from "@/components/Dropdown";
import { useSales } from "@/hooks/useSales";
import { useMedicines } from "@/hooks/useMedicines";
import { useCustomers } from "@/hooks/useCustomers";
import toast from "react-hot-toast";
import { PrintInvoice } from "@/components/PrintInvoice";

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { medicines, isLoading: isMedLoading } = useMedicines({ search: searchTerm });
  const { sales, recordSale, isRecording, isLoading: isSalesLoading } = useSales();
  const { customers, addCustomer, isAdding } = useCustomers();
  
  const [basket, setBasket] = useState([]);
  const [discountType, setDiscountType] = useState("percent"); // "percent" or "flat"
  const [discountValue, setDiscountValue] = useState(0);
  const [roundOffValue, setRoundOffValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [completedSale, setCompletedSale] = useState(null);
  const [completedCustomerName, setCompletedCustomerName] = useState("");
  const [completedCustomerPhone, setCompletedCustomerPhone] = useState("");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [isViewSaleModalOpen, setIsViewSaleModalOpen] = useState(false);
  
  // Customers & Dues states
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerOption, setSelectedCustomerOption] = useState("Walking Customer");
  const [walkingCustomerName, setWalkingCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paidAmountInput, setPaidAmountInput] = useState("");
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: "", phone: "", email: "", status: "Regular" });

  const itemsPerPage = 9;

  const addToBasket = useCallback((medicine) => {
    const existing = basket.find(item => item.id === medicine.id);
    if (existing) {
      if (existing.quantity < medicine.stock) {
        setBasket(basket.map(item => 
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        toast.error("Not enough stock!");
      }
    } else {
      setBasket([...basket, { ...medicine, quantity: 1 }]);
    }
  }, [basket]);

  const removeFromBasket = useCallback((id) => {
    setBasket(basket.filter(item => item.id !== id));
  }, [basket]);

  const updateQuantity = useCallback((id, delta) => {
    setBasket(basket.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        const med = (medicines || []).find(m => m.id === id);
        if (newQty > 0 && newQty <= (med?.stock || 0)) {
          return { ...item, quantity: newQty };
        } else if (newQty > (med?.stock || 0)) {
          toast.error("Stock limit reached!");
        }
        return item;
      }
      return item;
    }));
  }, [basket, medicines]);

  const totals = useMemo(() => {
    const subtotal = basket.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    const discountAmount = discountType === "percent" 
      ? subtotal * (discountValue / 100) 
      : discountValue;
    const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
    const roundOff = parseFloat(roundOffValue) || 0;
    const total = Math.max(0, totalAfterDiscount - roundOff);
    return { subtotal, discountType, discountValue, discountAmount, roundOff, total };
  }, [basket, discountType, discountValue, roundOffValue]);

  const actualPaidAmount = paidAmountInput === "" ? totals.total : parseFloat(paidAmountInput);
  const actualDueAmount = Math.max(0, totals.total - actualPaidAmount);

  const dropdownOptions = useMemo(() => {
    return ["Walking Customer", ...customers.map(c => `${c.name} (${c.status})`)];
  }, [customers]);

  const handlePay = useCallback(async () => {
    if (basket.length === 0) {
      toast.error("Basket is empty!");
      return;
    }

    if (actualDueAmount > 0 && !selectedCustomerId) {
      toast.error("Please select a registered customer to record due balance!");
      return;
    }
    
    try {
      const activeCustomer = customers.find(c => c.id === selectedCustomerId);
      const payload = {
        items: basket.map(item => ({ medicineId: item.id, quantity: item.quantity })),
        totalAmount: totals.total,
        paidAmount: actualPaidAmount,
        dueAmount: actualDueAmount,
        customerId: selectedCustomerId || undefined,
        walkingCustomerName: selectedCustomerId ? undefined : (walkingCustomerName || undefined)
      };
      
      const response = await recordSale(payload);
      if (response) {
        setCompletedSale(response);
        setCompletedCustomerName(activeCustomer ? activeCustomer.name : (walkingCustomerName || "Walking Customer"));
        setCompletedCustomerPhone(activeCustomer ? activeCustomer.phone : (customerPhone || "N/A"));
        setIsPrintModalOpen(true);
        setBasket([]);
        setSelectedCustomerId("");
        setSelectedCustomerOption("Walking Customer");
        setCustomerPhone("");
        setWalkingCustomerName("");
        setPaidAmountInput("");
        setDiscountValue(0);
        setRoundOffValue("");
        setDiscountType("percent");
      }
    } catch (err) {
      // Error handled in hook
    }
  }, [basket, totals.total, actualPaidAmount, actualDueAmount, selectedCustomerId, walkingCustomerName, customers, recordSale, roundOffValue, customerPhone]);

  const handlePrintExistingSale = (sale) => {
    setCompletedSale(sale);
    setCompletedCustomerName(sale.customer?.name || sale.walkingCustomerName || "Walking Customer");
    setCompletedCustomerPhone(sale.customer?.phone || "N/A");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const paginatedMedicines = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return (medicines || []).slice(start, start + itemsPerPage);
  }, [medicines, currentPage]);

  const totalPages = Math.ceil((medicines || []).length / itemsPerPage);

  const handleCreateCustomerInline = async () => {
    if (!newCustomerForm.name || !newCustomerForm.phone) {
      toast.error("Name and Phone are required!");
      return;
    }
    try {
      const customer = await addCustomer(newCustomerForm);
      if (customer) {
        setSelectedCustomerId(customer.id);
        setSelectedCustomerOption(`${customer.name} (${customer.status})`);
        setCustomerPhone(customer.phone);
        setIsNewCustomerModalOpen(false);
        setNewCustomerForm({ name: "", phone: "", email: "", status: "Regular" });
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const saleColumns = useMemo(() => [
    { key: "invoiceNo", Title: "Invoice No", width: "18%", render: (row) => <span className="font-mono font-bold text-slate-800">#{row.invoiceNo}</span> },
    { key: "createdAt", Title: "Date", width: "15%", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: "customer", Title: "Customer", width: "30%", render: (row) => <span className="font-semibold text-slate-700">{row.customer?.name || row.walkingCustomerName || "Walking Customer"}</span> },
    { key: "totalAmount", Title: "Total", width: "15%", render: (row) => <span className="font-black text-slate-900">৳{row.totalAmount?.toFixed(2)}</span> },
    { 
      key: "paymentStatus", 
      Title: "Status", 
      width: "12%",
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
          row.dueAmount > 0 
            ? "bg-rose-50 text-rose-600 border border-rose-100" 
            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
        }`}>
          {row.dueAmount > 0 ? `৳${row.dueAmount.toFixed(2)} Due` : "Paid"}
        </span>
      )
    },
    { 
      key: "actions", 
      Title: "Action", 
      width: "10%",
      sortable: false, 
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={() => {
              setViewingSale(row);
              setIsViewSaleModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={18} />
          </button>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales (POS)</h1>
          <p className="text-slate-500 text-sm mt-1">Create new invoices and manage retail sales & credits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Medicine Selection */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-2 sticky top-20 z-10 shadow-lg shadow-slate-200/50">
            <InputField 
              placeholder="Search medicines by name..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
            />
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[480px]">
            {isMedLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
                <p className="font-medium">Searching medicines...</p>
              </div>
            ) : (medicines || []).length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-10 italic">
                <Search size={48} className="mb-4 opacity-10" />
                <p>No medicines found</p>
              </div>
            ) : paginatedMedicines.map((med) => (
              <button 
                key={med.id}
                onClick={() => addToBasket(med)}
                disabled={med.stock === 0}
                className="p-4 bg-white border border-slate-100 rounded-2xl text-left hover:border-medical-blue-500 hover:shadow-xl hover:shadow-medical-blue-900/5 transition-all group active:scale-95 flex flex-col justify-between h-[150px] disabled:opacity-40 disabled:pointer-events-none"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1 bg-slate-50 rounded-lg group-hover:bg-medical-blue-50 group-hover:text-medical-blue-600 transition-colors">
                      {med.category}
                    </span>
                    <span className="text-sm font-black text-medical-blue-600">৳{med.sellingPrice?.toFixed(2)}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 line-clamp-1">{med.name}</h4>
                  {med.genericName && (
                    <p className="text-[10px] font-medium text-slate-500 mt-1 line-clamp-1">{med.genericName}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-400 font-medium">Stock: <span className={med.stock <= 10 ? "text-amber-600 font-bold" : "text-slate-600"}>{med.stock}</span></span>
                  <div className="p-1.5 rounded-lg bg-medical-blue-50 text-medical-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-4">
              <button 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-medical-blue-600 hover:border-medical-blue-200 disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setCurrentPage(i);
                    }}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i 
                        ? "bg-medical-blue-600 text-white shadow-md shadow-medical-blue-600/20" 
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-medical-blue-600 hover:border-medical-blue-200 disabled:opacity-20 transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <Card title="Recent POS Transactions" className="overflow-hidden">
             <Table 
               TableHeads={saleColumns} 
               TableRows={sales || []} 
               isLoading={isSalesLoading} 
             />
          </Card>
        </div>

        {/* Right Column: Basket & Summary */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <div className="flex flex-col h-[calc(100vh-165px)] bg-white rounded-xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-medical-blue-50 rounded-lg">
                     <ShoppingCart size={20} className="text-medical-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Current Basket</h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">{basket.length} items</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {basket.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center italic">
                   <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <ShoppingCart size={32} />
                   </div>
                   <p className="text-sm">Basket is empty</p>
                </div>
              ) : (
                basket.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 group animate-in slide-in-from-right-2 duration-200">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">৳{item.sellingPrice.toFixed(2)} / unit</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-1">
                       <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded transition-colors"><Minus size={14} /></button>
                       <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded transition-colors"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => removeFromBasket(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50/85 backdrop-blur-sm border-t border-slate-100 space-y-3.5 shrink-0 rounded-b-2xl">
              {/* Row 1: Customer Selection & Details */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="flex gap-1.5 items-end">
                  <div className="flex-1">
                    <Dropdown 
                      label="Select Customer"
                      labelClass="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5"
                      inputClass="h-[38px] rounded-xl px-3 py-1.5 text-xs font-semibold !text-slate-700 bg-white border border-slate-200 shadow-sm animate-none"
                      options={dropdownOptions}
                      value={selectedCustomerOption}
                      onSelect={(val) => {
                        setSelectedCustomerOption(val);
                        if (val === "Walking Customer") {
                          setSelectedCustomerId("");
                          setCustomerPhone("");
                        } else {
                          const selectedCust = customers.find(c => `${c.name} (${c.status})` === val);
                          if (selectedCust) {
                            setSelectedCustomerId(selectedCust.id);
                            setCustomerPhone(selectedCust.phone);
                            setWalkingCustomerName("");
                          }
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewCustomerModalOpen(true)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-medical-blue-600 hover:bg-medical-blue-50 hover:border-medical-blue-200 transition-all shadow-sm h-[38px] w-[38px] flex items-center justify-center shrink-0"
                    title="Register New Customer"
                  >
                    <PlusCircle size={18} />
                  </button>
                </div>

                <div>
                  {selectedCustomerOption === "Walking Customer" ? (
                    <InputField 
                      label="Walking Customer Name"
                      placeholder="Name (Optional)"
                      value={walkingCustomerName}
                      onChange={(e) => setWalkingCustomerName(e.target.value)}
                      inputClass="h-[38px] text-xs px-3 py-1.5"
                      labelClass="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5"
                    />
                  ) : (
                    <InputField 
                      label="Customer Phone"
                      placeholder="Phone (Optional)"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      disabled={!!selectedCustomerId}
                      inputClass="h-[38px] text-xs px-3 py-1.5"
                      labelClass="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5"
                    />
                  )}
                </div>
              </div>

              {/* Row 1.5: Phone Number Input for Walking Customer if they want to enter both name & phone */}
              {selectedCustomerOption === "Walking Customer" && (
                <InputField 
                  label="Customer Phone"
                  placeholder="e.g. 01756899699 (Optional)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  inputClass="h-[38px] text-xs px-3 py-1.5"
                  labelClass="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5"
                />
              )}

              {/* Row 2: Discount & Round Off side-by-side */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="grid grid-cols-4 gap-1.5 items-end">
                  <div className="col-span-3">
                    <InputField 
                       label="Discount"
                       placeholder={discountType === "percent" ? "Dis (%)" : "Dis (৳)"}
                       type="number"
                       value={discountValue || ""}
                       onChange={(e) => setDiscountValue(Number(e.target.value))}
                       inputClass="h-[38px] text-xs px-3 py-1.5"
                       labelClass="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5"
                    />
                  </div>
                  <div className="col-span-1 flex bg-white rounded-xl p-0.5 h-[38px] border border-slate-200 shadow-sm shrink-0">
                    <button
                      type="button"
                      onClick={() => { setDiscountType("percent"); setDiscountValue(0); }}
                      className={`flex-1 text-[10px] font-black rounded-lg transition-all ${discountType === "percent" ? "bg-medical-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-800"}`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDiscountType("flat"); setDiscountValue(0); }}
                      className={`flex-1 text-[10px] font-black rounded-lg transition-all ${discountType === "flat" ? "bg-medical-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-800"}`}
                    >
                      ৳
                    </button>
                  </div>
                </div>

                <InputField 
                  label="Additional Round Off"
                  placeholder="e.g. 2 (Optional)"
                  type="number"
                  value={roundOffValue}
                  onChange={(e) => setRoundOffValue(e.target.value)}
                  inputClass="h-[38px] text-xs px-3 py-1.5"
                  labelClass="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5"
                />
              </div>

              {/* Row 3: Payment Split Fields (Cash Paid & Due Amount) */}
              <div className="grid grid-cols-2 gap-3">
                <InputField 
                  label="Paid Amount (৳)"
                  placeholder={totals.total.toFixed(2)}
                  type="number"
                  value={paidAmountInput}
                  onChange={(e) => setPaidAmountInput(e.target.value)}
                  inputClass="h-[38px] text-xs px-3 py-1.5"
                  labelClass="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5"
                />
                <div className="flex flex-col w-full gap-1 font-inter">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Due Amount (৳)</label>
                  <div className="bg-white border border-slate-200 outline-none px-3 text-slate-900 rounded-lg transition-all h-[38px] flex items-center text-xs font-bold shadow-sm">
                    ৳{actualDueAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Outstanding Credit Warnings */}
              {actualDueAmount > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 animate-pulse">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Outstanding credit detected!</p>
                    <p className="text-slate-600 mt-0.5">৳{actualDueAmount.toFixed(2)} will be added to the customer's due balance.</p>
                  </div>
                </div>
              )}

              {/* Pricing Breakdowns */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>৳{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.discountAmount > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Discount ({totals.discountType === "percent" ? `${totals.discountValue}%` : `৳${totals.discountValue}`})</span>
                    <span className="text-red-500">- ৳{totals.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {totals.roundOff > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Round Off</span>
                    <span className="text-red-500">- ৳{totals.roundOff.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-medical-blue-600 font-mono">৳{totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="w-full gap-2 h-10 shadow-lg shadow-medical-blue-600/20 rounded-xl text-xs font-bold" 
                  disabled={basket.length === 0 || isRecording} 
                  onClick={handlePay}
                >
                  {isRecording ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>Record Invoice</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        title="Register New Customer"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setIsNewCustomerModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCustomerInline} disabled={isAdding} className="gap-2">
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
            value={newCustomerForm.name}
            onChange={(e) => setNewCustomerForm({...newCustomerForm, name: e.target.value})}
          />
          <InputField 
            label="Phone Number" 
            placeholder="e.g. 01756899699" 
            value={newCustomerForm.phone}
            onChange={(e) => setNewCustomerForm({...newCustomerForm, phone: e.target.value})}
          />
          <InputField 
            label="Email Address (Optional)" 
            placeholder="e.g. customer@gmail.com" 
            value={newCustomerForm.email}
            onChange={(e) => setNewCustomerForm({...newCustomerForm, email: e.target.value})}
          />
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Customer Status</label>
            <div className="flex bg-slate-50 border p-1 rounded-xl gap-1">
              {["Regular", "VIP", "Credit"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setNewCustomerForm({...newCustomerForm, status})}
                  className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${newCustomerForm.status === status ? "bg-medical-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Print Confirmation Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Sale Completed Successfully!"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="gap-2" 
              onClick={() => {
                window.print();
                setIsPrintModalOpen(false);
              }}
            >
              <Printer size={18} />
              <span>Print Invoice</span>
            </Button>
          </div>
        }
      >
        <div className="text-center py-6 space-y-3">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-slate-900">Sale has been recorded!</h4>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Invoice <span className="font-bold text-slate-800">#{completedSale?.invoiceNo}</span> has been generated. Would you like to print the receipt now?
          </p>
        </div>
      </Modal>

      {/* Hidden Print Area */}
      <PrintInvoice 
        completedSale={completedSale} 
        completedCustomerName={completedCustomerName} 
        completedCustomerPhone={completedCustomerPhone} 
      />

      {/* View Sale Details Modal */}
      <Modal
        isOpen={isViewSaleModalOpen}
        onClose={() => setIsViewSaleModalOpen(false)}
        title={`Sale Details: #${viewingSale?.invoiceNo}`}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="outline" onClick={() => setIsViewSaleModalOpen(false)}>
              Close
            </Button>
            <Button 
              className="gap-2" 
              onClick={() => {
                handlePrintExistingSale(viewingSale);
              }}
            >
              <Printer size={18} />
              <span>Print Receipt</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Invoice No</p>
              <p className="text-slate-900 font-bold">{viewingSale?.invoiceNo}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Date</p>
              <p className="text-slate-900 font-bold">
                {viewingSale?.createdAt ? new Date(viewingSale.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Total Items</p>
              <p className="text-slate-900 font-bold">{viewingSale?.items?.length || 0} items</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Grand Total</p>
              <p className="text-medical-blue-600 font-black">৳{viewingSale?.totalAmount?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Paid Amount</p>
              <p className="text-emerald-600 font-bold">৳{viewingSale?.paidAmount?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Due Balance</p>
              <p className="text-rose-600 font-black">৳{viewingSale?.dueAmount?.toFixed(2) || "0.00"}</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Medicine Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {viewingSale?.items?.length > 0 ? (
                  viewingSale.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.medicine?.name || 'Unknown Medicine'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {item.medicine?.category || 'Tablet'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-500">৳{item.unitPrice?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">৳{item.totalPrice?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">No item details available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
