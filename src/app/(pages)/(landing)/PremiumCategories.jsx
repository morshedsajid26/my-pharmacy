import Link from "next/link";
import { Pill, Activity, Syringe, Heart, Scissors, Thermometer, Baby, Smile, ArrowUpRight } from "lucide-react";

export default function PremiumCategories({ categories, categoryDetails }) {
  const getIconForCategory = (cat) => {
    if (categoryDetails && categoryDetails[cat]) return categoryDetails[cat].icon;
    const lower = cat.toLowerCase();
    if (lower.includes("tablet") || lower.includes("capsule") || lower.includes("medicine")) return Pill;
    if (lower.includes("baby") || lower.includes("mom")) return Baby;
    if (lower.includes("personal") || lower.includes("beauty")) return Smile;
    if (lower.includes("device") || lower.includes("equipment")) return Thermometer;
    if (lower.includes("injection")) return Syringe;
    if (lower.includes("care") || lower.includes("health")) return Heart;
    if (lower.includes("surgical")) return Scissors;
    return Activity;
  };

  const getGradientForCategory = (index) => {
    const gradients = [
      "from-blue-500/10 to-blue-500/5 hover:border-blue-200",
      "from-emerald-500/10 to-emerald-500/5 hover:border-emerald-200",
      "from-purple-500/10 to-purple-500/5 hover:border-purple-200",
      "from-amber-500/10 to-amber-500/5 hover:border-amber-200",
      "from-rose-500/10 to-rose-500/5 hover:border-rose-200",
      "from-teal-500/10 to-teal-500/5 hover:border-teal-200",
    ];
    return gradients[index % gradients.length];
  };

  const getIconColor = (index) => {
    const colors = [
      "text-blue-500", "text-emerald-500", "text-purple-500", "text-amber-500", "text-rose-500", "text-teal-500"
    ];
    return colors[index % colors.length];
  };

  const displayCategories = categories.filter(c => c !== "All");

  return (
    <section className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex items-end justify-between mb-10 md:mb-16">
        <div>
          <span className="text-medical-blue-600 font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 block">Departments</span>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Shop by Category
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {displayCategories.map((cat, index) => {
          const IconComp = getIconForCategory(cat);
          const gradientClass = getGradientForCategory(index);
          const iconColor = getIconColor(index);

          return (
            <Link 
              key={cat} 
              href={`/shop`}
              className={`group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-[2rem] bg-gradient-to-br ${gradientClass} border border-transparent transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 overflow-hidden`}
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <ArrowUpRight className="w-5 h-5 text-slate-400" />
              </div>
              
              <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm mb-4 transition-transform duration-300 group-hover:scale-110 ${iconColor}`}>
                <IconComp className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={1.5} />
              </div>
              <span className="text-sm sm:text-base font-extrabold text-slate-800 text-center tracking-wide group-hover:text-medical-blue-600 transition-colors">
                {cat}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
