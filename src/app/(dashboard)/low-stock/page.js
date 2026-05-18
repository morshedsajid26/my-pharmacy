'use client';

import { useMemo, useState } from "react";
import { AlertTriangle, Download, RefreshCw, ListChecks, Loader2, Printer } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { useMedicines } from "@/hooks/useMedicines";

export default function LowStockPage() {
  const { lowStock, isLoading } = useMedicines();
  const lowStockMedicines = lowStock || [];
  
  const [selectedCompany, setSelectedCompany] = useState("All Companies");

  const companies = useMemo(() => {
    const allComp = lowStockMedicines.map(m => m.company).filter(Boolean);
    return ["All Companies", ...Array.from(new Set(allComp))];
  }, [lowStockMedicines]);

  const filteredMedicines = useMemo(() => {
    if (selectedCompany === "All Companies") return lowStockMedicines;
    return lowStockMedicines.filter(m => m.company === selectedCompany);
  }, [lowStockMedicines, selectedCompany]);

  const lowStockColumns = useMemo(() => [
    { 
      key: "name", 
      Title: "Medicine", 
      render: (row) => <span className="font-semibold text-slate-900">{row.name}</span> 
    },
    { 
      key: "company", 
      Title: "Company", 
      render: (row) => <span className="font-medium text-slate-600">{row.company || "N/A"}</span> 
    },
    { 
      key: "category", 
      Title: "Category" 
    },
    { 
      key: "stock", 
      Title: "Current Stock", 
      render: (row) => (
        <span className={row.stock === 0 ? "text-red-600 font-bold" : "text-amber-600 font-bold"}>
          {row.stock}
        </span>
      )
    },
    { 
      key: "status", 
      Title: "Status", 
      render: (row) => (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          row.stock === 0 
            ? "bg-red-50 text-red-600 border border-red-100" 
            : "bg-amber-50 text-amber-600 border border-amber-100"
        }`}>
          {row.status}
        </span>
      )
    }
  ], []);

  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-medium animate-pulse">Checking inventory levels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1>
          <p className="text-slate-500 text-sm mt-1">Items that need immediate restocking</p>
        </div>
      </div>

      <div className="no-print">
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Inventory Warning</h4>
              <p className="text-sm text-amber-700 mt-1">There are {lowStockMedicines.length} items below the safety stock level. We recommend creating a purchase order today.</p>
            </div>
          </div>
        </Card>
      </div>

      {lowStockMedicines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          <div className="no-print">
            <Card title="Low Stock List">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  Showing {filteredMedicines.length} of {lowStockMedicines.length} medicines
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-initial">
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full sm:w-[180px] h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-medical-blue-500 font-medium text-slate-700"
                    >
                      {companies.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button variant="outline" className="gap-2 h-9 text-xs" onClick={() => window.print()}>
                    <Printer size={16} />
                    <span>Print List</span>
                  </Button>
                </div>
              </div>

              <Table 
                TableHeads={lowStockColumns} 
                TableRows={filteredMedicines} 
              />
            </Card>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 opacity-50 no-print">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <ListChecks size={40} className="text-slate-300" />
          </div>
          <p className="text-lg font-bold text-slate-900">All items are in stock</p>
          <p className="text-sm text-slate-500">No low stock alerts at the moment.</p>
        </Card>
      )}

      {/* Hidden Print Area for A4 low stock list */}
      <div id="print-area" className="hidden print:block a4-width bg-white text-slate-900">
        <div className="text-center pb-6 border-b-2 border-slate-300 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">SNS Pharmacy</h1>
          <p className="text-xs text-slate-500 mt-1">Mirpur, Dhaka, Bangladesh | Phone: +880 1756-899699</p>
          <h2 className="text-lg font-bold text-slate-700 mt-4">LOW STOCK ALERT REPORT</h2>
          <p className="text-[10px] text-slate-400 mt-1">
            Generated on: {new Date().toLocaleString()} | Company Filter: <span className="font-bold text-slate-700">{selectedCompany}</span>
          </p>
        </div>

        <table className="w-full text-xs text-left border-collapse border border-slate-200">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
              <th className="px-4 py-3 border-r border-slate-200">Medicine Name</th>
              <th className="px-4 py-3 border-r border-slate-200">Company</th>
              <th className="px-4 py-3 border-r border-slate-200">Category</th>
              <th className="px-4 py-3 text-center border-r border-slate-200">Current Stock</th>
              <th className="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMedicines.map((med) => (
              <tr key={med.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-200">{med.name}</td>
                <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{med.company || "N/A"}</td>
                <td className="px-4 py-3 text-slate-600 border-r border-slate-200">{med.category}</td>
                <td className="px-4 py-3 text-center font-bold text-red-600 border-r border-slate-200">{med.stock}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    {med.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-12 pt-6 border-t border-dashed border-slate-300 text-center text-[10px] text-slate-400">
          <p className="font-semibold text-slate-600">SNS Pharmacy Management System — Low Stock Report</p>
        </div>
      </div>
    </div>
  );
}
