import Link from "next/link";
import { Plus, ShieldCheck, Truck, Clock } from "lucide-react";

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel - Clean Real-World Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 border-r border-slate-800 items-center justify-center p-12">
        <div className="w-full max-w-md text-white space-y-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-medical-blue-600 flex items-center justify-center">
              <Plus className="text-white w-5 h-5 stroke-[2.75]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight leading-none">
                S&amp;S <span className="text-medical-blue-400">Pharmacy</span>
              </h1>
              <span className="text-xs text-slate-400 font-medium block mt-1">
                DGDA Registered Model Pharmacy (#2349-D)
              </span>
            </div>
          </Link>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-snug text-white tracking-tight">
              Reliable online pharmacy &amp; dispensary management.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Order authentic medicines online, upload prescriptions for
              pharmacist verification, and track home deliveries across Dhaka.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <div className="w-9 h-9 rounded-lg bg-medical-blue-500/15 border border-medical-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-medical-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  100% Authentic Medicines
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sourced directly from authorized pharmaceutical manufacturers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <div className="w-9 h-9 rounded-lg bg-medical-blue-500/15 border border-medical-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4 text-medical-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  45-Minute Express Dispatch
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Temperature-regulated delivery right to your doorstep.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/70 border border-slate-700/80">
              <div className="w-9 h-9 rounded-lg bg-medical-blue-500/15 border border-medical-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-medical-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  A-Grade Pharmacist Support
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every prescription is verified for dosage and safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Clean Auth Card */}
      <div className="w-full lg:w-7/12 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-slate-50">
        {/* Mobile Logo */}
        <Link
          href="/"
          className="lg:hidden flex items-center gap-2.5 mb-8 self-start sm:self-center"
        >
          <div className="w-9 h-9 rounded-lg bg-medical-blue-600 flex items-center justify-center">
            <Plus className="text-white w-5 h-5 stroke-[2.75]" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            S&amp;S <span className="text-medical-blue-600">Pharmacy</span>
          </span>
        </Link>

        {/* Auth Form Card */}
        <div className="w-full max-w-[460px] bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} S&amp;S Pharmacy. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
