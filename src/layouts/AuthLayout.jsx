import { PlusCircle, ShieldCheck, Truck } from "lucide-react";

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Premium Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-900 via-slate-900 to-medical-blue-950 opacity-95 z-0" />
        
        {/* Decorative ambient blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-medical-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-lg px-12 text-white">
          <div className="flex items-center gap-3 mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-medical-blue-400 to-medical-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)] border border-white/10">
              <PlusCircle className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              S&S<span className="text-medical-blue-400">Pharmacy</span>
            </h1>
          </div>

          <h2 className="text-5xl font-bold leading-[1.15] mb-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
            Your Health,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue-400 to-emerald-400">
              Our Priority.
            </span>
          </h2>
          
          <p className="text-slate-300 text-lg mb-12 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-700 delay-300 max-w-md">
            The smartest way to manage your pharmacy needs. Order medicines online, track prescriptions, and consult with experts effortlessly.
          </p>

          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-medical-blue-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-medical-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">100% Genuine Medicines</h3>
                <p className="text-sm text-slate-400">Sourced directly from verified manufacturers.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.06] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Express Delivery</h3>
                <p className="text-sm text-slate-400">Get your orders safely delivered at your doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative bg-slate-50/80 lg:rounded-l-[2.5rem] shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)] z-20 overflow-hidden">
        {/* Right Panel Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-medical-blue-100/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none transform translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none transform -translate-x-1/3 translate-y-1/4" />

        {/* Mobile Logo (Visible only on small screens) */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2 animate-in fade-in duration-500 z-10">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-blue-500 to-medical-blue-600 flex items-center justify-center shadow-lg shadow-medical-blue-200">
             <PlusCircle className="text-white w-6 h-6" />
           </div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight">
             S&S<span className="text-medical-blue-600">Pharmacy</span>
           </h1>
        </div>

        {/* The Auth Content Wrapper */}
        <div className="relative z-10 w-full max-w-[580px] bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-700 mt-16 lg:mt-0 ring-1 ring-slate-900/5">
          {children}
        </div>
        
        {/* Footer */}
        <p className="absolute bottom-8 text-center text-slate-400 text-xs font-medium lg:right-12 z-10">
          &copy; {new Date().getFullYear()} S&S Pharmacy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
