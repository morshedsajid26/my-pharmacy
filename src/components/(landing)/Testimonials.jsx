'use client';

import { Star } from "lucide-react";

export default function Testimonials() {
  return (
    <section className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-bold text-medical-blue-600 uppercase tracking-widest bg-medical-blue-50 px-3 py-1 rounded-full border border-medical-blue-100">
          CUSTOMER STORIES
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 font-display">
          What Dhaka Residents Say About Us
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
          Genuine reviews from verified shoppers ordering home delivery medicines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
          </div>
          <p className="text-xs text-slate-600 italic leading-relaxed">
            "Extremely pleased with their service. I ordered insulin, and it was delivered within 40 minutes in a proper temperature-regulated cooler pack. Absolute lifesavers!"
          </p>
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100/50">
            <div className="w-8 h-8 rounded-full bg-medical-blue-100 text-medical-blue-700 flex items-center justify-center font-bold text-xs">
              RA
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-950">Rashedul Alam</h5>
              <span className="text-[10px] text-slate-400">Gulshan-2, Dhaka</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
          </div>
          <p className="text-xs text-slate-600 italic leading-relaxed">
            "Finding genuine pediatric medicines online can be stressful. S&S is the only online pharmacy where I get original products with clear expiration dates."
          </p>
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100/50">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              NT
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-950">Nusrat Jahan Tania</h5>
              <span className="text-[10px] text-slate-400">Dhanmondi, Dhaka</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => <Star key={i} size={13} className="fill-current" />)}
          </div>
          <p className="text-xs text-slate-600 italic leading-relaxed">
            "The customer portal makes ordering regular medicines so quick. OTP register took seconds, and they kept my delivery address saved. Highly recommended!"
          </p>
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100/50">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              MH
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-950">Mehedi Hasan</h5>
              <span className="text-[10px] text-slate-400">Uttara, Dhaka</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
