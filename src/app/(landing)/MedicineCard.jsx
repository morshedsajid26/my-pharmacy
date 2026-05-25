'use client';

import { Pill, Package, Heart, Minus, Plus } from "lucide-react";

export default function MedicineCard({ 
  medicine, 
  cart, 
  wishlist, 
  wishlistLoading, 
  selectedQuantity, 
  onIncreaseQuantity, 
  onDecreaseQuantity, 
  onAddToCart, 
  onRequestRestock 
}) {
  const cartItem = cart.find(item => item.id === medicine.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = medicine.stock - qtyInCart;

  const isAvailable = medicine.stock >= 2;
  const isRequested = wishlist.includes(medicine.id);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-row sm:flex-col justify-between group h-full">
      {/* Medicine Graphic Placeholder */}
      <div className="w-[110px] sm:w-full shrink-0 min-h-[120px] sm:h-36 bg-white flex items-center justify-center relative group-hover:from-medical-blue-50/20 group-hover:to-medical-blue-100/10 transition-all duration-300 border-r sm:border-r-0 sm:border-b border-slate-100/50 overflow-hidden p-2 sm:p-0">
        {medicine.image && (
          <img 
            src={medicine.image} 
            alt={medicine.name} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 absolute inset-0"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.style.display = 'none';
              const fallbackEl = document.getElementById(`fallback-${medicine.id}`);
              if (fallbackEl) fallbackEl.style.display = 'flex';
            }}
          />
        )}
        
        <div 
          id={`fallback-${medicine.id}`}
          style={{ display: medicine.image ? 'none' : 'flex' }}
          className="w-14 h-14 rounded-2xl bg-white border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-medical-blue-500 group-hover:border-medical-blue-200/60 transition-all duration-300 z-10"
        >
          <Pill className="w-8 h-8 sm:w-7 sm:h-7" strokeWidth={1.5} />
        </div>
        
        {/* Low stock pill warning */}
        {medicine.stock <= 5 && medicine.stock >= 2 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider z-20">
            Low Stock: {medicine.stock}
          </span>
        )}
      </div>

      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Category & Status tag */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
            <span className="text-slate-400 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest truncate">
              {medicine.category}
            </span>
            {isAvailable ? (
              <span className="bg-emerald-50 text-emerald-600 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                In Stock
              </span>
            ) : (
              <span className="bg-red-50 text-red-600 text-[8px] sm:text-[9px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 whitespace-nowrap">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                Out of Stock
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight line-clamp-2 sm:truncate" title={medicine.name}>
            {medicine.name}
          </h3>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mt-0.5 truncate">{medicine.company}</p>
        </div>

        <div className="mt-2 sm:mt-4 flex flex-col sm:flex-col justify-end h-full">
          <div className="flex items-baseline gap-1 mb-2 sm:mb-0">
            <span className="text-base sm:text-xl font-black text-slate-900">৳{medicine.sellingPrice}</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">/ Unit</span>
          </div>

          {/* Card Actions Footer */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 pt-1 sm:pt-3 sm:border-t sm:border-slate-50 mt-auto">
            {isAvailable ? (
              <>
                {qtyInCart === 0 && (
                  <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner shrink-0">
                    <button
                      onClick={onDecreaseQuantity}
                      disabled={selectedQuantity <= 1}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md sm:rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-black text-sm cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" strokeWidth={3} />
                    </button>
                    <span className="w-6 sm:w-7 text-center text-[10px] sm:text-xs font-black text-slate-800">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={onIncreaseQuantity}
                      disabled={selectedQuantity >= remainingStock}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md sm:rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-black text-sm cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" strokeWidth={3} />
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={qtyInCart > 0 ? undefined : onAddToCart}
                  disabled={remainingStock < 1}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm text-center ${
                    remainingStock < 1 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                      : qtyInCart > 0
                        ? "bg-emerald-500 text-white shadow-md cursor-default"
                        : "bg-medical-blue-600 hover:bg-medical-blue-700 text-white hover:shadow-md hover:shadow-medical-blue-600/10 cursor-pointer"
                  }`}
                >
                  {qtyInCart > 0 ? `Added (${qtyInCart})` : "Add to Cart"}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-wider shrink-0">
                  Out of Stock
                </span>

                <button 
                  onClick={onRequestRestock}
                  disabled={wishlistLoading}
                  className={`px-2 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isRequested 
                      ? "bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-200" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 animate-pulse"
                  }`}
                >
                  <Heart className="w-3 h-3 sm:w-3 sm:h-3" />
                  <span>{isRequested ? "Requested" : "Request"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
