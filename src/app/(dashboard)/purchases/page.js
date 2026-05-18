'use client';

import { useState, useMemo } from "react";
import { Plus, Truck, Calendar, DollarSign, Trash2, Loader2, Eye, Edit2 } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Select } from "@/components/FormElements";
import { Table, TableRow, TableCell } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { usePurchases } from "@/hooks/usePurchases";
import { useMedicines } from "@/hooks/useMedicines";
import toast from "react-hot-toast";

export default function PurchasesPage() {
  const { medicines } = useMedicines();
  const { purchases, recordPurchase, isRecording, isLoading, updatePurchase, isUpdating, deletePurchase, isDeleting } = usePurchases();
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [viewingPurchase, setViewingPurchase] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [purchaseDiscount, setPurchaseDiscount] = useState(0);

  const columns = useMemo(() => [
    { key: "id", Title: "Purchase ID", render: (row) => <span className="font-bold text-medical-blue-600">#{row.id}</span> },
    { key: "supplier", Title: "Company", render: (row) => <span className="font-medium text-slate-900">{row.supplier}</span> },
    { key: "createdAt", Title: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: "itemsCount", Title: "Items", render: (row) => `${row.items?.length || 0} items` },
    { key: "totalAmount", Title: "Purchase Amount", render: (row) => <span className="font-bold">৳{row.totalAmount?.toLocaleString()}</span> },
    { key: "status", Title: "Status", render: () => (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700`}>
        Received
      </span>
    ) },
    { key: "action", Title: "Action", sortable: false, render: (row) => (
       <div className="flex items-center justify-center gap-2">
         <button 
           onClick={() => {
              setViewingPurchase(row);
              setIsViewModalOpen(true);
           }}
           className="p-1.5 text-slate-400 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-lg transition-colors"
           title="View Details"
         >
           <Eye size={18} />
         </button>
         <button 
           onClick={() => {
              setEditingPurchaseId(row.id);
              setSelectedCompany(row.supplier);
              setPurchaseItems(
                 (row.items || []).map(item => ({
                    medicineId: item.medicineId ? item.medicineId.toString() : "",
                    name: item.medicine?.name || item.name || "",
                    category: item.medicine?.category || item.category || "Tablet",
                    isNew: !item.medicineId,
                    quantity: item.quantity,
                    price: item.unitPrice,
                    sellingPrice: item.medicine?.sellingPrice || 0
                 }))
              );
              const prevGrandTotal = (row.items || []).reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
              const prevDiscount = Math.max(0, prevGrandTotal - row.totalAmount);
              setPurchaseDiscount(prevDiscount);
              setIsAddingMode(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
           }}
           className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
           title="Edit Purchase"
         >
           <Edit2 size={18} />
         </button>
         <button 
           onClick={() => {
             setPurchaseToDelete(row);
             setIsDeleteModalOpen(true);
           }}
           className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
           title="Delete Purchase"
           disabled={isDeleting}
         >
           {isDeleting && purchaseToDelete?.id === row.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
         </button>
       </div>
    ) }
  ], [isDeleting, purchaseToDelete]);

  const executeDelete = async () => {
    if (purchaseToDelete) {
      await deletePurchase(purchaseToDelete.id);
      setIsDeleteModalOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, { medicineId: "", name: "", category: "Tablet", isNew: false, quantity: 1, price: 0, sellingPrice: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...purchaseItems];
    updated[index][field] = value;
    setPurchaseItems(updated);
  };

  const removeItem = (index) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const handlePurchase = async () => {
    if (!selectedCompany) {
      toast.error("Please select a supplier company!");
      return;
    }
    if (purchaseItems.length === 0) {
      toast.error("Please add at least one item!");
      return;
    }
    
    // Validate selections
    if (purchaseItems.some(item => !item.medicineId && !item.name)) {
      toast.error("Please select a medicine or enter a name for all rows!");
      return;
    }

    try {
      const payload = {
        company: selectedCompany,
        items: purchaseItems.map(item => ({
          medicineId: item.isNew || item.medicineId === "new" ? null : item.medicineId,
          name: item.name,
          category: item.category || "Tablet",
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.price),
          sellingPrice: parseFloat(item.sellingPrice || 0)
        })),
        totalAmount: Math.max(0, grandTotal - purchaseDiscount)
      };

      if (editingPurchaseId) {
        await updatePurchase({ id: editingPurchaseId, data: payload });
      } else {
        await recordPurchase(payload);
      }
      setIsAddingMode(false);
      setEditingPurchaseId(null);
      setSelectedCompany("");
      setPurchaseItems([]);
      setPurchaseDiscount(0);
    } catch (err) {
      // Error handled in hook
    }
  };

  const grandTotal = purchaseItems.reduce((acc, item) => acc + (parseInt(item.quantity || 0) * parseFloat(item.price || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage supplier orders and stock procurement</p>
        </div>
        {!isAddingMode && (
          <Button onClick={() => { setIsAddingMode(true); setEditingPurchaseId(null); addPurchaseItem(); }} className="gap-2 w-full sm:w-auto">
            <Plus size={18} />
            <span>New Purchase Entry</span>
          </Button>
        )}
      </div>

      {isAddingMode ? (
        <Card title={editingPurchaseId ? "Edit Purchase Entry" : "New Purchase Entry"} subtitle="Enter details for the stock procurement">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select 
                label="Supplier Company" 
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                options={[
                  { label: "Select Company", value: "" },
                  { label: "Beximco Pharma", value: "Beximco Pharma" },
                  { label: "Square Pharma", value: "Square Pharma" },
                  { label: "Healthcare Pharma", value: "Healthcare Pharma" },
                  { label: "Incepta", value: "Incepta" },
                ]}
              />
              <Input label="Purchase Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              <Input label="Invoice Number" placeholder="e.g. INV-2024-001" />
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
               <Table headers={["Medicine", "Quantity", "Purchase Price", "Selling Price", "Total", "Action"]}>
                  {purchaseItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="min-w-[250px]">
                        {item.isNew ? (
                          <div className="relative flex gap-2">
                             <div className="flex-1">
                               <Input 
                                  placeholder="Medicine Name" 
                                  value={item.name}
                                  onChange={(e) => updateItem(index, "name", e.target.value)}
                               />
                             </div>
                             <div className="w-[105px]">
                               <Select 
                                 value={item.category || "Tablet"}
                                 onChange={(e) => updateItem(index, "category", e.target.value)}
                                 options={[
                                   { label: "Tablet", value: "Tablet" },
                                   { label: "Capsule", value: "Capsule" },
                                   { label: "Syrup", value: "Syrup" },
                                   { label: "Susp", value: "Suspension" },
                                   { label: "Inhaler", value: "Inhaler" }
                                 ]}
                               />
                             </div>
                             <button 
                               onClick={() => updateItem(index, "isNew", false)}
                               className="absolute -bottom-4 left-2 text-[10px] text-medical-blue-600 font-bold hover:underline"
                             >
                               Back to selection
                             </button>
                          </div>
                        ) : (
                          <div>
                            <Select 
                              value={item.medicineId}
                              onChange={(e) => {
                                if (e.target.value === "new") {
                                  updateItem(index, "isNew", true);
                                } else {
                                  updateItem(index, "medicineId", e.target.value);
                                }
                              }}
                              options={[
                                { label: "Select Medicine", value: "" },
                                { label: "+ Add New Medicine", value: "new" },
                                ...(medicines || []).map(m => ({ label: m.name, value: m.id.toString() }))
                              ]} 
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <Input 
                          type="number" 
                          placeholder="Qty" 
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Input 
                          type="number" 
                          placeholder="Price" 
                          value={item.price}
                          onChange={(e) => updateItem(index, "price", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Input 
                          type="number" 
                          placeholder="Sell Price" 
                          value={item.sellingPrice}
                          onChange={(e) => updateItem(index, "sellingPrice", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="font-bold">
                        ৳{(parseInt(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => removeItem(index)}>
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
               </Table>
               <div className="p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Button variant="outline" size="sm" className="gap-1.5 uppercase text-[10px] font-black tracking-widest w-full sm:w-auto" onClick={addPurchaseItem}>
                    <Plus size={14} />
                    Add Another Row
                  </Button>
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Discount/Round Off (ছাড়):</span>
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={purchaseDiscount || ""}
                        onChange={(e) => setPurchaseDiscount(Number(e.target.value))}
                        className="w-24 px-2.5 py-1 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 font-mono outline-none focus:border-medical-blue-500 transition-colors shadow-sm"
                      />
                    </div>
                    <div>
                      <span className="text-sm text-slate-500 mr-4">Grand Total:</span>
                      <span className="text-xl font-black text-medical-blue-600">৳{Math.max(0, grandTotal - purchaseDiscount).toFixed(2)}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="outline" className="w-full sm:w-auto order-2 sm:order-1" onClick={() => { setIsAddingMode(false); setEditingPurchaseId(null); setPurchaseItems([]); setSelectedCompany(""); }}>Cancel</Button>
              <Button onClick={handlePurchase} disabled={isRecording || isUpdating} className="w-full sm:w-auto order-1 sm:order-2">
                {isRecording || isUpdating ? <Loader2 size={18} className="animate-spin" /> : null}
                <span>{editingPurchaseId ? "Update Purchase" : "Complete Purchase"}</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg">Purchase History</h3>
          </div>
          <Table 
            TableHeads={columns} 
            TableRows={purchases || []}
            isLoading={isLoading}
          />
        </Card>
      )}

      {/* View Purchase Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Purchase Details: #${viewingPurchase?.id}`}
        footer={<Button onClick={() => setIsViewModalOpen(false)}>Close</Button>}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Supplier</p>
              <p className="text-slate-900 font-bold">{viewingPurchase?.supplier}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Date</p>
              <p className="text-slate-900 font-bold">{viewingPurchase?.createdAt ? new Date(viewingPurchase.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Invoice No</p>
              <p className="text-slate-900 font-bold">{viewingPurchase?.invoiceNo}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Total Amount</p>
              <p className="text-medical-blue-600 font-black">৳{viewingPurchase?.totalAmount?.toLocaleString()}</p>
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-4 py-3">Medicine Name</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Purchase Price</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {viewingPurchase?.items?.length > 0 ? (
                  viewingPurchase.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {item.medicine?.name || medicines?.find(m => m.id === item.medicineId)?.name || 'New Medicine'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-500">৳{item.unitPrice?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-medical-blue-600">৳{item.medicine?.sellingPrice?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">৳{item.totalPrice?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">No item details available for this record</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={executeDelete} 
              disabled={isDeleting} 
              className="bg-red-600 hover:bg-red-700 text-white gap-2 border-red-600"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              <span>Delete</span>
            </Button>
          </>
        }
      >
        <p className="text-slate-600">
          Are you sure you want to delete this purchase from <span className="font-bold text-slate-900">{purchaseToDelete?.supplier}</span>? This will revert the stock for all included medicines. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
