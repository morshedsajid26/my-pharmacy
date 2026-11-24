"use client";

import { Pill, Heart, Minus, Plus, Check, Eye } from "lucide-react";

export default function MedicineCard({
  medicine,
  cart = [],
  wishlist = [],
  wishlistLoading,
  selectedQuantity = 1,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onAddToCart,
  onRequestRestock,
  onViewProduct,
}) {
  const cartItem = cart?.find((item) => item?.id === medicine?.id);
  const qtyInCart = cartItem ? cartItem.quantity || 0 : 0;
  const remainingStock = Math.max(0, (medicine?.stock || 0) - qtyInCart);

  const isAvailable = (medicine?.stock || 0) > 0;
  const isRequested = wishlist?.includes(medicine?.id);

  const discountPercent = Number(medicine?.onlineDiscountPercent) || 0;
  const onlinePrice = discountPercent > 0 
    ? (Number(medicine?.sellingPrice) || 0) * (1 - discountPercent / 100) 
    : (Number(medicine?.sellingPrice) || 0);

  const handleCardClick = () => {
    if (onViewProduct) {
      onViewProduct(medicine);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-slate-200/85 hover:border-medical-blue-600/50 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-row sm:flex-col justify-between group h-full cursor-pointer select-none"
    >
      {/* Medicine Image / Clinical Stage */}
      <div className="w-[110px] sm:w-full shrink-0 min-h-[120px] sm:h-36 bg-slate-50/70 flex items-center justify-center relative border-r sm:border-r-0 sm:border-b border-slate-100 overflow-hidden p-3">
        {medicine?.image && (
          <img
            src={medicine.image}
            alt={medicine.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 absolute inset-0 p-2"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              const fallbackEl = document.getElementById(
                `fallback-${medicine.id}`
              );
              if (fallbackEl) fallbackEl.style.display = "flex";
            }}
          />
        )}

        <div
          id={`fallback-${medicine?.id}`}
          style={{ display: medicine?.image ? "none" : "flex" }}
          className="w-12 h-12 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 group-hover:text-medical-blue-600 group-hover:border-medical-blue-200 transition-colors z-10"
        >
          <Pill className="w-6 h-6" strokeWidth={1.75} />
        </div>

        {/* View Details Quick Hover Overlay */}
        <div className="hidden sm:flex absolute inset-0 bg-slate-900/25 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none z-20 backdrop-blur-[1px]">
          <span className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 text-[11px] font-bold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-medical-blue-600" />
            View Product
          </span>
        </div>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-2xs z-20">
            -{discountPercent}%
          </span>
        )}

        {/* Low stock indicator */}
        {medicine?.stock <= 5 && medicine?.stock >= 1 && (
          <span className="absolute top-2.5 left-2.5 bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-md z-20">
            Low Stock
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Category & Stock Status */}
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded truncate">
              {medicine?.category}
            </span>
            {isAvailable ? (
              <span className="text-medical-blue-700 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-medical-blue-600 rounded-full" />
                In Stock
              </span>
            ) : (
              <span className="text-rose-600 text-[10px] font-semibold flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                Out of Stock
              </span>
            )}
          </div>

          <h3
            className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug line-clamp-2 sm:truncate mt-1 group-hover:text-medical-blue-600 transition-colors"
            title={medicine?.name}
          >
            {medicine?.name}
          </h3>

          {medicine?.genericName && (
            <p
              className="text-[11px] font-medium text-teal-700 truncate mt-0.5"
              title={`Generic: ${medicine.genericName}`}
            >
              {medicine.genericName}
            </p>
          )}

          <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
            {medicine?.company}
          </p>
        </div>

        <div className="mt-3 sm:mt-4 flex flex-col justify-end">
          <div className="flex items-baseline gap-1.5 mb-2.5 flex-wrap">
            {discountPercent > 0 ? (
              <>
                <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                  ৳{onlinePrice.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 line-through font-mono">
                  ৳{Number(medicine?.sellingPrice || 0).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-base sm:text-lg font-bold text-slate-900 font-mono">
                ৳{Number(medicine?.sellingPrice || 0).toFixed(2)}
              </span>
            )}
            <span className="text-[11px] font-medium text-slate-400">
              / unit
            </span>
          </div>

          {/* Card Actions Footer */}
          <div
            className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {isAvailable ? (
              <>
                {qtyInCart === 0 && (
                  <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-lg p-0.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDecreaseQuantity && onDecreaseQuantity();
                      }}
                      disabled={selectedQuantity <= 1}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                    <span className="w-6 sm:w-7 text-center text-xs font-bold font-mono text-slate-800">
                      {selectedQuantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onIncreaseQuantity && onIncreaseQuantity();
                      }}
                      disabled={selectedQuantity >= remainingStock}
                      className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" strokeWidth={2.5} />
                    </button>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (qtyInCart === 0 && onAddToCart) {
                      onAddToCart(medicine, selectedQuantity);
                    }
                  }}
                  disabled={remainingStock < 1}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                    remainingStock < 1
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : qtyInCart > 0
                        ? "bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-200 cursor-default"
                        : "bg-medical-blue-600 hover:bg-medical-blue-700 text-white cursor-pointer"
                  }`}
                >
                  {qtyInCart > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  Unavailable
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestRestock && onRequestRestock();
                  }}
                  disabled={wishlistLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isRequested
                      ? "bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>{isRequested ? "Requested" : "Request Restock"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
