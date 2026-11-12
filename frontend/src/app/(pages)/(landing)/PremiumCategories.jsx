import Link from "next/link";
import {
  Pill,
  Activity,
  Syringe,
  Heart,
  Scissors,
  Thermometer,
  Baby,
  Smile,
  ArrowUpRight,
} from "lucide-react";

export default function PremiumCategories({ categories = [], categoryDetails }) {
  const getIconForCategory = (cat) => {
    if (categoryDetails && categoryDetails[cat]) return categoryDetails[cat].icon;
    const lower = cat.toLowerCase();
    if (
      lower.includes("tablet") ||
      lower.includes("capsule") ||
      lower.includes("medicine")
    )
      return Pill;
    if (lower.includes("baby") || lower.includes("mom")) return Baby;
    if (lower.includes("personal") || lower.includes("beauty")) return Smile;
    if (lower.includes("device") || lower.includes("equipment"))
      return Thermometer;
    if (lower.includes("injection")) return Syringe;
    if (lower.includes("care") || lower.includes("health")) return Heart;
    if (lower.includes("surgical")) return Scissors;
    return Activity;
  };

  const displayCategories = categories.filter((c) => c !== "All");

  if (displayCategories.length === 0) return null;

  return (
    <section className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <span className="text-medical-blue-600 font-semibold tracking-wider uppercase text-xs block mb-1">
            Dispensary Departments
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Browse by Dosage &amp; Category
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-xs sm:text-sm font-semibold text-medical-blue-600 hover:text-medical-blue-800 transition-colors inline-flex items-center gap-1"
        >
          <span>View Full Directory</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {displayCategories.map((cat) => {
          const IconComp = getIconForCategory(cat);

          return (
            <Link
              key={cat}
              href={`/shop`}
              className="group relative flex flex-col justify-between p-5 rounded-xl bg-white border border-slate-200/80 transition-all duration-200 hover:border-medical-blue-600/50 hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-medical-blue-50 border border-medical-blue-100/80 flex items-center justify-center text-medical-blue-600 group-hover:bg-medical-blue-600 group-hover:text-white transition-colors">
                  <IconComp className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-medical-blue-600 transition-colors" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-medical-blue-700 transition-colors truncate">
                  {cat}
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Explore items
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
