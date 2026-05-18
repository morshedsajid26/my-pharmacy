import { useState } from "react";
import { Plus, Truck, Calendar, DollarSign, Trash2, Loader2 } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input, Select } from "../components/FormElements";
import { Table, TableRow, TableCell } from "../components/Table";
import { usePurchases } from "../hooks/usePurchases";
import { useMedicines } from "../hooks/useMedicines";
import toast from "react-hot-toast";

export function Purchases() {
  const { medicines } = useMedicines();
  const { purchases, recordPurchase, isRecording, isLoading } = usePurchases();
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, { medicineId: "", quantity: 1, price: 0 }]);
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
    if (purchaseItems.some(item => !item.medicineId)) {
      toast.error("Please select a medicine for all rows!");
      return;
    }

    try {
      await recordPurchase({
        company: selectedCompany,
        items: purchaseItems.map(item => ({
          medicineId: parseInt(item.medicineId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.price)
        })),
        totalAmount: grandTotal
      });
      setIsAddingMode(false);
      setSelectedCompany("");
      setPurchaseItems([]);
    } catch (_err) {
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
          <Button onClick={() => { setIsAddingMode(true); addPurchaseItem(); }} className="gap-2 w-full sm:w-auto">
            <Plus size={18} />
            <span>New Purchase Entry</span>
          </Button>
        )}
      </div>

      {isAddingMode ? (
        <Card title="New Purchase Entry" subtitle="Enter details for the new stock procurement">
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
               <Table headers={["Medicine", "Quantity", "Purchase Price", "Total", "Action"]}>
                  {purchaseItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="min-w-[200px]">
                        <Select 
                          value={item.medicineId}
                          onChange={(e) => updateItem(index, "medicineId", e.target.value)}
                          options={[
                            { label: "Select Medicine", value: "" },
                            ...(medicines || []).map(m => ({ label: m.name, value: m.id.toString() }))
                          ]} 
                        />
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
                      <TableCell className="font-bold">
                        ${(parseInt(item.quantity || 0) * parseFloat(item.price || 0)).toFixed(2)}
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
                  <div className="text-center sm:text-right w-full sm:w-auto">
                    <span className="text-sm text-slate-500 mr-4">Grand Total:</span>
                    <span className="text-xl font-black text-medical-blue-600">${grandTotal.toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button variant="outline" className="w-full sm:w-auto order-2 sm:order-1" onClick={() => { setIsAddingMode(false); setPurchaseItems([]); }}>Cancel</Button>
              <Button onClick={handlePurchase} disabled={isRecording} className="w-full sm:w-auto order-1 sm:order-2">
                {isRecording ? <Loader2 size={18} className="animate-spin" /> : null}
                <span>Complete Purchase</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Purchase History">
          <Table headers={["Purchase ID", "Company", "Date", "Items", "Purchase Amount", "Status"]}>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                </TableCell>
              </TableRow>
            ) : (purchases || []).map((pur) => (
              <TableRow key={pur.id}>
                <TableCell className="font-bold text-medical-blue-600">#{pur.id}</TableCell>
                <TableCell className="font-medium text-slate-900">{pur.company}</TableCell>
                <TableCell>{new Date(pur.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{pur.items?.length || 0} items</TableCell>
                <TableCell className="font-bold">${pur.totalAmount?.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700`}>
                    {"Received"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );
}
