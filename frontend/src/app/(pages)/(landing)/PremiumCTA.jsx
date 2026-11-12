import { PhoneCall, FileCheck2, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PremiumCTA() {
  return (
    <section className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-white">
        <div className="px-6 py-8 sm:px-10 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Copy */}
          <div className="lg:col-span-8 space-y-3.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-medical-blue-300 text-xs font-medium">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Prescription Order Desk</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Need help reading a prescription? Order directly via WhatsApp.
            </h3>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Send a photo of your prescription on WhatsApp. Our pharmacist will
              confirm the medicines, send you the bill, and arrange express
              home delivery.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://api.whatsapp.com/send/?phone=01756899699&text=I%27m+interested+to+order+product"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-medical-blue-600 hover:bg-medical-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Order on WhatsApp (01756-899699)</span>
              </a>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                <span>Browse All Medicines</span>
              </Link>
            </div>
          </div>

          {/* Right Clinical Info Box */}
          <div className="lg:col-span-4">
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-lg p-5 space-y-3.5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-medical-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Pharmacist Verified
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    Every prescription is checked for accurate dosage strength
                    and expiry before billing.
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-700/80 pt-3.5 flex items-start gap-3">
                <Clock className="w-5 h-5 text-medical-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Support Hours
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    9:00 AM – 10:00 PM Daily (24/7 Online Order)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
