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
  onRequestRestock 
}) {
  if (!medicines || medicines.length === 0) return null;

  return (
    <section className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4">
        <div>
          {subtitle && (
            <span className="text-emerald-500 font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 block">
              {subtitle}
            </span>
          )}
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            {title || "Featured Products"}
          </h3>
        </div>
        <Link 
          href="/shop" 
          className="group inline-flex items-center gap-2 text-sm sm:text-base font-bold text-slate-600 hover:text-medical-blue-600 transition-colors"
        >
          Explore All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 pb-8">
          {medicines.map((med) => (
            <div key={med.id} className="w-full transition-transform duration-300 hover:-translate-y-2">
              <MedicineCard 
                medicine={med}
                cart={cart}
                wishlist={wishlist}
                wishlistLoading={wishlistLoading}
                selectedQuantity={selectedQuantities[med.id] || 1}
                onIncreaseQuantity={() => onIncreaseQuantity(med.id, med.stock)}
                onDecreaseQuantity={() => onDecreaseQuantity(med.id)}
                onAddToCart={() => onAddToCart(med, selectedQuantities[med.id] || 1)}
                onRequestRestock={() => onRequestRestock(med.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
