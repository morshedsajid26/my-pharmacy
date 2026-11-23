import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MedicineCard from "./MedicineCard";

export default function PremiumProductRow({
  title,
  subtitle,
  medicines,
  cart,
  wishlist,
  wishlistLoading,
  selectedQuantities,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onAddToCart,
  onRequestRestock,
  onViewProduct,
}) {
  if (!medicines || medicines.length === 0) return null;

  return (
    <section className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-slate-200/80 pb-4">
        <div>
          {subtitle && (
            <span className="text-medical-blue-600 font-semibold tracking-wider uppercase text-xs block mb-1">
              {subtitle}
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {title || "Featured Medicines"}
          </h2>
        </div>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-medical-blue-600 hover:text-medical-blue-800 transition-colors"
        >
          <span>View All Medicines</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {medicines.map((med) => (
          <div key={med.id} className="w-full">
            <MedicineCard
              medicine={med}
              cart={cart}
              wishlist={wishlist}
              wishlistLoading={wishlistLoading}
              selectedQuantity={selectedQuantities[med.id] || 1}
              onIncreaseQuantity={() => onIncreaseQuantity(med.id, med.stock)}
              onDecreaseQuantity={() => onDecreaseQuantity(med.id)}
              onAddToCart={() =>
                onAddToCart(med, selectedQuantities[med.id] || 1)
              }
              onRequestRestock={() => onRequestRestock(med.id)}
              onViewProduct={onViewProduct}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
