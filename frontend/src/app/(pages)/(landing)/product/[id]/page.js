"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Pill,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Package,
  Sparkles,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";
import {
  usePublicMedicine,
  usePublicMedicines,
  useMedicineAlternatives,
} from "@/hooks/useMedicines";
import { useCustomerWishlist } from "@/hooks/useCustomerPortal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params?.id;

  const { customer } = useAuth();
  const { cart, addToCart } = useCart();
  const { medicine, isLoading: medicineLoading } = usePublicMedicine(medicineId);
  const { medicines: allMedicines = [] } = usePublicMedicines();
  const { alternatives: apiAlternatives = [], isLoading: altLoading } =
    useMedicineAlternatives(medicineId);
  const { wishlist = [], addRequest, isLoading: wishlistLoading } =
    useCustomerWishlist();

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  // In-stock alternatives filtered by same generic name
  const inStockAlternatives = useMemo(() => {
    if (!medicine || !medicine.genericName) return [];

    const targetGeneric = medicine.genericName.trim().toLowerCase();

    // Collect from client-side allMedicines
    const clientMatches = (allMedicines || []).filter((item) => {
      if (!item || item.id === medicine.id) return false;
      if (!item.genericName) return false;
      if ((item.stock || 0) <= 0) return false; // MUST be in stock
      return item.genericName.trim().toLowerCase() === targetGeneric;
    });

    // Merge with API alternatives
    const map = new Map();
    clientMatches.forEach((m) => map.set(m.id, m));
    (apiAlternatives || []).forEach((m) => {
      if (m && m.id !== medicine.id && (m.stock || 0) > 0) {
        map.set(m.id, m);
      }
    });

    return Array.from(map.values());
  }, [medicine, allMedicines, apiAlternatives]);

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
    if (medicine && remainingStock >= 1) {
      addToCart(medicine, selectedQuantity);
      setSelectedQuantity(1);
      toast.success(`${medicine.name} added to cart!`);
    }
  };

  const handleRequestRestock = async () => {
    if (!customer) {
      toast.error("Please sign in to request restock");
      router.push("/login");
      return;
    }
    try {
      await addRequest(medicine.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (medicineLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading medicine details...</p>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Pill className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Medicine Not Found</h2>
        <p className="text-slate-500 text-xs mt-1">
          The medicine you are looking for may have been removed or does not exist.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-medical-blue-600 text-white font-bold text-xs hover:bg-medical-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Medicine Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[95%] xl:max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back Button & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-medical-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <Link href="/" className="hover:text-slate-700">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-slate-700">Medicines</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px] sm:max-w-xs">
            {medicine.name}
          </span>
        </div>
      </div>

      {/* Main Medicine Spotlight Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Product Image */}
          <div className="lg:col-span-5 relative bg-slate-50 rounded-2xl border border-slate-200/80 p-8 flex items-center justify-center min-h-[320px] sm:min-h-[380px] overflow-hidden group">
            {medicine?.image && !imageError ? (
              <img
                src={medicine.image}
                alt={medicine.name}
                className="max-h-72 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
                  <Pill className="w-12 h-12 text-medical-blue-600" />
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Image Not Available
                </span>
              </div>
            )}

            {/* Floating Stock Badge */}
            <div className="absolute top-4 left-4">
              {isAvailable ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Out of Stock
                </span>
              )}
            </div>

            {medicine?.category && (
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/95 text-slate-700 border border-slate-200 shadow-2xs">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  {medicine.category}
                </span>
              </div>
            )}
          </div>

          {/* Right: Info, Generic, Pricing & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {/* Manufacturer */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-medical-blue-600" />
                <span>{medicine.company || "Pharmaceuticals Ltd."}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1.5">
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

              {/* Meta details */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3.5 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-600">
                  Dosage Form: <strong className="text-slate-800">{medicine.category}</strong>
                </div>

                {medicine.stock <= 5 && medicine.stock > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Low Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price & Purchase Actions */}
            <div className="pt-6 border-t border-slate-100 space-y-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-5xl font-black text-slate-900 font-mono">
                  ৳{Number(medicine.sellingPrice || 0).toFixed(2)}
                </span>
                <span className="text-xs sm:text-sm text-slate-400 font-semibold">
                  / unit (MRP incl. VAT)
                </span>
              </div>

              {isAvailable ? (
                qtyInCart > 0 ? (
                  <div className="w-full py-3.5 px-6 rounded-xl bg-teal-50/70 border border-teal-200/90 text-teal-700 font-bold text-sm flex items-center justify-center gap-2 select-none shadow-2xs">
                    <Check className="w-4 h-4 text-teal-600 stroke-[2.5]" />
                    <span>Added</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                    {/* Quantity Counter */}
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 shrink-0">
                      <button
                        onClick={handleDecrease}
                        disabled={selectedQuantity <= 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      <span className="w-12 text-center text-base font-bold font-mono text-slate-900">
                        {selectedQuantity}
                      </span>
                      <button
                        onClick={handleIncrease}
                        disabled={selectedQuantity >= remainingStock}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={remainingStock < 1}
                      className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-medical-blue-600 hover:bg-medical-blue-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                )
              ) : (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-rose-800 block">
                      This medicine is currently out of stock.
                    </span>
                    <span className="text-xs text-rose-600">
                      You can order verified in-stock alternatives below with the exact same active generic formula.
                    </span>
                  </div>

                  <button
                    onClick={handleRequestRestock}
                    disabled={wishlistLoading}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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
      </div>

      {/* ALTERNATIVE MEDICINES SECTION (SAME GENERIC IN STOCK) */}
      <section className="space-y-6 pt-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-teal-600" />
            <span>Alternative Medicines Available in Stock</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {inStockAlternatives.length} brands
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pharmaceutical brands containing the exact same active generic (
            <strong className="text-slate-800 font-mono">
              {medicine.genericName || "N/A"}
            </strong>
            ) currently in stock and ready to dispense.
          </p>
        </div>

        {inStockAlternatives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {inStockAlternatives.map((alt) => {
              const altCartItem = cart?.find((item) => item?.id === alt.id);
              const altQtyInCart = altCartItem ? altCartItem.quantity || 0 : 0;
              const altRemaining = Math.max(0, (alt.stock || 0) - altQtyInCart);

              return (
                <div
                  key={alt.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/50 hover:shadow-lg transition-all p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail Stage */}
                    <div className="w-full h-36 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-3 overflow-hidden mb-3">
                      {alt.image ? (
                        <img
                          src={alt.image}
                          alt={alt.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Pill className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" />
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded uppercase tracking-wider">
                        {alt.category}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>In Stock</span>
                      </span>
                    </div>

                    <Link
                      href={`/product/${alt.id}`}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-medical-blue-600 transition-colors block truncate"
                      title={alt.name}
                    >
                      {alt.name}
                    </Link>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {alt.company}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <span className="text-lg font-black font-mono text-slate-900">
                        ৳{Number(alt.sellingPrice || 0).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1">/ unit</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-2">
                    <Link
                      href={`/product/${alt.id}`}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      View
                    </Link>

                    {altQtyInCart > 0 ? (
                      <div className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-teal-50/70 text-teal-700 border border-teal-200/90 flex items-center justify-center gap-1.5 select-none shadow-2xs">
                        <Check className="w-3.5 h-3.5 text-teal-600 stroke-[2.5]" />
                        <span>Added</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(alt, 1)}
                        disabled={altRemaining < 1}
                        className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-medical-blue-600 hover:bg-medical-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center flex flex-col items-center justify-center">
            <Pill className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">
              No Alternative Brands Currently In Stock
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {medicine.genericName
                ? `Currently no other in-stock brands carry the active generic "${medicine.genericName}".`
                : "No generic formula registered for this medicine."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
