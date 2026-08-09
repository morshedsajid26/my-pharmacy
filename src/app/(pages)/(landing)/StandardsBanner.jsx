'use client';

import { Check } from "lucide-react";

export default function StandardsBanner() {
  return (
    <section className="bg-slate-900 py-16 sm:py-24 text-white rounded-3xl max-w-[95%] xl:max-w-[1600px] mx-auto px-6 sm:px-12 relative overflow-hidden">
      {/* Ambient blurred backdrop circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-medical-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20 inline-block">
            QUALITY ASSURED DISPENSARY
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
            Bangladesh Model Pharmacy <br className="hidden sm:inline" /> GPP Standards Compliant
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm lg:text-base leading-relaxed font-light">
            S&S Pharmacy adheres strictly to GPP (Good Pharmacy Practice) guidelines enforced by the Directorate General of Drug Administration (DGDA). We maintain precise medicine logistics to safeguard public health.
          </p>

          {/* Checklists */}
          <div className="space-y-4 pt-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-100">Certified A-Grade Online Consultation</h5>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  All prescriptions undergo direct supervision and checkups by licensed pharmacists before fulfillment.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-100">Active Thermoregulation Control</h5>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Preserved inside clean, air-conditioned shelving below 25°C to avoid molecular damage to chemical compounds.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={12} strokeWidth={3} />
              </div>
              <div>
                <h5 className="font-bold text-xs sm:text-sm text-slate-100">Tamper-Proof Hygenic Packing</h5>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Your order is enclosed inside clean, medical-grade, opaque envelopes, keeping medicines secure and private.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative mt-4 lg:mt-0">
          <div className="relative mx-auto max-w-[360px] lg:max-w-none">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-medical-blue-500 opacity-20 blur-md -z-10"></div>
            
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=800&auto=format&fit=crop" 
                alt="Pharmacists counseling patients in clinic model pharmacy" 
                className="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
            </div>

            {/* DGDA overlay badge */}
            <div className="absolute -right-4 bottom-6 z-20 bg-slate-900 border border-slate-800/80 p-3 rounded-xl shadow-xl">
              <span className="block text-xl font-black text-white leading-none">DGDA</span>
              <span className="text-[9px] font-bold text-slate-400 mt-1 block uppercase tracking-wider">License: #2349-D</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
