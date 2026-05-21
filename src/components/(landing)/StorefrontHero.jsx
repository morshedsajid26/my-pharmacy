'use client';

import { ShieldCheck, User } from "lucide-react";

export default function StorefrontHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-tr from-slate-950 via-blue-950 to-slate-900 text-white py-16 sm:py-24 px-4">
      {/* Glow ambient spots */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-medical-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[95%] xl:max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Hero Content */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-emerald-400 tracking-wide">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>⚡ OFFICIAL MODEL PHARMACY (DHAKA)</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Genuine Medicines, <br />
            <span className="bg-gradient-to-r from-medical-blue-400 via-blue-300 to-emerald-400 bg-clip-text text-transparent">
              Delivered with Absolute Care
            </span>
          </h2>
          
          <p className="text-slate-300 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed font-light">
            Experience Bangladesh's certified model pharmacy. Sourced directly from top manufacturers, preserved with strict climate controls, and delivered express directly to your home.
          </p>

          {/* Quick Metrics */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-6">
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-white">100%</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mt-1">Authentic Drugs</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-white">45 Min</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mt-1">Express Delivery</span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-white">24/7</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mt-1">Support Available</span>
            </div>
          </div>
        </div>

        {/* Hero Premium Image Frame */}
        <div className="lg:col-span-5 relative mt-4 lg:mt-0">
          <div className="relative mx-auto max-w-[420px] lg:max-w-none">
            {/* Decorative glows */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-medical-blue-500 to-emerald-500 opacity-20 blur-lg -z-10"></div>
            
            {/* Main Stock Image */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              <img 
                src="https://images.unsplash.com/photo-1631549916768-4a1529329785?q=80&w=800&auto=format&fit=crop" 
                alt="Modern Premium Model Pharmacy Store" 
                className="w-full h-[320px] sm:h-[400px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
            </div>

            {/* Floating Badges */}
            <div className="absolute -left-6 bottom-8 z-20 bg-slate-900/90 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 shadow-xl max-w-[190px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">Cold-Chain</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Insulin kept at 2-8°C</span>
              </div>
            </div>

            <div className="absolute -right-4 -top-4 z-20 bg-slate-900/90 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 shadow-xl max-w-[190px]">
              <div className="w-10 h-10 rounded-xl bg-medical-blue-500/20 text-medical-blue-400 flex items-center justify-center shrink-0">
                <User size={20} />
              </div>
              <div>
                <span className="block text-xs font-bold text-white">Pharmacist Duty</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">DGDA Licensed Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
