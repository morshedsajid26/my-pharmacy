"use client";

import { useState, useMemo } from "react";
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Phone,
  Mail,
  Truck,
  CheckCircle2,
  Users,
  Search,
  Calendar,
} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useStaff } from "@/hooks/useStaff";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";
import InputField from "@/components/InputField";
import Password from "@/components/Password";

export default function StaffManagementPage() {
  const {
    staffList,
    isLoading,
    createStaff,
    isCreating,
    updateStaff,
    isUpdating,
    deleteStaff,
    isDeleting,
  } = useStaff();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const filteredStaff = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return staffList;
    return staffList.filter(
      (s) =>
        String(s.name || "").toLowerCase().includes(q) ||
        String(s.email || "").toLowerCase().includes(q) ||
        String(s.phone || "").toLowerCase().includes(q)
    );
  }, [staffList, searchTerm]);

  const totalActiveDeliveries = useMemo(
    () => staffList.reduce((acc, s) => acc + (s.activeDeliveries || 0), 0),
    [staffList]
  );

  const totalCompletedDeliveries = useMemo(
    () => staffList.reduce((acc, s) => acc + (s.completedDeliveries || 0), 0),
    [staffList]
  );

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({ name: "", email: "", phone: "", password: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      password: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingStaff) {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };
        if (formData.password && formData.password.trim() !== "") {
          payload.password = formData.password;
        }
        await updateStaff({ id: editingStaff.id, data: payload });
      } else {
        await createStaff(formData);
      }
      setIsModalOpen(false);
    } catch {
      // Error toast handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    try {
      await deleteStaff(staffToDelete.id);
      setStaffToDelete(null);
    } catch {
      // Error toast handled in hook
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCog className="text-medical-blue-600 w-7 h-7" />
            <span>Staff Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage staff accounts for POS sales, medicine inventory viewing, and online order deliveries.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          className="self-start sm:self-auto gap-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm"
        >
          <Plus size={18} />
          <span>Add New Staff</span>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">{staffList.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Out For Delivery</p>
            <p className="text-2xl font-black text-sky-700 font-mono mt-1">{totalActiveDeliveries}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Truck size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Deliveries</p>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{totalCompletedDeliveries}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Search & Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-medical-blue-500 transition-colors"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            Showing {filteredStaff.length} of {staffList.length} staff member(s)
          </span>
        </div>

        {isLoading ? (
          <div className="h-56 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
            <span className="text-sm font-medium">Loading staff accounts...</span>
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-extrabold text-[11px] tracking-wider uppercase border-b border-slate-100">
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-center">Active Deliveries</th>
                  <th className="px-6 py-4 text-center">Completed</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-medical-blue-50 border border-medical-blue-200/70 flex items-center justify-center text-medical-blue-700 font-black text-xs shrink-0">
                          {staff.name ? staff.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{staff.name || "Unnamed Staff"}</div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Staff
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Mail size={12} className="text-slate-400" />
                        <span>{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Phone size={12} className="text-slate-400" />
                        <span>{staff.phone || "No phone"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          staff.activeDeliveries > 0
                            ? "bg-sky-50 text-sky-700 border border-sky-200"
                            : "bg-slate-50 text-slate-400 border border-slate-200"
                        }`}
                      >
                        <Truck size={12} />
                        <span>{staff.activeDeliveries || 0}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} />
                        <span>{staff.completedDeliveries || 0}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{new Date(staff.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(staff)}
                          className="p-2 rounded-lg text-slate-500 hover:text-medical-blue-600 hover:bg-medical-blue-50 transition-colors cursor-pointer"
                          title="Edit Staff"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setStaffToDelete(staff)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <UserCog size={26} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Staff Accounts Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Create your first staff account so they can log in to the Staff Dashboard, record POS sales, and complete assigned online deliveries.
            </p>
            <Button
              onClick={openAddModal}
              className="mt-4 gap-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-white rounded-xl px-4 py-2 text-xs font-bold"
            >
              <Plus size={15} />
              <span>Create First Staff Account</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? "Edit Staff Account" : "Create New Staff Account"}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isCreating || isUpdating}
              className="bg-medical-blue-600 hover:bg-medical-blue-700 text-white gap-2"
            >
              {(isCreating || isUpdating) && <Loader2 size={16} className="animate-spin" />}
              <span>{editingStaff ? "Update Staff" : "Create Account"}</span>
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <InputField
            label="Full Name"
            placeholder="e.g. Rahim Uddin"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <InputField
            label="Email Address (Used for Login)"
            type="email"
            placeholder="e.g. rahim@pharmacy.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <InputField
            label="Phone Number"
            type="text"
            placeholder="e.g. 017xxxxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Password
            label={editingStaff ? "New Password (leave blank to keep unchanged)" : "Password"}
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium">
            Staff accounts can log in via the standard login page using their Email &amp; Password. They will automatically access the dedicated Staff Dashboard (POS Sales, Medicines, and Assigned Orders).
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        title="Delete Staff Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setStaffToDelete(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2 border-rose-600"
            >
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              <span>Delete Staff</span>
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete staff account{" "}
          <span className="font-bold text-slate-900">{staffToDelete?.name}</span> ({staffToDelete?.email})? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
