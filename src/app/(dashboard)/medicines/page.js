'use client';

import { useState, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Loader2 } from "lucide-react";
import { Table } from "@/components/Table";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import InputField from "@/components/InputField";
import Dropdown from "@/components/Dropdown";
import { useMedicines } from "@/hooks/useMedicines";

export default function MedicinesPage() {
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({});

  const openAddModal = useCallback(() => {
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
  }, []);

  const openEditModal = useCallback((medicine) => {
    setEditingMedicine(medicine);
    setFormData(medicine);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
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
  }, [editingMedicine, formData, updateMedicine, addMedicine]);

  const confirmDelete = useCallback((medicine) => {
    setMedicineToDelete(medicine);
    setIsDeleteModalOpen(true);
  }, []);

  const executeDelete = useCallback(async () => {
    if (medicineToDelete) {
      await deleteMedicine(medicineToDelete.id);
      setIsDeleteModalOpen(false);
      setMedicineToDelete(null);
    }
  }, [deleteMedicine, medicineToDelete]);

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

  const columns = useMemo(() => [
    { key: "name", Title: "Medicine Name", width: "16%" },
    { key: "company", Title: "Company", width: "15%" },
    { key: "category", Title: "Category", width: "10%" , render: (row) => (
      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{row.category}</span>
    )},
    { key: "stock", Title: "Stock", width: "8%" , render: (row) => (
      <span className={row.stock <= 5 ? "text-red-600 font-bold" : row.stock <= 10 ? "text-amber-600 font-bold" : "font-medium"}>
        {row.stock}
      </span>
    )},
    { key: "purchasePrice", Title: "Purchase Price", width: "11%" , render: (row) => (
      <span className="text-slate-500">৳{row.purchasePrice?.toFixed(2)}</span>
    )},
    { key: "sellingPrice", Title: "Selling Price", width: "11%" , render: (row) => (
      <span className="font-medium text-slate-900">৳{row.sellingPrice?.toFixed(2)}</span>
    )},
    { key: "status", Title: "Status", width: "10%" , render: (row) => getStatusBadge(row.status || "In Stock") },
    { key: "expiryDate", Title: "Expiry", width: "10%" , render: (row) => (
      <span className="text-slate-500">
        {row.expiryDate ? (row.expiryDate instanceof Date ? row.expiryDate.toLocaleDateString() : String(row.expiryDate)) : "N/A"}
      </span>
    )},
    { key: "actions", Title: "Actions", width: "10%" , sortable: false, render: (row) => (
      <div className="flex items-center justify-center gap-2">
        <button 
          onClick={() => openEditModal(row)} 
          className="p-1.5 text-slate-400 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-lg transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button 
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
          onClick={() => confirmDelete(row)}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    )},
  ], [isDeleting, confirmDelete, openEditModal]);

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
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex-1">
            <InputField 
              placeholder="Search by name or company..." 
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <Dropdown 
                className="w-48"
                placeholder="All Categories"
                options={["All Categories", "Tablet", "Capsule", "Syrup", "Suspension", "Inhaler"]}
             />
             <Button variant="outline" className="h-13 gap-2 rounded-xl">
                <Filter size={16} />
                <span>More Filters</span>
             </Button>
          </div>
        </div>

        {/* Table */}
        <Table 
          TableHeads={columns} 
          TableRows={medicines || []}
          isLoading={isLoading}
        />
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
          <InputField 
            label="Medicine Name" 
            placeholder="e.g. Napa Extend" 
            value={formData.name || ''} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Company" 
              placeholder="e.g. Beximco" 
              value={formData.company || ''} 
              onChange={(e) => setFormData({...formData, company: e.target.value})}
            />
            <Dropdown 
              label="Category" 
              options={["Tablet", "Capsule", "Syrup", "Suspension", "Inhaler"]}
              value={formData.category || 'Tablet'}
              onSelect={(val) => setFormData({...formData, category: val})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Purchase Price" 
              type="number" 
              step="0.01" 
              value={formData.purchasePrice || 0} 
              onChange={(e) => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})}
            />
            <InputField 
              label="Selling Price" 
              type="number" 
              step="0.01" 
              value={formData.sellingPrice || 0} 
              onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value)})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Current Stock" 
              type="number" 
              value={formData.stock || 0} 
              onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
            />
            <InputField 
              label="Expiry Date" 
              type="date" 
              value={formData.expiryDate || ''} 
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            />
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
          Are you sure you want to delete <span className="font-bold text-slate-900">{medicineToDelete?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
