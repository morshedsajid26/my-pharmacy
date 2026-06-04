'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  ShoppingBag,
  ArrowLeft,
  PlusCircle,
  LogOut,
  FileText,
  Loader2,
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Clock,
  X
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { 
  getCurrentCustomer, 
  logoutCustomerAction 
} from "@/lib/actions/online-customer.actions";
import { 
  createPrescriptionOrder, 
  getCustomerPrescriptionOrders 
} from "@/lib/actions/prescription.actions";

export default function CustomerPrescriptionsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Upload Form State
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [durationDays, setDurationDays] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // View Modal State
  const [viewingFile, setViewingFile] = useState(null);

  // Load customer details
  const loadCustomerData = async () => {
    try {
      const data = await getCurrentCustomer();
      if (!data) {
        toast.error("Please sign in to view your prescriptions");
        router.push("/");
        return;
      }
      setCustomer(data);
    } catch (e) {
      toast.error("Failed to load customer profile details");
    } finally {
      setLoadingCustomer(false);
    }
  };

  // Load customer prescription orders
  const loadOrdersData = async () => {
    try {
      const data = await getCustomerPrescriptionOrders(customer.id);
      setOrders(data || []);
    } catch (e) {
      toast.error("Failed to load prescription history");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  useEffect(() => {
    if (customer) {
      loadOrdersData();
    }
  }, [customer]);

  const handleSignOut = async () => {
    try {
      await logoutCustomerAction();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (e) {
      toast.error("Sign out failed");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!filePreview) {
      return toast.error("Please upload a prescription file");
    }
    if (!durationDays || !durationDays.trim()) {
      return toast.error("Please enter the number of days you need medicine for");
    }

    setIsUploading(true);
    try {
      const result = await createPrescriptionOrder({
        customerId: customer.id,
        prescriptionFile: filePreview,
        durationDays: durationDays,
        notes: notes
      });

      if (result.success) {
        toast.success("Prescription uploaded successfully!");
        setShowUploadForm(false);
        setFile(null);
        setFilePreview(null);
        setDurationDays("");
        setNotes("");
        // Reload orders
        loadOrdersData();
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload prescription");
    } finally {
      setIsUploading(false);
    }
  };

  if (loadingCustomer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600 mb-2" />
        <span className="text-slate-500 font-bold text-sm">Loading your profile...</span>
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
                Prescription Upload Portal
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

      {/* MAIN GRID LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: NAVIGATION SIDEBAR */}
        <aside className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              Account Menu
            </div>
            
            <Link 
              href="/profile"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all border border-transparent"
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

            <Link 
              href="/profile/prescriptions"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-medical-blue-50 text-medical-blue-700 transition-all border border-medical-blue-100/50"
            >
              <FileText size={16} />
              <span>Prescription Orders</span>
            </Link>
          </div>
        </aside>

        {/* RIGHT COLUMN: PRESCRIPTION UPLOAD AND HISTORY */}
        <section className="lg:col-span-3 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-tight">Prescription Orders</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Upload prescriptions and let us process your order.</p>
                </div>
              </div>

              {!showUploadForm && (
                <button 
                  onClick={() => setShowUploadForm(true)}
                  className="px-4 py-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Upload size={16} />
                  <span>Upload Prescription</span>
                </button>
              )}
            </div>

            {/* UPLOAD FORM */}
            {showUploadForm && (
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-medical-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-slate-800 text-sm">New Prescription Request</h3>
                  <button 
                    onClick={() => setShowUploadForm(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitPrescription} className="space-y-4">
                  {/* File Upload Area */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2">Upload Prescription (Image or PDF)</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        filePreview ? 'border-medical-blue-400 bg-medical-blue-50/50' : 'border-slate-300 hover:border-medical-blue-400 bg-white hover:bg-medical-blue-50/20'
                      }`}
                    >
                      {filePreview ? (
                        <div className="flex flex-col items-center">
                          {file?.type.includes("pdf") ? (
                            <FileText size={32} className="text-medical-blue-500 mb-1" />
                          ) : (
                            <ImageIcon size={32} className="text-medical-blue-500 mb-1" />
                          )}
                          <span className="text-sm font-bold text-medical-blue-700 truncate max-w-[200px]">{file.name}</span>
                          <span className="text-[10px] font-semibold text-slate-500 mt-1">Click to change file</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-slate-500">
                          <Upload size={28} className="mb-2 text-slate-400" />
                          <span className="text-sm font-bold text-slate-600">Click to browse files</span>
                          <span className="text-[10px] font-medium mt-1">Max size: 5MB</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Duration Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-600">Duration Needed</label>
                      <input 
                        type="text" 
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        placeholder="e.g. 7 days, 1 month"
                        className="w-full h-12 px-4 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-blue-500 outline-none font-semibold text-slate-800 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-600">Additional Notes (Optional)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific instructions or preferences..."
                      className="w-full min-h-[80px] p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-medical-blue-500 outline-none font-semibold text-slate-800 transition-all resize-y"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUploading || !filePreview}
                      className="px-6 h-11 bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition-all text-sm"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      <span>Submit Prescription</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ORDER HISTORY LIST */}
            {loadingOrders ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600 mb-2" />
                <span className="text-slate-400 text-xs font-bold">Retrieving prescription history...</span>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Left Info */}
                      <div className="flex items-start gap-3">
                        <div 
                          onClick={() => setViewingFile(order.prescriptionFile)}
                          className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden group relative"
                        >
                          {order.prescriptionFile.includes("application/pdf") ? (
                            <FileText size={24} className="text-slate-400 group-hover:text-medical-blue-500 transition-colors" />
                          ) : (
                            <img src={order.prescriptionFile} alt="Prescription" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">View</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-slate-800 text-sm">Prescription Request</h3>
                          
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                            <Calendar size={12} />
                            <span>{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                            <Clock size={12} />
                            <span>Duration: <strong className="text-slate-700">{order.durationDays}</strong></span>
                          </div>

                          {order.notes && (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                              <span className="font-bold">Note:</span> {order.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex-shrink-0">
                        {order.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                            Reviewing
                          </span>
                        ) : order.status === "APPROVED" ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            <CheckCircle size={12} className="text-emerald-500" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                            <XCircle size={12} className="text-red-500" />
                            Rejected
                          </span>
                        )}
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-300 mb-3" />
                <h3 className="font-extrabold text-slate-700 text-sm">No prescriptions uploaded</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-[240px]">
                  Upload a prescription and we will handle the rest!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* VIEW FILE MODAL */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-medical-blue-600" />
                Prescription Document
              </h3>
              <button 
                onClick={() => setViewingFile(null)}
                className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-all shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[50vh]">
              {viewingFile.includes("application/pdf") ? (
                <iframe src={viewingFile} className="w-full h-[70vh] rounded-xl border border-slate-200" title="PDF Preview" />
              ) : (
                <img src={viewingFile} alt="Prescription" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-sm border border-slate-200 bg-white" />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
