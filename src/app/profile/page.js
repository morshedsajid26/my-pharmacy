'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Phone, 
  Lock, 
  ArrowLeft, 
  PlusCircle, 
  LogOut, 
  Loader2, 
  ShieldCheck,
  Save,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Check,
  X
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { 
  getCurrentCustomer, 
  updateCustomerProfileAction, 
  logoutCustomerAction 
} from "@/lib/actions/online-customer.actions";

export default function ProfilePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [saving, setSaving] = useState(false);

  // Address console management states
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [newAddressText, setNewAddressText] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Load customer details
  const loadCustomerData = async () => {
    try {
      const data = await getCurrentCustomer();
      if (!data) {
        toast.error("Please sign in to view your profile settings");
        router.push("/");
        return;
      }
      setCustomer(data);
      setName(data.name || "");
      
      // Safe JSON parsing of multiple addresses
      if (data.address) {
        try {
          const parsed = JSON.parse(data.address);
          if (Array.isArray(parsed)) {
            setAddresses(parsed);
          } else {
            setAddresses([data.address]);
          }
        } catch (e) {
          setAddresses([data.address]);
        }
      } else {
        setAddresses([]);
      }
    } catch (e) {
      toast.error("Failed to load customer profile details");
    } finally {
      setLoadingCustomer(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      return toast.error("Full name is required");
    }

    let finalAddresses = [...addresses];
    
    // Auto-commit any unsaved text in the "+ Add Address" textarea
    if (newAddressText && newAddressText.trim()) {
      finalAddresses.push(newAddressText.trim());
      setAddresses(finalAddresses);
      setNewAddressText("");
      setIsAddingNew(false);
      toast.success("Added your typed address to list before saving!");
    }

    // Auto-commit any active inline edits
    if (editingIndex !== null && editingContent && editingContent.trim()) {
      finalAddresses[editingIndex] = editingContent.trim();
      setAddresses(finalAddresses);
      setEditingIndex(null);
      setEditingContent("");
      toast.success("Committed your active address edits before saving!");
    }

    setSaving(true);
    try {
      const result = await updateCustomerProfileAction(name, finalAddresses);
      if (result.success) {
        setCustomer(result.customer);
        toast.success("Profile saved successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile settings");
    } finally {
      setSaving(false);
    }
  };

  // Add a new address to the local state list
  const handleAddNewAddress = () => {
    if (!newAddressText || !newAddressText.trim()) {
      return toast.error("Please type a valid delivery address");
    }
    const newList = [...addresses, newAddressText.trim()];
    setAddresses(newList);
    setNewAddressText("");
    setIsAddingNew(false);
    toast.success("Address added to your list! Remember to save changes.");
  };

  // Start editing an address
  const startEditingAddress = (index) => {
    setEditingIndex(index);
    setEditingContent(addresses[index]);
  };

  // Save the modified address inline
  const saveEditedAddress = (index) => {
    if (!editingContent || !editingContent.trim()) {
      return toast.error("Address content cannot be empty");
    }
    const newList = [...addresses];
    newList[index] = editingContent.trim();
    setAddresses(newList);
    setEditingIndex(null);
    setEditingContent("");
    toast.success("Address modified! Remember to save changes.");
  };

  // Delete an address from the local state list
  const handleDeleteAddress = (index) => {
    const newList = addresses.filter((_, i) => i !== index);
    setAddresses(newList);
    toast.success("Address removed from your list! Remember to save changes.");
  };

  const handleSignOut = async () => {
    try {
      await logoutCustomerAction();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (e) {
      toast.error("Sign out failed");
    }
  };

  if (loadingCustomer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600 mb-2" />
        <span className="text-slate-500 font-bold text-sm">Loading your profile portal...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <Toaster position="top-center" />

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-medical-blue-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
              <PlusCircle className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                S&S<span className="text-medical-blue-600">Pharmacy</span>
              </h1>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase mt-1 block">
                Customer Profile Settings
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200"
            >
              <ArrowLeft size={14} />
              <span>Back to Shop</span>
            </Link>

            <button 
              onClick={handleSignOut}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all border border-red-100 flex items-center gap-1.5 font-bold text-xs sm:text-sm"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* PROFILE SIDEBAR & DETAILS GRID LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
        <aside className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Account Menu
            </div>
            
            <Link 
              href="/profile"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-medical-blue-50 text-medical-blue-700 transition-all border border-medical-blue-100/50"
            >
              <User size={16} />
              <span>Personal Details</span>
            </Link>

            <Link 
              href="/profile/orders"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all border border-transparent"
            >
              <ShoppingBag size={16} />
              <span>My Orders History</span>
            </Link>
          </div>
        </aside>

        {/* RIGHT COLUMN: EDIT FORM & ADDRESS MANAGER */}
        <section className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Personal Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage your profile credentials and delivery locations.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Part 1: General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="E.g., Sajid Morshed" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full h-12 pl-11 pr-4 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-medical-blue-500/10 focus:border-medical-blue-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                {/* Phone (Read Only) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 flex items-center gap-1">
                    <span>Mobile Number</span>
                    <Lock size={12} className="text-slate-400" />
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="tel" 
                      value={customer?.phone || ""} 
                      disabled
                      className="w-full h-12 pl-11 pr-4 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm font-semibold cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Saved Delivery Addresses (Console Grid) */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-medical-blue-600 w-5 h-5" />
                    <h3 className="text-base font-extrabold text-slate-900">Saved Delivery Locations</h3>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => setIsAddingNew(true)}
                    className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold text-medical-blue-600 bg-medical-blue-50 hover:bg-medical-blue-100 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Add new address inline box */}
                {isAddingNew && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-medical-blue-100 space-y-3 animate-in slide-in-from-top duration-200">
                    <span className="block text-xs font-bold text-slate-600">Register New Address</span>
                    <textarea 
                      placeholder="Type your new delivery address here (House, Flat, Street, Area, City)..."
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      className="w-full min-h-[70px] p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-medical-blue-500 outline-none font-semibold text-slate-800 bg-white resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setIsAddingNew(false); setNewAddressText(""); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all font-bold text-xs"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAddNewAddress}
                        className="px-3 py-1.5 rounded-lg bg-medical-blue-600 text-white hover:bg-medical-blue-700 transition-all font-bold text-xs"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                )}

                {/* Addresses List display */}
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-2xl border transition-all ${
                          editingIndex === idx 
                            ? "bg-slate-50 border-medical-blue-200" 
                            : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        {editingIndex === idx ? (
                          <div className="space-y-3">
                            <span className="block text-xs font-bold text-slate-500">Edit Address #{idx + 1}</span>
                            <textarea 
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full min-h-[70px] p-2.5 border border-medical-blue-300 focus:border-medical-blue-500 rounded-xl text-xs outline-none font-semibold text-slate-800 bg-white resize-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button 
                                type="button" 
                                onClick={() => setEditingIndex(null)}
                                className="p-1.5 rounded-lg bg-slate-200 text-slate-500 hover:bg-slate-300 transition-all"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => saveEditedAddress(idx)}
                                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
                                title="Update Address"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MapPin size={16} />
                              </div>
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-wide">
                                  Location #{idx + 1}
                                </span>
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed break-words">{addr}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button 
                                type="button"
                                onClick={() => startEditingAddress(idx)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors border border-slate-100"
                                title="Edit Location"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleDeleteAddress(idx)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors border border-red-100"
                                title="Delete Location"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 text-center">
                    <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <h4 className="font-extrabold text-slate-600 text-xs">No address registered</h4>
                    <p className="text-slate-400 text-[10px] mt-0.5 max-w-[200px] mx-auto">
                      Please register at least one home delivery address. Orders cannot be created without it!
                    </p>
                  </div>
                )}
              </div>

              {/* Security info card */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                <ShieldCheck size={18} className="text-medical-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-500 leading-normal">
                  Pressing **Save Changes** updates your permanent profile. Make sure to finalize edits here to synchronize your active checkout shipping list!
                </span>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 h-12 bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-medical-blue-600/15 disabled:opacity-50 transition-all text-sm"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
