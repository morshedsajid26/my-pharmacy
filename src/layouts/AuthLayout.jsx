import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PlusCircle } from "lucide-react";

export function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-medical-blue-600 flex items-center justify-center shadow-lg shadow-medical-blue-200 mb-4 animate-in zoom-in-50 duration-500">
            <PlusCircle className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">PHARMA<span className="text-medical-blue-600">PRO</span></h1>
          <p className="text-slate-500 text-sm mt-1">Smart Pharmacy Management System</p>
        </div>

        {/* Auth Card Content */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8 font-medium italic">
          &copy; {new Date().getFullYear()} PharmaPro Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
