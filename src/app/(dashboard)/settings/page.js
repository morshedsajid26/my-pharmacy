"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, updateUserAction } from "@/lib/actions/auth.actions";
import { getStorefrontSettingsAction, updateStorefrontSettingsAction } from "@/lib/actions/online-admin.actions";
import InputField from "@/components/InputField";
import { Button } from "@/components/Button";
import Password from "@/components/Password";
import { Camera, Save, Loader2, Shield, Trash2, Edit2, X, Settings, Truck, Percent, ShoppingBag, Globe } from "lucide-react";
import toast from "react-hot-toast";

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
  
  // Storefront settings state
  const [minOrder, setMinOrder] = useState(500);
  const [delCharge, setDelCharge] = useState(20);
  const [discThreshold, setDiscThreshold] = useState(1000);
  const [discPercent, setDiscPercent] = useState(10);
  
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
        const [fullUser, storeSettings] = await Promise.all([
          getCurrentUser(),
          getStorefrontSettingsAction()
        ]);
        
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
          setMinOrder(storeSettings.minOrderForFreeDelivery);
          setDelCharge(storeSettings.deliveryCharge);
          // Use first discount tier if available
          const firstTier = storeSettings.discountTiers && storeSettings.discountTiers[0];
          setDiscThreshold(firstTier?.threshold ?? 0);
          setDiscPercent(firstTier?.percent ?? 0);
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

      const result = await updateUserAction(payload);

      if (result.success) {
        setUser(result.user);
        
        const updatedSnapshot = {
          name: result.user.name || "",
          email: result.user.email || "",
          profilePicture: result.user.profilePicture || "",
          password: "",
        };
        setOriginalData(updatedSnapshot);
        setPassword("");
        setConfirmPassword("");
        setIsEditing(false);
        
        toast.success("Profile settings updated successfully!");
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

    if (parseFloat(minOrder) < 0 || parseFloat(delCharge) < 0 || parseFloat(discThreshold) < 0 || parseFloat(discPercent) < 0) {
      toast.error("Settings values cannot be negative.");
      return;
    }

    if (parseFloat(discPercent) > 100) {
      toast.error("Discount percentage cannot exceed 100%.");
      return;
    }

    setIsSavingStorefront(true);
    try {
      const payload = {
        minOrderForFreeDelivery: parseFloat(minOrder),
        deliveryCharge: parseFloat(delCharge),
        discountTiers: [{
          threshold: parseFloat(discThreshold),
          percent: parseFloat(discPercent)
        }]
      };

      const result = await updateStorefrontSettingsAction(payload);
      if (result.success) {
        setIsEditingStorefront(false);
        toast.success("Storefront settings updated successfully!");
      }
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <label className="text-xs font-black text-slate-600 block">Standard Delivery Charge (৳)</label>
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
                    <p className="text-[9px] text-slate-400 font-medium">Fixed shipping charge applied if the order size falls below the free tier threshold.</p>
                  </div>
                </div>
              </div>

              {/* Discount Thresholds Settings */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Percent size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Promotional Order Discounts</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Reward customers ordering high values with percentage incentives.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Order Discount Threshold (৳)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        disabled={!isEditingStorefront}
                        value={discThreshold}
                        onChange={(e) => setDiscThreshold(e.target.value)}
                        className={`w-full h-11 pl-8 pr-4 text-xs font-bold border rounded-xl outline-none transition-colors font-mono ${
                          !isEditingStorefront 
                            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-white border-slate-200 focus:border-medical-blue-500 focus:ring-1 focus:ring-medical-blue-500"
                        }`}
                        placeholder="e.g. 1000"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Automatic percentage discount will trigger when the customer subtotal exceeds this amount.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Discount Rate (%)</label>
                    <div className="relative">
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm select-none">%</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        disabled={!isEditingStorefront}
                        value={discPercent}
                        onChange={(e) => setDiscPercent(e.target.value)}
                        className={`w-full h-11 pl-4 pr-8 text-xs font-bold border rounded-xl outline-none transition-colors font-mono ${
                          !isEditingStorefront 
                            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed" 
                            : "bg-white border-slate-200 focus:border-medical-blue-500 focus:ring-1 focus:ring-medical-blue-500"
                        }`}
                        placeholder="e.g. 10"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">Percentage multiplier applied directly as savings to the customer's grand total.</p>
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
