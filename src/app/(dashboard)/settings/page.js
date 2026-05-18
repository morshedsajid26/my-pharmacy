"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getCurrentUser, updateUserAction } from "@/lib/actions/auth.actions";
import InputField from "@/components/InputField";
import { Button } from "@/components/Button";
import Password from "@/components/Password";
import { Camera, Save, Loader2, Shield, Trash2, Edit2, X } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user: authUser, setUser } = useAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  
  // Track original values to reset on Cancel
  const [originalData, setOriginalData] = useState(null);
  
  // Edit state toggle
  const [isEditing, setIsEditing] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current user profile from DB on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const fullUser = await getCurrentUser();
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
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Failed to load profile settings");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  // Handle profile image file selection & canvas-based base64 downscaling/compression
  const handleImageChange = (e) => {
    if (!isEditing) return; // Prevent uploading unless in edit mode
    
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
        // Create canvas for downscaling
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

        // Convert to compressed jpeg base64 (70% quality)
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

  // Discard edits and restore database values
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

  // Handle Form Submission
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

      // Only submit password if the operator typed a new one
      if (password && password.trim() !== "") {
        payload.password = password;
      }

      const result = await updateUserAction(payload);

      if (result.success) {
        // Sync context state immediately across layouts
        setUser(result.user);
        
        // Save new original snapshot
        const updatedSnapshot = {
          name: result.user.name || "",
          email: result.user.email || "",
          profilePicture: result.user.profilePicture || "",
          password: "",
        };
        setOriginalData(updatedSnapshot);
        setPassword("");
        setConfirmPassword("");
        setIsEditing(false); // Toggle back to readonly mode
        
        toast.success("Profile settings updated successfully!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update profile settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600" />
        <p className="font-medium animate-pulse text-sm">
          Loading profile settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your pharmacy operator credentials, login email, and system profile picture.
          </p>
        </div>
        
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="gap-2 rounded-xl text-xs font-bold px-5 py-2.5 bg-medical-blue-600 text-white hover:bg-medical-blue-700 shadow-sm transition-all self-start sm:self-center"
          >
            <Edit2 size={14} />
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
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                  Accepts JPG, PNG or WebP files. Max file size is 2MB.
                </p>
              </>
            ) : (
              <p className="text-xs text-slate-400 font-medium bg-slate-50 py-2 rounded-xl border border-slate-100">
                Click "Edit Profile" above to modify.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Account Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-slate-950 font-black text-base">Account Credentials</h3>
              <p className="text-slate-400 text-xs font-medium">Update your administrative login credentials below.</p>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${isEditing ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-50 text-slate-400 border border-slate-150"}`}>
              {isEditing ? "Editing Mode" : "Locked"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Operator Name */}
            <div className="relative">
              <InputField
                label="Full Name"
                placeholder="Enter operator full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                readonly={!isEditing}
                inputClass={`rounded-lg transition-colors ${!isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
                required
              />
            </div>

            {/* Operator Email */}
            <div className="relative">
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
            </div>

            {/* Password */}
            <Password
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              readonly={!isEditing}
              inputClass={`rounded-lg transition-colors ${!isEditing ? "bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
            />

            {/* Confirm Password */}
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
                className="gap-2 rounded-xl text-xs font-bold px-6 py-3 bg-medical-blue-600 text-white hover:bg-medical-blue-700 shadow-md shadow-medical-blue-600/10 hover:translate-y-[-1px] active:translate-y-[0px] transition-all"
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
  );
}
