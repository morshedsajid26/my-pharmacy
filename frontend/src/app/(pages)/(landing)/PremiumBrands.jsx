export default function PremiumBrands({ medicines = [] }) {
  const companies = [...new Set(medicines.map((m) => m.company))].filter(
    Boolean
  );

  if (companies.length === 0) return null;

  return (
    <section className="border-y border-slate-200/80 bg-white py-10 overflow-hidden my-6">
      <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Authorized Pharmaceutical Supply Partners
        </p>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          100% Direct Depot Sourced
        </span>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-marquee whitespace-nowrap space-x-8 md:space-x-14 px-4 md:px-8 group-hover:[animation-play-state:paused]">
          {[...companies, ...companies, ...companies].map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center shrink-0 px-4 py-2 rounded-lg border border-slate-100 bg-slate-50/60 text-slate-600 hover:text-medical-blue-700 hover:border-medical-blue-200 transition-colors"
            >
              <span className="text-sm md:text-base font-bold tracking-tight">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
