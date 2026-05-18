import { AlertTriangle, Download, PackageSearch, RefreshCw, ListChecks, Loader2 } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Table, TableRow, TableCell } from "../components/Table";
import { useMedicines } from "../hooks/useMedicines";

export function LowStock() {
  const { lowStock, isLoading } = useMedicines();
  const lowStockMedicines = lowStock || [];

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Low Stock Alerts</h1>
          <p className="text-slate-500 text-sm mt-1">Items that need immediate restocking</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <RefreshCw size={18} />
            <span>Sync Inventory</span>
          </Button>
          <Button className="gap-2 bg-amber-600 hover:bg-amber-700 border-none">
            <Download size={18} />
            <span>Generate Purchase List</span>
          </Button>
        </div>
      </div>

      {lowStockMedicines.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Low Stock List">
              <Table headers={["Medicine", "Category", "Current Stock", "Min Level", "Status"]}>
                {lowStockMedicines.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-semibold text-slate-900">{med.name}</TableCell>
                    <TableCell>{med.category}</TableCell>
                    <TableCell>
                      <span className={med.stock === 0 ? "text-red-600 font-bold" : "text-amber-600 font-bold"}>
                        {med.stock}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">10</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        med.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {med.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="bg-amber-50 border-amber-200">
               <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900">Inventory Warning</h4>
                    <p className="text-sm text-amber-700 mt-1">There are {lowStockMedicines.length} items below the safety stock level. We recommend creating a purchase order today.</p>
                  </div>
               </div>
            </Card>

            <Card title="Quick Search" subtitle="Find items by company">
               <div className="space-y-3">
                  {["Beximco", "Square", "Incepta", "Healthcare"].map(company => (
                    <button key={company} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-all text-sm font-medium text-slate-700 group">
                       <span>{company}</span>
                       <PackageSearch size={16} className="text-slate-300 group-hover:text-medical-blue-500 transition-colors" />
                    </button>
                  ))}
               </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-20 opacity-50">
           <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <ListChecks size={40} className="text-slate-300" />
           </div>
           <p className="text-lg font-bold text-slate-900">All items are in stock</p>
           <p className="text-sm text-slate-500">No low stock alerts at the moment.</p>
        </Card>
      )}
    </div>
  );
}
