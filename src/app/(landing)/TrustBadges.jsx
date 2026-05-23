'use client';

import { Award, Truck, Thermometer, PhoneCall } from "lucide-react";

export default function TrustBadges() {
  return (
    <section className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-lg shadow-slate-100/50 flex items-start gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-medical-blue-50 text-medical-blue-600 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">DGDA Licensed</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
              Certified Model Pharmacy operating strictly under DGDA regulatory guidelines.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-lg shadow-slate-100/50 flex items-start gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Express Delivery</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
              Rapid doorstep dispatch across Dhaka. Delivery is FREE for orders over ৳500.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-lg shadow-slate-100/50 flex items-start gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Thermometer size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Cold Chain Assured</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
              Vaccines, insulin, & drops stored in medical refrigerators (2°C - 8°C).
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100/80 shadow-lg shadow-slate-100/50 flex items-start gap-4 hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <PhoneCall size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Pharmacist Support</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
              Consult our qualified pharmacists for dosages, side effects, and queries.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
