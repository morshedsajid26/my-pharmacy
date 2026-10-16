import Link from "next/link";

export default function PremiumBrands({ medicines }) {
  const companies = [...new Set(medicines.map(m => m.company))].filter(Boolean);

  if (companies.length === 0) return null;

  return (
    <section className="border-y border-slate-200/60 bg-white py-12 md:py-16 overflow-hidden">
      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
          Trusted by top pharmaceutical brands
        </p>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-marquee whitespace-nowrap space-x-8 md:space-x-16 px-4 md:px-8 group-hover:[animation-play-state:paused]">
          {/* We duplicate the list to create an infinite scroll effect using CSS (if animate-marquee is defined) */}
          {[...companies, ...companies, ...companies].map((company, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center shrink-0 min-w-[120px] md:min-w-[160px] opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 cursor-pointer"
            >
              <span className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
