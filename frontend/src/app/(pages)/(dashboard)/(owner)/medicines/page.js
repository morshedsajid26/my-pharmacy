"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Search, Filter, Edit2, Trash2, Loader2 } from "lucide-react";
import { Table } from "@/components/Table";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Modal } from "@/components/Modal";
import InputField from "@/components/InputField";
import Dropdown from "@/components/Dropdown";
import { useMedicines } from "@/hooks/useMedicines";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function MedicinesPage() {
  const { user } = useAuth();
  const isStaff = String(user?.role || "").toLowerCase() === "staff";
  const [searchTerm, setSearchTerm] = useState("");
  const {
    medicines,
    isLoading,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    isAdding,
    isUpdating,
    isDeleting,
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
      genericName: "",
      company: "",
      category: "Tablet",
      purchasePrice: 0,
      sellingPrice: 0,
      onlineDiscountPercent: 0,
      stock: 0,
      image: "",
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
      const payload = {
        name: formData.name,
        genericName: formData.genericName || "",
        company: formData.company,
        category: formData.category || "Tablet",
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        onlineDiscountPercent: Math.max(
          0,
          Math.min(100, parseFloat(formData.onlineDiscountPercent) || 0),
        ),
        stock: parseInt(formData.stock, 10) || 0,
        image: formData.image || "",
      };
      if (editingMedicine) {
        await updateMedicine({ id: editingMedicine.id, data: payload });
      } else {
        await addMedicine(payload);
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
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
            In Stock
          </span>
        );
      case "Low":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
            Low Stock
          </span>
        );
      case "Out of Stock":
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700">
            Out of Stock
          </span>
        );
      default:
        return status;
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        Title: "Medicine Name",
        width: "13%",
        render: (row) => (
          <div className="font-bold text-slate-900">{row.name}</div>
        ),
      },
      {
        key: "genericName",
        Title: "Generic Name",
        width: "10%",
        render: (row) => (
          <div className="text-slate-500 font-medium">
            {row.genericName || "-"}
          </div>
        ),
      },
      { key: "company", Title: "Company", width: "12%" },
      {
        key: "category",
        Title: "Category",
        width: "5%",
        render: (row) => (
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
            {row.category}
          </span>
        ),
      },
      {
        key: "stock",
        Title: "Stock",
        width: "5%",
        render: (row) => (
          <span
            className={
              row.stock <= 5
                ? "text-red-600 font-bold"
                : row.stock <= 10
                  ? "text-amber-600 font-bold"
                  : "font-medium"
            }
          >
            {row.stock}
          </span>
        ),
      },
      {
        key: "purchasePrice",
        Title: "Purchase Price",
        width: "11%",
        render: (row) => (
          <span className="text-slate-500">
            ৳{row.purchasePrice?.toFixed(2)}
          </span>
        ),
      },
      {
        key: "sellingPrice",
        Title: "Selling Price",
        width: "10%",
        render: (row) => (
          <span className="font-medium text-slate-900">
            ৳{row.sellingPrice?.toFixed(2)}
          </span>
        ),
      },
      {
        key: "onlineDiscountPercent",
        Title: "Discount",
        width: "2%",
        render: (row) => {
          const discount = Number(row.onlineDiscountPercent) || 0;
          return discount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
              {discount}%
            </span>
          ) : (
            <span className="text-slate-400 text-xs">0%</span>
          );
        },
      },
      {
        key: "status",
        Title: "Status",
        width: "10%",
        render: (row) => getStatusBadge(row.status || "In Stock"),
      },
      {
        key: "image",
        Title: "Image",
        width: "1%",
        render: (row) => (
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${row.image ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
          >
            {row.image ? "Yes" : "No"}
          </span>
        ),
      },
      ...(!isStaff
        ? [
            {
              key: "actions",
              Title: "Actions",
              width: "5%",
              sortable: false,
              render: (row) => (
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
                    {isDeleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ),
            },
          ]
        : []),
    ],
    [isStaff, isDeleting, confirmDelete, openEditModal],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isStaff ? "Medicines Inventory" : "Medicine Management"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isStaff
              ? "View pharmacy medicines, stock availability, and pricing"
              : "Manage your pharmacy inventory and stock levels"}
          </p>
        </div>
        {!isStaff && (
          <Button onClick={openAddModal} className="gap-2">
            <Plus size={18} />
            <span>Add New Medicine</span>
          </Button>
        )}
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
              options={[
                "All Categories",
                "Tablet",
                "Capsule",
                "Syrup",
                "Suspension (Susp)",
                "Drops",
                "Injection",
                "IV Infusion / Saline",
                "Cream",
                "Ointment",
                "Gel",
                "Lotion",
                "Powder",
                "Oral Powder / Sachet",
                "Inhaler",
                "Nebulizer Solution",
                "Nasal Drop",
                "Nasal Spray",
                "Eye Drop",
                "Eye Ointment",
                "Ear Drop",
                "Mouthwash",
                "Suppository",
                "Pessary",
              ]}
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
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isAdding || isUpdating}
              className="gap-2"
            >
              {isAdding || isUpdating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              <span>{editingMedicine ? "Save Changes" : "Save Medicine"}</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Medicine Name"
              placeholder="e.g. Napa Extend"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <InputField
              label="Generic Name"
              placeholder="e.g. Paracetamol"
              value={formData.genericName || ""}
              onChange={(e) =>
                setFormData({ ...formData, genericName: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Company"
              placeholder="e.g. Beximco"
              value={formData.company || ""}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
            />
            <Dropdown
              label="Category"
              options={[
                "Tablet",
                "Capsule",
                "Syrup",
                "Suspension (Susp)",
                "Drops",
                "Injection",
                "IV Infusion / Saline",
                "Cream",
                "Ointment",
                "Gel",
                "Lotion",
                "Powder",
                "Oral Powder / Sachet",
                "Inhaler",
                "Nebulizer Solution",
                "Nasal Drop",
                "Nasal Spray",
                "Eye Drop",
                "Eye Ointment",
                "Ear Drop",
                "Mouthwash",
                "Suppository",
                "Pessary",
              ]}
              value={formData.category || "Tablet"}
              onSelect={(val) => setFormData({ ...formData, category: val })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Purchase Price (৳)"
              type="number"
              step="0.01"
              value={formData.purchasePrice || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  purchasePrice: parseFloat(e.target.value) || 0,
                })
              }
            />
            <InputField
              label="Selling Price / MRP (৳)"
              type="number"
              step="0.01"
              value={formData.sellingPrice || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPrice: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Online Discount (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="0 (No discount)"
              value={formData.onlineDiscountPercent ?? 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  onlineDiscountPercent: Math.max(
                    0,
                    Math.min(100, parseFloat(e.target.value) || 0),
                  ),
                })
              }
            />
            <InputField
              label="Current Stock"
              type="number"
              value={formData.stock || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          {/* Real-time Online Margin & Profit Preview */}
          {Number(formData.sellingPrice) > 0 &&
            (() => {
              const disc = Number(formData.onlineDiscountPercent) || 0;
              const onlinePrice =
                disc > 0
                  ? formData.sellingPrice * (1 - disc / 100)
                  : formData.sellingPrice;
              const profit =
                onlinePrice - (Number(formData.purchasePrice) || 0);
              const isLoss = profit < 0;

              return (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    isLoss
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : disc > 0
                        ? "bg-teal-50/70 border-teal-200/80 text-teal-950"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>Customer Online Price:</span>
                    <span className="font-mono text-sm font-bold">
                      ৳{onlinePrice.toFixed(2)} {disc > 0 && `(${disc}% OFF)`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Unit Profit from Online Sale:</span>
                    <span
                      className={`font-mono font-bold ${isLoss ? "text-rose-700" : "text-emerald-700"}`}
                    >
                      {isLoss ? "Loss: -৳" : "+৳"}
                      {Math.abs(profit).toFixed(2)}
                    </span>
                  </div>
                  {isLoss && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">
                      ⚠️ Warning: Online price is lower than purchase price (৳
                      {formData.purchasePrice})!
                    </p>
                  )}
                </div>
              );
            })()}
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Medicine Image
            </label>
            {formData.image ? (
              <div className="relative w-full h-13 rounded-lg overflow-hidden border border-slate-200 group bg-slate-50 flex items-center justify-between px-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-8 h-8 object-cover rounded-lg border border-slate-100 shrink-0"
                  />
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    Image Selected
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("image-upload-input").click()
                    }
                    className="p-1.5 text-slate-400 hover:text-medical-blue-600 hover:bg-medical-blue-50 rounded-md transition-colors"
                    title="Change Image"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "" })}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() =>
                  document.getElementById("image-upload-input").click()
                }
                className="w-full h-13 rounded-lg border border-dashed border-slate-200 hover:border-medical-blue-400 bg-slate-50/50 hover:bg-medical-blue-50/10 flex items-center justify-center gap-2 cursor-pointer transition-all group px-4"
              >
                <Plus
                  size={16}
                  className="text-slate-400 group-hover:text-medical-blue-600"
                />
                <span className="text-xs text-slate-500 font-medium">
                  Upload Image from PC
                </span>
              </div>
            )}
            <input
              id="image-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 2 * 1024 * 1024) {
                    toast.error("Image file size should be less than 2MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData({ ...formData, image: reader.result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
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
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={executeDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2 border-red-600"
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
              <span>Delete</span>
            </Button>
          </>
        }
      >
        <p className="text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-900">
            {medicineToDelete?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
