'use client';

import { ShieldCheck, Truck, Clock } from "lucide-react";

export default function PremiumFeatures() {
  const features = [
    {
      id: 1,
      title: "100% Genuine",
      desc: "Authentic medicines sourced directly from manufacturers.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-50/50"
    },
    {
      id: 2,
      title: "Superfast Delivery",
      desc: "Get your medicines delivered right to your doorstep.",
      icon: Truck,
      color: "text-medical-blue-500",
      bg: "bg-medical-blue-50/50"
    },
    {
      id: 3,
      title: "24/7 Support",
      desc: "Our pharmacists are available around the clock.",
      icon: Clock,
      color: "text-purple-500",
      bg: "bg-purple-50/50"
    }
  ];

  return (
    <section className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-20">
      <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="flex items-start gap-5 group">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-800 mb-1">{feature.title}</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
