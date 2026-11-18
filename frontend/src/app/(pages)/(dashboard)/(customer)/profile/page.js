'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Lock, 
  Loader2, 
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Navigation,
  Crosshair,
  ExternalLink
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  getCurrentDevicePosition, 
  reverseGeocode, 
  formatAddressWithCoordinates, 
  parseLocationFromAddress,
  deduplicateAddresses,
  isSameLocation
} from "@/lib/locationUtils";

export default function ProfilePage() {
  const router = useRouter();
  const { customer, loading: loadingCustomer, updateProfile, logoutCustomer } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [saving, setSaving] = useState(false);

  // Address console management states
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [newAddressText, setNewAddressText] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Fetch current GPS position from device and reverse-geocode to address
  const handleDetectDeviceLocation = async (forEditing = false) => {
    setDetectingLocation(true);
    try {
      toast.loading("Accessing device GPS location...", { id: "geo-fetch" });
      const { latitude, longitude } = await getCurrentDevicePosition();
      
      toast.loading("Resolving street and area details...", { id: "geo-fetch" });
      const geo = await reverseGeocode(latitude, longitude);
      toast.dismiss("geo-fetch");

      const areaStr = geo.readable || "Dhaka";
      // Pre-fill a clear template so the user can easily type their House and Flat details
      const prefill = `House/Flat: , Road: ${geo.road ? geo.road + ", " : ""}${areaStr}`;
      const formatted = formatAddressWithCoordinates(prefill, latitude, longitude);

      if (forEditing) {
        setEditingContent(formatted);
      } else {
        setNewAddressText(formatted);
        setIsAddingNew(true);
      }
      toast.success(`GPS pinned (${latitude.toFixed(4)}, ${longitude.toFixed(4)})! Please enter your House & Flat details.`);
    } catch (err) {
      toast.dismiss("geo-fetch");
      toast.error(err.message || "Could not retrieve device location");
    } finally {
      setDetectingLocation(false);
    }
  };

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      if (customer.address) {
        try {
          const parsed = JSON.parse(customer.address);
          if (Array.isArray(parsed)) {
            setAddresses(deduplicateAddresses(parsed));
          } else {
            setAddresses(deduplicateAddresses([customer.address]));
          }
        } catch (e) {
          setAddresses(deduplicateAddresses([customer.address]));
        }
      } else {
        setAddresses([]);
      }
    }
  }, [customer]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      return toast.error("Full name is required");
    }

    let finalAddresses = [...addresses];
    
    // Auto-commit any unsaved text in the "+ Add Address" textarea
    if (newAddressText && newAddressText.trim()) {
      finalAddresses.unshift(newAddressText.trim());
      setAddresses(deduplicateAddresses(finalAddresses));
      setNewAddressText("");
      setIsAddingNew(false);
      toast.success("Added your typed address to list before saving!");
    }

    // Auto-commit any active inline edits
    if (editingIndex !== null && editingContent && editingContent.trim()) {
      finalAddresses[editingIndex] = editingContent.trim();
      setAddresses(deduplicateAddresses(finalAddresses));
      setEditingIndex(null);
      setEditingContent("");
      toast.success("Committed your active address edits before saving!");
    }

    const cleanAddresses = deduplicateAddresses(finalAddresses);

    setSaving(true);
    try {
      await updateProfile({ name, email, address: cleanAddresses });
      setAddresses(cleanAddresses);
    } catch (error) {
      toast.error(error.message || "Failed to update profile settings");
    } finally {
      setSaving(false);
    }
  };

  // Add a new address and save to DB
  const handleAddNewAddress = async () => {
    if (!newAddressText || !newAddressText.trim()) {
      return toast.error("Please type a valid delivery address");
    }
    const cleanItem = newAddressText.trim();
    if (addresses.some((a) => isSameLocation(a, cleanItem))) {
      return toast.error("This location is already saved in your address list!");
    }
    const newList = deduplicateAddresses([cleanItem, ...addresses]);
    
    try {
      await updateProfile({ name, email, address: newList });
      setAddresses(newList);
      setNewAddressText("");
      setIsAddingNew(false);
      toast.success("Address added and saved successfully!");
    } catch (e) {
      toast.error(e.message || "Failed to save address");
    }
  };

  // Start editing an address
  const startEditingAddress = (index) => {
    setEditingIndex(index);
    setEditingContent(addresses[index]);
  };

  // Save the modified address inline and to DB
  const saveEditedAddress = async (index) => {
    if (!editingContent || !editingContent.trim()) {
      return toast.error("Address content cannot be empty");
    }
    const newList = [...addresses];
    newList[index] = editingContent.trim();
    
    try {
      await updateProfile({ name, email, address: newList });
      setAddresses(newList);
      setEditingIndex(null);
      setEditingContent("");
      toast.success("Address modified and saved!");
    } catch (e) {
      toast.error(e.message || "Failed to save address");
    }
  };

  // Delete an address and update DB
  const handleDeleteAddress = async (index) => {
    const newList = addresses.filter((_, i) => i !== index);
    
    try {
      await updateProfile({ name, email, address: newList });
      setAddresses(newList);
      toast.success("Address removed successfully!");
    } catch (e) {
      toast.error(e.message || "Failed to remove address");
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutCustomer();
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
    <div className=" mx-auto w-full">
      <Toaster position="top-center" />
      <div className="space-y-6">

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 flex items-center gap-1">
                    <span>Email Address</span>
                    <Lock size={12} className="text-slate-400" />
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="email" 
                      placeholder="e.g. sajid@gmail.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="w-full h-12 pl-11 pr-4 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm font-semibold cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Saved Delivery Addresses (Console Grid) */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-medical-blue-600 w-5 h-5" />
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">Saved Delivery Locations</h3>
                      <p className="text-xs text-slate-400">Save delivery spots or use device GPS like food delivery apps.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => handleDetectDeviceLocation(false)}
                      disabled={detectingLocation}
                      className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-medical-blue-600 hover:bg-medical-blue-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                      title="Access GPS coordinates from your device and detect current address"
                    >
                      {detectingLocation ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Crosshair size={13} />
                      )}
                      <span>Use Current Location</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setIsAddingNew(true)}
                      className="inline-flex items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold text-medical-blue-600 bg-medical-blue-50 hover:bg-medical-blue-100 transition-all cursor-pointer border border-medical-blue-200/60"
                    >
                      <Plus size={14} />
                      <span>Add Address</span>
                    </button>
                  </div>
                </div>

                {/* Add new address inline box */}
                {isAddingNew && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-medical-blue-100 space-y-3 animate-in slide-in-from-top duration-200">
                    <div className="flex items-center justify-between">
                      <span className="block text-xs font-bold text-slate-700">Register New Delivery Address</span>
                      <button
                        type="button"
                        onClick={() => handleDetectDeviceLocation(false)}
                        disabled={detectingLocation}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-medical-blue-600 hover:text-medical-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer shadow-xs"
                      >
                        {detectingLocation ? <Loader2 size={11} className="animate-spin" /> : <Crosshair size={11} />}
                        <span>Auto-Fill from Device GPS</span>
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 text-xs flex items-start gap-2">
                      <span className="text-sm leading-none mt-0.5">💡</span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-[11px] block text-blue-950">বাড়ি ও ফ্ল্যাট নম্বর উল্লেখ করুন:</span>
                        <p className="text-[10px] text-blue-800 leading-tight">
                          ডিভাইসের জিপিএস আপনার এলাকা ট্র্যাক করে। রাইডার যেন সহজে আপনার দরজায় পৌঁছাতে পারে সেজন্য বাড়ি নং, ফ্ল্যাট নং ও রোড নম্বর লিখে দিন (যেমন: House 14, Flat 4B, Road 5, Mirpur 10)।
                        </p>
                      </div>
                    </div>

                    <textarea 
                      placeholder="Type delivery address (e.g., House 14, Flat 4B, Road 5, Mirpur 10, Dhaka)..."
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      className="w-full min-h-[70px] p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-medical-blue-500 outline-none font-semibold text-slate-800 bg-white resize-none"
                    />

                    {/* GPS Tag & Map preview indicator */}
                    {(() => {
                      const parsed = parseLocationFromAddress(newAddressText);
                      if (parsed.hasCoordinates) {
                        return (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                            <div className="flex items-center gap-2 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>GPS Coordinates Pinned: {parsed.latitude?.toFixed(5)}, {parsed.longitude?.toFixed(5)}</span>
                            </div>
                            <a
                              href={parsed.directionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] underline font-bold flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
                            >
                              <span>Preview Map</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setIsAddingNew(false); setNewAddressText(""); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-all font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button" 
                        onClick={handleAddNewAddress}
                        className="px-3 py-1.5 rounded-lg bg-medical-blue-600 text-white hover:bg-medical-blue-700 transition-all font-bold text-xs cursor-pointer"
                      >
                        Add to List
                      </button>
                    </div>
                  </div>
                )}

                {/* Addresses List display */}
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr, idx) => {
                      const loc = parseLocationFromAddress(addr);
                      return (
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
                              <div className="flex items-center justify-between">
                                <span className="block text-xs font-bold text-slate-500">Edit Address #{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDetectDeviceLocation(true)}
                                  disabled={detectingLocation}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-medical-blue-600 bg-white px-2 py-0.5 rounded-md border border-slate-200 cursor-pointer"
                                >
                                  {detectingLocation ? <Loader2 size={11} className="animate-spin" /> : <Crosshair size={11} />}
                                  <span>Update with Current GPS</span>
                                </button>
                              </div>
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
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MapPin size={16} />
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-wide">
                                    Location #{idx + 1}
                                  </span>
                                  {loc.hasCoordinates && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>GPS: {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-slate-800 leading-relaxed break-words">{loc.cleanAddress}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {/* Open in Google Maps Directions */}
                              <a
                                href={loc.directionsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-medical-blue-50 hover:bg-medical-blue-100 text-medical-blue-700 text-xs font-bold transition-colors border border-medical-blue-100"
                                title="Click to open Google Maps Directions"
                              >
                                <Navigation size={12} />
                                <span className="hidden sm:inline">Directions</span>
                              </a>

                              <button 
                                type="button"
                                onClick={() => startEditingAddress(idx)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors border border-slate-100 cursor-pointer"
                                title="Edit Location"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleDeleteAddress(idx)}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors border border-red-100 cursor-pointer"
                                title="Delete Location"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 text-center space-y-3">
                    <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <h4 className="font-extrabold text-slate-700 text-xs">No address registered yet</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5 max-w-[260px] mx-auto">
                        Use your device's GPS or type an address to enable fast delivery checkout.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDetectDeviceLocation(false)}
                      disabled={detectingLocation}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-medical-blue-600 hover:bg-medical-blue-700 transition-all shadow-sm cursor-pointer"
                    >
                      {detectingLocation ? <Loader2 size={13} className="animate-spin" /> : <Crosshair size={13} />}
                      <span>Use Current Location</span>
                    </button>
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
      </div>
    </div>
  );
}
