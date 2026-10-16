import { PhoneCall, HeartPulse } from "lucide-react";
import Link from "next/link";

export default function PremiumCTA() {
  return (
    <section className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="relative w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-medical-blue-900/80 to-slate-900/90" />
        <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-medical-blue-500/30 to-transparent rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-tl from-emerald-500/20 to-transparent rounded-full blur-3xl mix-blend-screen" />
        
        {/* Content */}
        <div className="relative z-10 px-8 py-16 md:px-20 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                Seamless Healthcare
              </span>
            </div>
            
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
              Order your medicines <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                in just one click.
              </span>
            </h3>
            
            <p className="text-lg text-slate-300 font-medium max-w-xl leading-relaxed mb-8">
              Send us your prescription via WhatsApp, and our expert pharmacists will take care of the rest. Fast, secure, and hassle-free.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <a 
                href="https://api.whatsapp.com/send/?phone=01756899699&text=I%27m+interested+to+order+product" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-emerald-500/25 hover:scale-105"
              >
                <PhoneCall className="w-5 h-5" /> Order on WhatsApp
              </a>
              <Link 
                href="/shop"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all backdrop-blur-md"
              >
                Browse Catalog
              </Link>
            </div>
          </div>
          
          {/* Decorative Graphic Area */}
          <div className="hidden md:flex flex-1 justify-end relative">
             <div className="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-tr from-medical-blue-500 to-emerald-400 rounded-full blur-[80px] opacity-40 absolute right-10 top-1/2 -translate-y-1/2" />
             <div className="w-64 h-64 lg:w-80 lg:h-80 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl rotate-12 relative z-10 flex items-center justify-center">
               <div className="w-48 h-48 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] shadow-inner flex items-center justify-center -rotate-12">
                 <HeartPulse className="w-24 h-24 text-white drop-shadow-md" />
               </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
