"use client";

import { ShieldCheck, Truck, Clock, Award } from "lucide-react";

export default function PremiumFeatures() {
  const features = [
    {
      id: 1,
      title: "100% Authentic Sourcing",
      desc: "Procured directly from authorized pharmaceutical manufacturers.",
      icon: ShieldCheck,
    },
    {
      id: 2,
      title: "45-Min Express Dispatch",
      desc: "Sealed medical-grade delivery across all major Dhaka zones.",
      icon: Truck,
    },
    {
      id: 3,
      title: "A-Grade Pharmacist Desk",
      desc: "Every prescription is verified for dosage and interaction safety.",
      icon: Award,
    },
    {
      id: 4,
      title: "24/7 Clinical Support",
      desc: "Dedicated helpline for urgent medication and refill inquiries.",
      icon: Clock,
    },
  ];

  return (
    <section className="bg-white border-b border-slate-200/80">
      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-200/70">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className={`flex items-start gap-4 ${
                  index > 0 ? "pt-5 sm:pt-0 lg:pl-8" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-medical-blue-50 border border-medical-blue-100 text-medical-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">
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
