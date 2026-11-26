"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  Eye,
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
import { Table } from "@/components/Table";
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

  const staffColumns = useMemo(
    () => [
      {
        key: "name",
        Title: "Staff Member",
        align: "left",
        width: "19%",
        render: (staff) => (
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-xl bg-medical-blue-50 border border-medical-blue-200/70 flex items-center justify-center text-medical-blue-700 font-black text-xs shrink-0">
              {staff.name ? staff.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="min-w-0">
              <Link
                href={`/staff-management/${staff.id}`}
                className="font-bold text-slate-900 hover:text-medical-blue-600 transition-colors block truncate"
              >
                {staff.name || "Unnamed Staff"}
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Staff
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        Title: "Contact",
        align: "left",
        width: "21%",
        render: (staff) => (
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Mail size={12} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[180px]">{staff.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Phone size={12} className="text-slate-400 shrink-0" />
              <span>{staff.phone || "No phone"}</span>
            </div>
          </div>
        ),
      },
      {
        key: "todaySalesAmount",
        Title: "Today's Sales",
        width: "13%",
        render: (staff) => (
          <div>
            <div className="font-black text-slate-900 font-mono text-xs">
              ৳{Number(staff.todaySalesAmount || 0).toFixed(0)}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              {staff.todaySalesCount || 0} bills
            </div>
          </div>
        ),
      },
      {
        key: "monthlySalesAmount",
        Title: "Monthly Sales",
        width: "13%",
        render: (staff) => (
          <span className="font-bold text-emerald-700 font-mono text-xs">
            ৳{Number(staff.monthlySalesAmount || 0).toFixed(0)}
          </span>
        ),
      },
      {
        key: "activeDeliveries",
        Title: "Assigned Orders",
        width: "14%",
        render: (staff) => (
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                staff.activeDeliveries > 0
                  ? "bg-sky-50 text-sky-700 border border-sky-200"
                  : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}
              title="Out for delivery (Shipped)"
            >
              <Truck size={11} />
              <span>{staff.activeDeliveries || 0}</span>
            </span>
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
              title="Completed deliveries"
            >
              <CheckCircle2 size={11} />
              <span>{staff.completedDeliveries || 0}</span>
            </span>
          </div>
        ),
      },
      {
        key: "createdAt",
        Title: "Joined",
        width: "10%",
        render: (staff) => (
          <div className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Calendar size={11} className="text-slate-400" />
            <span>{new Date(staff.createdAt).toLocaleDateString()}</span>
          </div>
        ),
      },
      {
        key: "actions",
        Title: "Actions",
        width: "10%",
        sortable: false,
        render: (staff) => (
          <div className="flex items-center justify-center gap-1.5">
            <Link
              href={`/staff-management/${staff.id}`}
              className="p-1.5 rounded-lg bg-medical-blue-50 text-medical-blue-600 hover:bg-medical-blue-100 transition-colors"
              title="View Staff Performance & Assigned Orders"
            >
              <Eye size={15} />
            </Link>
            <button
              onClick={() => openEditModal(staff)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-medical-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Edit Staff"
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => setStaffToDelete(staff)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Staff"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

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
            Create staff accounts, view daily/monthly/yearly sales performance, and track assigned deliveries.
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

      {/* Search Toolbar + Shared Table Component */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/85">
          <div className="relative w-full sm:max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-medical-blue-500 transition-colors"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">
            Showing {filteredStaff.length} of {staffList.length} staff member(s)
          </span>
        </div>

        <Table
          TableHeads={staffColumns}
          TableRows={filteredStaff}
          isLoading={isLoading}
          emptyMessage="No staff accounts found. Click 'Add New Staff' to create one."
        />
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
            Staff accounts log in via the standard login page using their Email &amp; Password and get access to the dedicated Staff Dashboard (Sales POS, Medicines, Assigned Orders).
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
