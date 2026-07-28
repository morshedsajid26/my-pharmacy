'use client';

import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function PremiumHero({ customer, onAuthClick }) {
  return (
    <section className="relative w-full min-h-[500px] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-50 pb-24 md:pb-50 pt-20">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[70%] bg-gradient-to-tl from-emerald-400/20 to-teal-400/20 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col items-center text-center">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-medical-blue-600" />
          <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest">
            Welcome to the Future of Healthcare
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-5xl">
          Your Health, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue-600 to-emerald-500">
            Delivered Beautifully.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-2xl font-medium text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Experience premium pharmacy services right at your fingertips. 100% genuine medicines, superfast delivery, and unparalleled customer care.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/shop" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-slate-900/20 hover:scale-105"
          >
            Shop Medicines <ArrowRight className="w-5 h-5" />
          </Link>
          
          {customer ? (
            <Link 
              href="/profile/prescriptions" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Upload Prescription
            </Link>
          ) : (
            <button 
              onClick={onAuthClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> Upload Prescription
            </button>
          )}
        </div>

      </div>

      {/* Decorative Floating Elements (Visible on larger screens) */}
      <div className="hidden lg:block absolute left-10 top-1/4 w-24 h-24 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl rotate-12 animate-float" style={{ animationDuration: '6s' }} />
      <div className="hidden lg:block absolute right-20 bottom-1/4 w-32 h-32 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] shadow-2xl -rotate-12 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }} />
    </section>
  );
}
