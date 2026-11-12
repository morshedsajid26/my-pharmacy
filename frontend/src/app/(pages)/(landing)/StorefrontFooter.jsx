"use client";

import { Plus, Phone, ShieldCheck, MapPin } from "lucide-react";

export default function StorefrontFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 mt-16 border-t border-slate-800">
      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
        {/* Col 1: Brand & License */}
        <div className="md:col-span-4 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-medical-blue-600 flex items-center justify-center text-white">
              <Plus className="w-4 h-4 stroke-[2.75]" />
            </div>
            <h4 className="text-lg font-bold text-white tracking-tight">
              S&amp;S <span className="text-medical-blue-400">Pharmacy</span>
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Dhaka&apos;s licensed online Model Pharmacy. Delivering genuine,
            temperature-controlled medicines directly to your home.
          </p>
          <div className="inline-flex items-center gap-2.5 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-medical-blue-400 shrink-0" />
            <div>
              <span className="font-semibold block text-white leading-none">
                DGDA Model Pharmacy
              </span>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                License No: 2349-D / Dhaka-North
              </span>
            </div>
          </div>
        </div>

        {/* Col 2: Dispensary Hours */}
        <div className="md:col-span-3">
          <h5 className="font-semibold text-xs uppercase text-white tracking-wider mb-3.5">
            Service &amp; Coverage
          </h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>Store &amp; Online: 24/7 Service</li>
            <li>Pharmacist Desk: 9:00 AM – 10:00 PM</li>
            <li className="flex items-start gap-1.5 pt-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-medical-blue-400 shrink-0 mt-0.5" />
              <span>
                Gulshan, Banani, Dhanmondi, Uttara, Mirpur &amp; Major Dhaka
                Zones
              </span>
            </li>
          </ul>
        </div>

        {/* Col 3: Clinical Standards */}
        <div className="md:col-span-2">
          <h5 className="font-semibold text-xs uppercase text-white tracking-wider mb-3.5">
            Quality Assurance
          </h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>&lt;25°C Cold-Chain Storage</li>
            <li>Original Sealed Packaging</li>
            <li>A-Grade Pharmacist Review</li>
            <li>Direct Manufacturer Supply</li>
          </ul>
        </div>

        {/* Col 4: Helpline */}
        <div className="md:col-span-3 space-y-3">
          <h5 className="font-semibold text-xs uppercase text-white tracking-wider mb-3.5">
            Customer Support
          </h5>
          <p className="text-xs text-slate-400">
            Need help or want to place an order by phone?
          </p>
          <a
            href="tel:+8801756899699"
            className="flex items-center gap-2.5 text-white font-mono font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 p-2.5 rounded-lg border border-slate-700 transition-colors"
          >
            <Phone size={15} className="text-medical-blue-400 shrink-0" />
            <span>+880 1756-899699</span>
          </a>
          <p className="text-[11px] text-slate-500">
            Email: care@snspharmacy.com
          </p>
        </div>
      </div>

      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} S&amp;S Pharmacy. All rights reserved.
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>We Accept:</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
            Cash on Delivery
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
            bKash
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
            Nagad
          </span>
        </div>
      </div>
    </footer>
  );
}
