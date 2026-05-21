'use client';

import { PlusCircle, Phone } from "lucide-react";

export default function StorefrontFooter() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 mt-24 border-t border-slate-900">
      <div className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-900">
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-medical-blue-600 flex items-center justify-center shadow-lg shadow-medical-blue-600/10">
              <PlusCircle className="text-white w-5 h-5" />
            </div>
            <h4 className="text-lg font-black text-white tracking-tight">S&S<span className="text-medical-blue-500">Pharmacy</span></h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-light">
            Dhaka's leading licensed online Model Pharmacy. Your trusted healthcare partner delivering pure wellness directly to your home.
          </p>
          <div className="bg-slate-900 border border-slate-900 rounded-xl p-3 text-[10px] text-slate-400">
            <span className="font-bold block text-slate-300">DGDA Model Pharmacy ID</span>
            <span>License No: 2349-D / Dhaka-North</span>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-xs uppercase text-slate-200 tracking-wider mb-4">Operations</h5>
          <ul className="space-y-2 text-xs">
            <li>Open Daily: 24/7 Service</li>
            <li>Consultation: 9:00 AM - 10:00 PM</li>
            <li>Delivery Zones: Gulshan, Banani, Dhanmondi, Uttara, Mirpur, and major Dhaka neighborhoods</li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-xs uppercase text-slate-200 tracking-wider mb-4">Quality Assured</h5>
          <ul className="space-y-2 text-xs">
            <li>Strict temperature controls</li>
            <li>Sealed original packaging</li>
            <li>Prescription double-check</li>
            <li>Direct pharmaceutical supply</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h5 className="font-bold text-xs uppercase text-slate-200 tracking-wider mb-4">Customer Support</h5>
          <p className="text-xs text-slate-400">Need help or want to order via call?</p>
          <div className="flex items-center gap-2 text-white font-extrabold text-xs sm:text-sm bg-slate-900 p-3 rounded-xl border border-slate-900">
            <Phone size={16} className="text-emerald-400 shrink-0" />
            <span>+880 </span>
          </div>
          <p className="text-[10px] text-slate-500">Support Email: care@snspharmacy.com</p>
        </div>

      </div>

      <div className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-slate-600">
          © {new Date().getFullYear()} S&S Pharmacy. All rights reserved. Sourced & Delivered with strict GPP compliance.
        </p>
        
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <span>We Accept: Cash-On-Delivery</span>
          <span className="h-4 w-[1px] bg-slate-800"></span>
          <span className="font-extrabold text-slate-400">bKash</span>
          <span className="h-4 w-[1px] bg-slate-800"></span>
          <span className="font-extrabold text-slate-400">Nagad</span>
        </div>
      </div>
    </footer>
  );
}
