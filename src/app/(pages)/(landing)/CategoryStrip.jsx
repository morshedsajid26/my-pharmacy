'use client';

import { ChevronRight, Package, Pill, Activity, Sparkles, Star } from "lucide-react";

export default function CategoryStrip({ 
  categories, 
  selectedCategory, 
  onSelectCategory, 
  medicines, 
  categoryDetails 
}) {
  return (
    <section className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Browse by Category</h3>
          <p className="text-xs text-slate-400 mt-1">Select a category below to filter our live shelf medicines</p>
        </div>
        {selectedCategory !== "All" && (
          <button 
            onClick={() => onSelectCategory("All")}
            className="text-xs font-bold text-medical-blue-600 hover:text-medical-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Categories</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const details = categoryDetails[cat] || { label: cat, icon: Pill, gradient: "from-slate-650 to-slate-700", bgLight: "bg-slate-100 text-slate-600" };
          const IconComp = details.icon;
          const isActive = selectedCategory === cat;
          const count = cat === "All" 
            ? medicines.length 
            : medicines.filter(m => m.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`p-4.5 rounded-2xl border text-left transition-all duration-350 flex flex-col justify-between h-28 group relative overflow-hidden cursor-pointer ${
                isActive 
                  ? "border-transparent text-white shadow-lg shadow-slate-200/50 scale-[1.03]" 
                  : "bg-white border-slate-100 hover:border-slate-350 text-slate-800 hover:shadow-md"
              }`}
            >
              {/* Active Background Gradient */}
              {isActive && (
                <div className={`absolute inset-0 bg-gradient-to-br ${details.gradient} -z-10`}></div>
              )}
              
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 ${
                isActive ? "bg-white/20 text-white" : details.bgLight
              }`}>
                <IconComp size={20} />
              </div>
              
              <div>
                <span className={`block text-xs font-black leading-none ${isActive ? "text-white" : "text-slate-900"}`}>
                  {details.label}
                </span>
                <span className={`text-[10px] mt-1.5 block font-bold ${isActive ? "text-white/80" : "text-slate-400"}`}>
                  {count} Medicines
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
