import { useState, useMemo } from "react";
import { Search, ShoppingCart, Trash2, Plus, Minus, User, Printer, Save, Loader2 } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input, Select } from "../components/FormElements";
import { Table, TableRow, TableCell } from "../components/Table";
import { useSales } from "../hooks/useSales";
import { useMedicines } from "../hooks/useMedicines";
import toast from "react-hot-toast";

export function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const { medicines, isLoading: isMedLoading } = useMedicines({ search: searchTerm });
  const { sales, recordSale, isRecording, isLoading: isSalesLoading } = useSales();
  
  const [basket, setBasket] = useState([]);
  const [customerName, setCustomerName] = useState("Walking Customer");

  const addToBasket = (medicine) => {
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
  };

  const removeFromBasket = (id) => {
    setBasket(basket.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
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
  };

  const totals = useMemo(() => {
    const subtotal = basket.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [basket]);

  const handlePay = async () => {
    if (basket.length === 0) {
      toast.error("Basket is empty!");
      return;
    }
    
    try {
      await recordSale({
        items: basket.map(item => ({ medicineId: item.id, quantity: item.quantity })),
        totalAmount: totals.total,
        customerName
      });
      setBasket([]);
      setCustomerName("Walking Customer");
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales (POS)</h1>
          <p className="text-slate-500 text-sm mt-1">Create new invoices and manage retail sales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Medicine Selection */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-4 sticky top-20 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search medicines by name..."
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500/20 focus:border-medical-blue-500 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px]">
            {isMedLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
                <p className="font-medium">Searching medicines...</p>
              </div>
            ) : (medicines || []).length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center text-slate-400 py-10 italic">
                <Search size={32} className="mb-2 opacity-20" />
                <p>No medicines found</p>
              </div>
            ) : (medicines || []).map((med) => (
              <button 
                key={med.id}
                onClick={() => addToBasket(med)}
                className="p-4 bg-white border border-slate-100 rounded-2xl text-left hover:border-medical-blue-500 hover:shadow-xl hover:shadow-medical-blue-900/5 transition-all group active:scale-95"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2 py-1 bg-slate-50 rounded-lg group-hover:bg-medical-blue-50 group-hover:text-medical-blue-600 transition-colors">
                    {med.category}
                  </span>
                  <span className="text-sm font-black text-medical-blue-600">${med.sellingPrice?.toFixed(2)}</span>
                </div>
                <h4 className="font-bold text-slate-900 line-clamp-1">{med.name}</h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-slate-400 font-medium">Stock: <span className={med.stock <= 10 ? "text-amber-600 font-bold" : "text-slate-600"}>{med.stock}</span></span>
                  <div className="p-1.5 rounded-lg bg-medical-blue-50 text-medical-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Card title="Recent Transactions" className="overflow-hidden">
             <Table headers={["ID", "Date", "Items", "Total"]}>
                {isSalesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
                    </TableCell>
                  </TableRow>
                ) : (sales || []).map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-bold text-medical-blue-600">#{sale.id}</TableCell>
                    <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.items?.length || 0} items</TableCell>
                    <TableCell className="font-black text-slate-900">${sale.totalAmount?.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
             </Table>
          </Card>
        </div>

        {/* Right Column: Basket & Summary */}
        <div className="space-y-6 lg:sticky lg:top-20">
          <Card className="flex flex-col h-[calc(100vh-140px)] lg:h-[700px]">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                 <ShoppingCart size={20} className="text-medical-blue-600" />
                 <h3 className="font-bold text-slate-900">Current Basket</h3>
               </div>
               <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-600">{basket.length} items</span>
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
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">${item.sellingPrice.toFixed(2)} / unit</p>
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

            <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-6 shrink-0 rounded-b-2xl">
              <div className="space-y-4">
                 <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Customer Name"
                      className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-medical-blue-500/20 transition-all font-medium"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                 </div>
                 <Select 
                   options={[
                     { label: "Cash Payment", value: "cash" },
                     { label: "Card Payment", value: "card" },
                     { label: "Mobile Wallet", value: "mobile" },
                   ]}
                 />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (VAT 5%)</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-medical-blue-600">${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2 h-12" disabled={basket.length === 0}>
                  <Printer size={18} />
                  <span>Invoice</span>
                </Button>
                <Button 
                  className="flex-[2] gap-2 h-12 shadow-lg shadow-medical-blue-600/20" 
                  disabled={basket.length === 0 || isRecording} 
                  onClick={handlePay}
                >
                  {isRecording ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>Pay Now</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
