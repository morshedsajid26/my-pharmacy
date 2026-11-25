"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import InputField from "@/components/InputField";
import { Button } from "@/components/Button";
import Password from "@/components/Password";
import { Camera, Save, Loader2, Shield, Trash2, Edit2, X, Settings, Truck, ShoppingBag, Globe, MapPin, Crosshair, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { getCurrentDevicePosition, reverseGeocode } from "@/lib/locationUtils";

export default function SettingsPage() {
  const { user: authUser, setUser } = useAuth();
  
  // Navigation / Tabs State
  const [activeTab, setActiveTab] = useState("account"); // "account" or "storefront"

  // Account settings state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  
  // Store Location state (configured in Account Profile)
  const [storeAddress, setStoreAddress] = useState("");
  const [storeLat, setStoreLat] = useState("");
  const [storeLng, setStoreLng] = useState("");
  const [detectingStoreLoc, setDetectingStoreLoc] = useState(false);
  const [storeGpsPrompt, setStoreGpsPrompt] = useState({
    isOpen: false,
    lat: "",
    lng: "",
    houseShop: "",
    roadBlock: "",
    areaCity: "",
  });
  const [savingStoreLoc, setSavingStoreLoc] = useState(false);

  // Storefront settings state
  const [minOrder, setMinOrder] = useState(500);
  const [delCharge, setDelCharge] = useState(20);
  const [delChargePerKm, setDelChargePerKm] = useState(5);
  
  // Track original values to reset on Cancel
  const [originalData, setOriginalData] = useState(null);
  
  // Edit state toggle
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingStorefront, setIsEditingStorefront] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingStorefront, setIsSavingStorefront] = useState(false);

  // Load current user profile and storefront settings from DB on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, storeSettingsRes] = await Promise.all([
          api.get("/auth/me").catch(() => api.get("/auth/profile")),
          api.get("/owner/settings")
        ]);
        
        const fullUser = profileRes?.user || profileRes?.customer || profileRes?.data?.user;
        const storeSettings = storeSettingsRes?.data || storeSettingsRes;

        
        if (fullUser) {
          const data = {
            name: fullUser.name || "",
            email: fullUser.email || "",
            profilePicture: fullUser.profilePicture || "",
            password: "",
          };
          setName(data.name);
          setEmail(data.email);
          setProfilePicture(data.profilePicture);
          setPassword("");
          setConfirmPassword("");
          setOriginalData(data);
        }

        if (storeSettings) {
          setMinOrder(storeSettings.minOrderForFreeDelivery ?? 500);
          setDelCharge(storeSettings.deliveryCharge ?? 20);
          setDelChargePerKm(storeSettings.deliveryChargePerKm ?? 5);
          setStoreAddress(storeSettings.storeAddress || "");
          setStoreLat(storeSettings.storeLat != null ? String(storeSettings.storeLat) : "");
          setStoreLng(storeSettings.storeLng != null ? String(storeSettings.storeLng) : "");
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load profile or storefront settings");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle profile image file selection & canvas-based base64 downscaling/compression
  const handleImageChange = (e) => {
    if (!isEditing) return;
    
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setProfilePicture(compressedBase64);
        toast.success("Profile image optimized successfully!");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  // Remove profile picture
  const handleRemoveImage = () => {
    if (!isEditing) return;
    setProfilePicture("");
    toast.success("Profile picture removed");
  };

  // Discard profile edits and restore database values
  const handleCancel = () => {
    if (originalData) {
      setName(originalData.name);
      setEmail(originalData.email);
      setProfilePicture(originalData.profilePicture);
    }
    setPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    toast.success("Changes discarded");
  };

  // Detect Store GPS Location & open quick Road/Block confirmation
  const handleDetectStoreLocation = async () => {
    setDetectingStoreLoc(true);
    try {
      toast.loading("Detecting store GPS location...", { id: "store-geo" });
      const { latitude, longitude } = await getCurrentDevicePosition();
      toast.loading("Resolving store address...", { id: "store-geo" });
      const geo = await reverseGeocode(latitude, longitude);
      toast.dismiss("store-geo");

      const latStr = Number(latitude).toFixed(6);
      const lngStr = Number(longitude).toFixed(6);

      setStoreGpsPrompt({
        isOpen: true,
        lat: latStr,
        lng: lngStr,
        houseShop: geo.houseNumber ? `House ${geo.houseNumber}` : "",
        roadBlock: geo.road || "",
        areaCity: geo.readable || `GPS Location (${latStr}, ${lngStr})`,
      });
      toast.success("GPS pinned! Add Road / Block if needed and save.");
    } catch (err) {
      toast.dismiss("store-geo");
      toast.error(err.message || "Could not detect store GPS location");
    } finally {
      setDetectingStoreLoc(false);
    }
  };

  // Confirm & Save Store GPS Location
  const handleSaveStoreGpsLocation = async () => {
    setSavingStoreLoc(true);
    try {
      const parts = [];
      if (storeGpsPrompt.houseShop.trim()) parts.push(storeGpsPrompt.houseShop.trim());
      if (storeGpsPrompt.roadBlock.trim()) {
        const rb = storeGpsPrompt.roadBlock.trim();
        if (!storeGpsPrompt.areaCity.toLowerCase().includes(rb.toLowerCase())) {
          parts.push(rb);
        }
      }
      if (storeGpsPrompt.areaCity.trim()) parts.push(storeGpsPrompt.areaCity.trim());

      const finalAddr = parts.filter(Boolean).join(", ") || `GPS Location (${storeGpsPrompt.lat}, ${storeGpsPrompt.lng})`;

      await api.put("/owner/settings", {
        storeAddress: finalAddr,
        storeLat: parseFloat(storeGpsPrompt.lat),
        storeLng: parseFloat(storeGpsPrompt.lng),
      });

      setStoreLat(storeGpsPrompt.lat);
      setStoreLng(storeGpsPrompt.lng);
      setStoreAddress(finalAddr);
      setStoreGpsPrompt((prev) => ({ ...prev, isOpen: false }));
      toast.success("Store GPS location saved!");
    } catch (err) {
      toast.error(err.message || "Failed to save store location");
    } finally {
      setSavingStoreLoc(false);
    }
  };

  // Handle Account Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing) return;

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        email,
        profilePicture,
      };

      if (password && password.trim() !== "") {
        payload.password = password;
      }

      const [res] = await Promise.all([
        api.put("/auth/profile", payload),
        api.put("/owner/settings", {
          storeAddress: storeAddress.trim() || null,
          storeLat: storeLat !== "" ? parseFloat(storeLat) : null,
          storeLng: storeLng !== "" ? parseFloat(storeLng) : null,
        }),
      ]);
      const result = res?.data || res;

      if (result.success || result.user) {
        const updatedUser = result.user || result.customer;
        setUser(updatedUser);
        
        const updatedSnapshot = {
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          profilePicture: updatedUser.profilePicture || "",
          password: "",
        };
        setOriginalData(updatedSnapshot);
        setPassword("");
        setConfirmPassword("");
        setIsEditing(false);
        
        toast.success("Profile & Store Location updated successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Storefront Form Submission
  const handleStorefrontSubmit = async (e) => {
    e.preventDefault();
    if (!isEditingStorefront) return;

    if (parseFloat(minOrder) < 0 || parseFloat(delCharge) < 0 || parseFloat(delChargePerKm) < 0) {
      toast.error("Settings values cannot be negative.");
      return;
    }

    setIsSavingStorefront(true);
    try {
      const payload = {
        minOrderForFreeDelivery: parseFloat(minOrder),
        deliveryCharge: parseFloat(delCharge),
        deliveryChargePerKm: parseFloat(delChargePerKm),
        discountTiers: [],
      };

      await api.put("/owner/settings", payload);
      setIsEditingStorefront(false);
      toast.success("Storefront settings updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update storefront settings");
    } finally {
      setIsSavingStorefront(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-medium animate-pulse text-sm">
          Loading settings panel...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 mx-auto pb-12">
      {/* Header and Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure administrative accounts and customize e-commerce storefront pricing thresholds.
          </p>
        </div>
        
        {/* Tab Controls Selector */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex self-start sm:self-center shadow-inner border border-slate-200/50">
          <button
            onClick={() => setActiveTab("account")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "account"
                ? "bg-white text-slate-950 shadow-md border-b border-slate-100"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <Shield size={14} />
            <span>Account Profile</span>
          </button>
          <button
            onClick={() => setActiveTab("storefront")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "storefront"
                ? "bg-white text-slate-950 shadow-md border-b border-slate-100"
                : "text-slate-500 hover:text-slate-950"
            }`}
          >
            <Globe size={14} />
            <span>Storefront Settings</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "account" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Account Credentials</h2>
              <p className="text-xs text-slate-400">Manage login credentials and optimized display profiles.</p>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="gap-2 rounded-xl text-xs font-bold px-4 py-2 bg-medical-blue-600 text-white hover:bg-medical-blue-700 shadow-sm"
              >
                <Edit2 size={13} />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side: Avatar Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-md flex items-center justify-center overflow-hidden bg-slate-100 ring-2 ring-slate-100 relative transition-transform duration-300">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-300 text-5xl font-black uppercase">
                      {name ? name.charAt(0) : "U"}
                    </span>
                  )}
                </div>

                {/* Camera Overlay Icon */}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-medical-blue-600 hover:bg-medical-blue-700 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors duration-200 border-2 border-white">
                    <Camera size={18} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-950 text-base">{name || "Pharmacy Admin"}</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-100 capitalize">
                  <Shield size={12} />
                  {authUser?.role || "Staff"}
                </span>
              </div>

              <div className="w-full pt-4 border-t border-slate-100 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Profile Picture
                </p>
                {isEditing ? (
                  <>
                    <div className="flex gap-2">
                      <label className="flex-1 py-2 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer transition-all flex items-center justify-center gap-1">
                        <Camera size={13} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {profilePicture && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="py-2 px-3 text-xs font-bold bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 text-rose-600 transition-all flex items-center justify-center gap-1"
                        >
                          <Trash2 size={13} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 font-medium bg-slate-50 py-2 rounded-xl border border-slate-100">
                    Click "Edit Profile" to modify image.
                  </p>
                )}
              </div>
            </div>

            {/* Right Side: Account Form */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-950 font-black text-base">Security details</h3>
                  <p className="text-slate-400 text-xs font-medium">Keep your login credentials up to date.</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${isEditing ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-400 border border-slate-150"}`}>
                  {isEditing ? "Editing Mode" : "Locked"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  placeholder="Enter operator full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  readonly={!isEditing}
                  inputClass={`rounded-lg transition-colors ${!isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                  required
                />
                <InputField
                  label="Email Address"
                  type="email"
                  placeholder="operator@pharmacy.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readonly={!isEditing}
                  inputClass={`rounded-lg transition-colors ${!isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                  required
                />
                <Password
                  label="New Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  readonly={!isEditing}
                  inputClass={`rounded-lg transition-colors ${!isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                />
                <Password
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  readonly={!isEditing}
                  inputClass={`rounded-lg transition-colors ${!isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                />
              </div>

              {/* Store Location Section (GPS Only) */}
              <div className="pt-5 border-t border-slate-100 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Store GPS Location</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Used to calculate per-km delivery distance to customer locations.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectStoreLocation}
                    disabled={detectingStoreLoc}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-medical-blue-600 hover:bg-medical-blue-700 px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {detectingStoreLoc ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Crosshair size={13} />
                    )}
                    <span>{storeLat && storeLng ? "Update Store GPS" : "Set Store GPS Location"}</span>
                  </button>
                </div>

                {storeGpsPrompt.isOpen ? (
                  <div className="p-4 rounded-xl bg-white border-2 border-medical-blue-500 shadow-sm space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <MapPin size={14} className="text-medical-blue-600" />
                        <span>Confirm Store Address Details</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>GPS Pinned</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Shop / House No. (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Shop 4, House 12"
                          value={storeGpsPrompt.houseShop}
                          onChange={(e) => setStoreGpsPrompt({ ...storeGpsPrompt, houseShop: e.target.value })}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:border-medical-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Road / Block / Section / Village
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Road 5, Block C / Vill: Charpara"
                          value={storeGpsPrompt.roadBlock}
                          onChange={(e) => setStoreGpsPrompt({ ...storeGpsPrompt, roadBlock: e.target.value })}
                          className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:border-medical-blue-500 outline-none"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Area / Upazila / District (Auto-detected from GPS)
                      </label>
                      <input
                        type="text"
                        value={storeGpsPrompt.areaCity}
                        onChange={(e) => setStoreGpsPrompt({ ...storeGpsPrompt, areaCity: e.target.value })}
                        className="w-full h-9 px-3 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setStoreGpsPrompt((prev) => ({ ...prev, isOpen: false }))}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveStoreGpsLocation}
                        disabled={savingStoreLoc}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-medical-blue-600 hover:bg-medical-blue-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {savingStoreLoc ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        <span>Save Store Location</span>
                      </button>
                    </div>
                  </div>
                ) : storeLat && storeLng ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>GPS Pinned</span>
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 break-words">
                        {storeAddress || "Store Location Pinned"}
                      </p>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${storeLat},${storeLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-medical-blue-600 hover:text-medical-blue-700 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                      title="View Store on Google Maps"
                    >
                      <span>Map</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 font-semibold">
                    Store GPS location is not set yet. Click &quot;Set Store GPS Location&quot; while at your pharmacy to pin it automatically.
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="gap-2 rounded-xl text-xs font-bold px-5 py-3 transition-all"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="gap-2 rounded-xl text-xs font-bold px-6 py-3 bg-medical-blue-600 text-white hover:bg-medical-blue-700 shadow-md shadow-medical-blue-600/10 transition-all animate-in fade-in"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">E-Commerce Pricing Configuration</h2>
              <p className="text-xs text-slate-400">Control shipping charges, free delivery thresholds, and automatic order discount tiers.</p>
            </div>
            {!isEditingStorefront && (
              <Button
                onClick={() => setIsEditingStorefront(true)}
                className="gap-2 rounded-xl text-xs font-bold px-4 py-2 bg-medical-blue-600 text-white hover:bg-medical-blue-700 shadow-sm"
              >
                <Edit2 size={13} />
                <span>Configure Rates</span>
              </Button>
            )}
          </div>

          <form onSubmit={handleStorefrontSubmit} className="space-y-8">
            <div className="max-w-2xl">
              {/* Delivery and Logistics Settings */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Delivery & Shipping Fees</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Standard shipping rates and free delivery incentives.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Minimum Order for Free Delivery (৳)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        disabled={!isEditingStorefront}
                        value={minOrder}
                        onChange={(e) => setMinOrder(e.target.value)}
                        className={`w-full h-11 pl-8 pr-4 text-xs font-bold border rounded-xl outline-none transition-colors font-mono ${
                          !isEditingStorefront 
                            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-white border-slate-200 focus:border-medical-blue-500 focus:ring-1 focus:ring-medical-blue-500"
                        }`}
                        placeholder="e.g. 500"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Orders totaling this size or higher will qualify for 100% free delivery charges.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Delivery Rate Per KM (৳ / km)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        required
                        disabled={!isEditingStorefront}
                        value={delChargePerKm}
                        onChange={(e) => setDelChargePerKm(e.target.value)}
                        className={`w-full h-11 pl-8 pr-12 text-xs font-bold border rounded-xl outline-none transition-colors font-mono ${
                          !isEditingStorefront 
                            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-white border-slate-200 focus:border-medical-blue-500 focus:ring-1 focus:ring-medical-blue-500"
                        }`}
                        placeholder="e.g. 5"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[11px] select-none">/ km</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">
                      Distance-based charge calculated from your Store GPS location to the customer's GPS address (minimum 1 km charge).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Fallback Flat Delivery Charge (৳)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        disabled={!isEditingStorefront}
                        value={delCharge}
                        onChange={(e) => setDelCharge(e.target.value)}
                        className={`w-full h-11 pl-8 pr-4 text-xs font-bold border rounded-xl outline-none transition-colors font-mono ${
                          !isEditingStorefront 
                            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-white border-slate-200 focus:border-medical-blue-500 focus:ring-1 focus:ring-medical-blue-500"
                        }`}
                        placeholder="e.g. 20"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Used only if a customer's address does not have GPS coordinates pinned (or store GPS is not set).</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Buttons for Storefront settings */}
            {isEditingStorefront && (
              <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm flex items-center justify-end gap-3 transition-all animate-in fade-in duration-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditingStorefront(false);
                    toast.success("Settings changes cancelled");
                  }}
                  className="gap-2 rounded-xl text-xs font-bold px-5 py-3 transition-all"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </Button>
                
                <Button
                  type="submit"
                  disabled={isSavingStorefront}
                  className="gap-2 rounded-xl text-xs font-bold px-6 py-3 bg-medical-blue-600 text-white hover:bg-medical-blue-700 shadow-md shadow-medical-blue-600/10 transition-all"
                >
                  {isSavingStorefront ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Saving settings...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Apply Storefront Settings</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
