"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Thermometer,
  Clock,
  CheckCircle2,
  Building2,
} from "lucide-react";

export default function PremiumHero({ customer, onAuthClick }) {
  return (
    <section className="relative w-full bg-white border-b border-slate-200 overflow-hidden">
      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Clean Real-World Pharmacy Value Proposition */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-medical-blue-600" />
              <span className="text-xs font-semibold text-slate-700">
                DGDA Registered Model Pharmacy • Dhaka
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
              Order genuine medicines &amp; healthcare products{" "}
              <span className="text-medical-blue-600">from home.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Sourced directly from leading pharmaceutical companies in
              Bangladesh. Every order is checked by a licensed pharmacist and
              delivered across Dhaka within 45–60 minutes.
            </p>

            {/* Primary & Secondary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                <span>Browse All Medicines</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {customer ? (
                <Link
                  href="/prescriptions"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-medical-blue-600" />
                  <span>Upload Prescription</span>
                </Link>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-medical-blue-600" />
                  <span>Upload Prescription</span>
                </button>
              )}
            </div>

            {/* Key Metrics Strip */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
                  100%
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authentic Medicines
                </p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
                  &lt; 25°C
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Temperature Controlled
                </p>
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
                  45–60m
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Home Delivery
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Structured Pharmacy Service Panel */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              {/* Card Header */}
              <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-medical-blue-600" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-none">
                      How Your Order Is Fulfilled
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1">
                      DGDA Good Pharmacy Practice (GPP)
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-200 px-2 py-0.5 rounded">
                  Verified
                </span>
              </div>

              {/* Steps */}
              <div className="p-5 space-y-4 divide-y divide-slate-200/70">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-medical-blue-600 shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                      1. Direct Pharmaceutical Supply
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Stocked directly from Square, Incepta, Beximco, Renata,
                      and authorized distributors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-medical-blue-600 shrink-0 mt-0.5">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                      2. Cold-Chain &amp; Hygiene Storage
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Insulins, vaccines, and temperature-sensitive items stored
                      in calibrated medical refrigerators.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-medical-blue-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                      3. Pharmacist Check &amp; Dispatch
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      Batch numbers and expiry dates are verified before sealing
                      your package for delivery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-medical-blue-600" />
                  Free delivery on orders ৳500+
                </span>
                <Link
                  href="/shop"
                  className="font-semibold text-medical-blue-600 hover:text-medical-blue-700 transition-colors"
                >
                  Start Ordering →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
