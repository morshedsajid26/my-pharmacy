import { useState } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Loader2 } from "lucide-react";
import { Table, TableRow, TableCell } from "../components/Table";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Modal } from "../components/Modal";
import { Input, Select } from "../components/FormElements";
import { useMedicines } from "../hooks/useMedicines";
import toast from "react-hot-toast";

export function Medicines() {
  const [searchTerm, setSearchTerm] = useState("");
  const { 
    medicines, 
    isLoading, 
    addMedicine, 
    updateMedicine, 
    deleteMedicine,
    isAdding,
    isUpdating,
    isDeleting
  } = useMedicines({ search: searchTerm });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({});

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData({
      name: "",
      company: "",
      category: "Tablet",
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      expiryDate: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setFormData(medicine);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingMedicine) {
        await updateMedicine({ id: editingMedicine.id, data: formData });
      } else {
        await addMedicine(formData);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      await deleteMedicine(id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Stock":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">In Stock</span>;
      case "Low":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">Low Stock</span>;
      case "Out of Stock":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">Out of Stock</span>;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medicine Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your pharmacy inventory and stock levels</p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus size={18} />
          <span>Add New Medicine</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              placeholder="Search by name or company..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <Select 
                className="w-40"
                options={[
                  { label: "All Categories", value: "all" },
                  { label: "Tablet", value: "tablet" },
                  { label: "Capsule", value: "capsule" },
                  { label: "Syrup", value: "syrup" },
                ]}
             />
             <Button variant="outline" className="gap-2">
                <Filter size={16} />
                <span>More Filters</span>
             </Button>
          </div>
        </div>

        {/* Table */}
        <Table headers={[
          "Medicine Name", 
          "Company", 
          "Category", 
          "Stock", 
          "Selling Price", 
          "Status", 
          "Expiry", 
          "Actions"
        ]}>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-10">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
                  <p className="text-sm font-medium">Fetching medicines...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (medicines || []).map((med) => (
            <TableRow key={med.id}>
              <TableCell className="font-semibold text-slate-900">{med.name}</TableCell>
              <TableCell>{med.company}</TableCell>
              <TableCell>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{med.category}</span>
              </TableCell>
              <TableCell>
                <span className={med.stock <= 5 ? "text-red-600 font-bold" : med.stock <= 10 ? "text-amber-600 font-bold" : "font-medium"}>
                  {med.stock}
                </span>
              </TableCell>
              <TableCell className="font-medium">${med.sellingPrice?.toFixed(2)}</TableCell>
              <TableCell>{getStatusBadge(med.status || "In Stock")}</TableCell>
              <TableCell className="text-slate-500">{med.expiryDate}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditModal(med)} 
                    className="p-1.5 text-slate-400 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                    onClick={() => handleDelete(med.id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>

        {/* Pagination Placeholder */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-50">
          <p className="text-xs text-slate-500">Showing {medicines?.length || 0} entries</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-medical-blue-50 text-medical-blue-600 border-medical-blue-200">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMedicine ? "Edit Medicine" : "Add New Medicine"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isAdding || isUpdating} className="gap-2">
              {(isAdding || isUpdating) ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{editingMedicine ? "Save Changes" : "Save Medicine"}</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input 
            label="Medicine Name" 
            placeholder="e.g. Napa Extend" 
            value={formData.name || ''} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Company" 
              placeholder="e.g. Beximco" 
              value={formData.company || ''} 
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
            <Select 
              label="Category" 
              options={[
                { label: "Tablet", value: "Tablet" },
                { label: "Capsule", value: "Capsule" },
                { label: "Syrup", value: "Syrup" },
              ]}
              value={formData.category || 'Tablet'}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Purchase Price" 
              type="number" 
              step="0.01" 
              value={formData.purchasePrice || 0} 
              onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})}
            />
            <Input 
              label="Selling Price" 
              type="number" 
              step="0.01" 
              value={formData.sellingPrice || 0} 
              onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Current Stock" 
              type="number" 
              value={formData.stock || 0} 
              onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
            />
            <Input 
              label="Expiry Date" 
              type="date" 
              value={formData.expiryDate || ''} 
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
