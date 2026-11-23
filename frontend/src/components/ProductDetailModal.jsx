"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Pill,
  Heart,
  Plus,
  Minus,
  Check,
  Building2,
  Package,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useMedicineAlternatives } from "@/hooks/useMedicines";

export default function ProductDetailModal({
  isOpen,
  onClose,
  medicine,
  allMedicines = [],
  cart = [],
  wishlist = [],
  wishlistLoading = false,
  onAddToCart,
  onRequestRestock,
  onSelectMedicine,
}) {
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // Reset quantity and image error whenever medicine changes
  useEffect(() => {
    setSelectedQuantity(1);
    setImageError(false);
  }, [medicine?.id]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  // Query backend for alternatives
  const { alternatives: apiAlternatives = [], isLoading: alternativesLoading } =
    useMedicineAlternatives(medicine?.id);

  // Compute in-stock alternatives by matching generic name
  const inStockAlternatives = useMemo(() => {
    if (!medicine || !medicine.genericName) return [];

    const targetGeneric = medicine.genericName.trim().toLowerCase();

    // Collect from client-side allMedicines (instant)
    const clientMatches = (allMedicines || []).filter((item) => {
      if (!item || item.id === medicine.id) return false;
      if (!item.genericName) return false;
      if ((item.stock || 0) <= 0) return false; // MUST be in stock
      return item.genericName.trim().toLowerCase() === targetGeneric;
    });

    // Merge with API alternatives if returned
    const map = new Map();
    clientMatches.forEach((m) => map.set(m.id, m));
    (apiAlternatives || []).forEach((m) => {
      if (m && m.id !== medicine.id && (m.stock || 0) > 0) {
        map.set(m.id, m);
      }
    });

    return Array.from(map.values());
  }, [medicine, allMedicines, apiAlternatives]);

  if (!isOpen || !medicine) return null;

  const cartItem = cart?.find((item) => item?.id === medicine?.id);
  const qtyInCart = cartItem ? cartItem.quantity || 0 : 0;
  const isAvailable = (medicine?.stock || 0) > 0;
  const remainingStock = Math.max(0, (medicine?.stock || 0) - qtyInCart);
  const isRequested = wishlist?.includes(medicine?.id);

  const handleIncrease = () => {
    if (selectedQuantity < remainingStock) {
      setSelectedQuantity((prev) => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart && remainingStock >= 1) {
      onAddToCart(medicine, selectedQuantity);
      setSelectedQuantity(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden z-10 animate-in zoom-in-95 fade-in duration-200">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-medical-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Medicine Details &amp; Alternatives
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-8">
          {/* Main Product Spotlight */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Product Image Stage */}
            <div className="md:col-span-5 relative bg-slate-50/80 rounded-2xl border border-slate-200/80 p-6 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px] overflow-hidden group">
              {medicine?.image && !imageError ? (
                <img
                  src={medicine.image}
                  alt={medicine.name}
                  className="max-h-60 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                    <Pill className="w-10 h-10 text-medical-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    Image not available
                  </span>
                </div>
              )}

              {/* Floating Stock Badge */}
              <div className="absolute top-3.5 left-3.5">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    In Stock ({medicine.stock} units)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Out of Stock
                  </span>
                )}
              </div>

              {medicine?.category && (
                <div className="absolute bottom-3.5 left-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white/90 text-slate-700 border border-slate-200/80 shadow-2xs">
                    <Package className="w-3 h-3 text-slate-400" />
                    {medicine.category}
                  </span>
                </div>
              )}
            </div>

            {/* Product Meta & Actions */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-5">
              <div>
                {/* Manufacturer / Company */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-medical-blue-600" />
                  <span>{medicine.company || "Pharmaceuticals"}</span>
                </div>

                {/* Medicine Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  {medicine.name}
                </h1>

                {/* Normal Clean Generic Line */}
                {medicine.genericName && (
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="text-slate-400 font-medium">Generic:</span>{" "}
                    <span className="font-semibold text-slate-800">
                      {medicine.genericName}
                    </span>
                  </p>
                )}

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3.5 text-xs">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 font-medium text-slate-600 flex items-center gap-1.5">
                    <span className="text-slate-400 font-normal">Dosage:</span>
                    <strong className="text-slate-800">{medicine.category}</strong>
                  </div>

                  {medicine.stock <= 5 && medicine.stock > 0 && (
                    <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 font-bold text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Low Stock: Only {medicine.stock} left!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Purchase Actions Box */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                    ৳{Number(medicine.sellingPrice || 0).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    / unit (incl. VAT)
                  </span>
                </div>

                {isAvailable ? (
                  qtyInCart > 0 ? (
                    <div className="w-full py-3 px-5 rounded-xl bg-teal-50/70 border border-teal-200/90 text-teal-700 font-bold text-sm flex items-center justify-center gap-2 select-none shadow-2xs">
                      <Check className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                      <span>Added</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                      {/* Quantity Picker */}
                      <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl p-1 shrink-0">
                        <button
                          onClick={handleDecrease}
                          disabled={selectedQuantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold font-mono text-slate-900">
                          {selectedQuantity}
                        </span>
                        <button
                          onClick={handleIncrease}
                          disabled={selectedQuantity >= remainingStock}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={handleAddToCart}
                        disabled={remainingStock < 1}
                        className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-medical-blue-600 hover:bg-medical-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-rose-800 block">
                        This item is currently out of stock.
                      </span>
                      <span className="text-[11px] text-rose-600">
                        Check the available alternative medicines below with the same generic.
                      </span>
                    </div>

                    <button
                      onClick={() => onRequestRestock && onRequestRestock(medicine.id)}
                      disabled={wishlistLoading}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                        isRequested
                          ? "bg-white text-medical-blue-700 border border-medical-blue-300"
                          : "bg-medical-blue-600 hover:bg-medical-blue-700 text-white"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{isRequested ? "Restock Requested" : "Request Restock"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ALTERNATIVE MEDICINES SECTION (SAME GENERIC IN STOCK) */}
          <div className="pt-6 border-t border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>Alternative Medicines (In Stock)</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {inStockAlternatives.length} available
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Available in-stock brands with generic:{" "}
                  <strong className="text-slate-800">
                    {medicine.genericName || "N/A"}
                  </strong>
                </p>
              </div>
            </div>

            {inStockAlternatives.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {inStockAlternatives.map((alt) => {
                  const altCartItem = cart?.find((item) => item?.id === alt.id);
                  const altQtyInCart = altCartItem ? altCartItem.quantity || 0 : 0;
                  const altRemaining = Math.max(0, (alt.stock || 0) - altQtyInCart);

                  return (
                    <div
                      key={alt.id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-md transition-all p-4 flex flex-col justify-between group relative"
                    >
                      {/* Top: Image & Info */}
                      <div>
                        <div className="flex items-start gap-3">
                          {/* Mini Thumbnail */}
                          <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center p-1 overflow-hidden">
                            {alt.image ? (
                              <img
                                src={alt.image}
                                alt={alt.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <Pill className="w-6 h-6 text-slate-400 group-hover:text-teal-600 transition-colors" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1">
                              {alt.category}
                            </span>
                            <h4
                              onClick={() => onSelectMedicine && onSelectMedicine(alt)}
                              className="font-bold text-slate-900 text-sm truncate hover:text-medical-blue-600 cursor-pointer transition-colors"
                              title={alt.name}
                            >
                              {alt.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {alt.company}
                            </p>
                          </div>
                        </div>

                        {/* Price & Stock */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                          <div>
                            <span className="text-base font-bold font-mono text-slate-900">
                              ৳{Number(alt.sellingPrice || 0).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">/ unit</span>
                          </div>

                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{alt.stock} in stock</span>
                          </span>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center gap-2 mt-3 pt-2">
                        <button
                          onClick={() => onSelectMedicine && onSelectMedicine(alt)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="View this alternative"
                        >
                          View
                        </button>

                        {altQtyInCart > 0 ? (
                          <div className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-teal-50/70 text-teal-700 border border-teal-200/90 flex items-center justify-center gap-1.5 select-none shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
                            <span>Added</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart && onAddToCart(alt, 1)}
                            disabled={altRemaining < 1}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-medical-blue-600 hover:bg-medical-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center">
                <Pill className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {medicine.genericName
                    ? `No other alternative brand with generic "${medicine.genericName}" is currently in stock.`
                    : "No generic information specified for this medicine to find alternatives."}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Our pharmacists can assist you with alternative prescriptions if required.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            DGDA Registered Pharmacy Product • 100% Genuine Medicine Guarantee
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
