"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  ChevronDown,
  Package,
  Building2,
  Loader2,
} from "lucide-react";

import { usePublicMedicines } from "@/hooks/useMedicines";
import { useCustomerWishlist } from "@/hooks/useCustomerPortal";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

import MedicineCard from "../MedicineCard";
import Pagination from "@/components/Pagination";
import ProductDetailModal from "@/components/ProductDetailModal";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { customer } = useAuth();
  const { cart, addToCart } = useCart();
  const { medicines = [], isLoading: medicinesLoading } = usePublicMedicines();
  const {
    wishlist = [],
    isLoading: wishlistLoading,
    addRequest,
  } = useCustomerWishlist();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Selected purchase quantity per medicine card
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [viewingMedicine, setViewingMedicine] = useState(null);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCompany]);

  // Category and Company options derived from medicines
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(medicines.map((m) => m.category).filter(Boolean)),
    ];
  }, [medicines]);

  const companies = useMemo(() => {
    return ["All", ...new Set(medicines.map((m) => m.company).filter(Boolean))];
  }, [medicines]);

  // Filtered medicines based on search, category, and company
  const filteredMedicines = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return medicines.filter((med) => {
      const matchesSearch =
        !query ||
        med.name?.toLowerCase().includes(query) ||
        med.company?.toLowerCase().includes(query) ||
        med.category?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All" || med.category === selectedCategory;

      const matchesCompany =
        selectedCompany === "All" || med.company === selectedCompany;

      return matchesSearch && matchesCategory && matchesCompany;
    });
  }, [medicines, searchQuery, selectedCategory, selectedCompany]);

  // Paginated slice
  const paginatedMedicines = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMedicines.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMedicines, currentPage]);

  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);

  // Handle restock request via custom hook
  const handleRequestRestock = async (medicineId) => {
    if (!customer) {
      toast.error("Please sign in to request medicine restock");
      router.push("/login");
      return;
    }
    try {
      await addRequest(medicineId);
    } catch (error) {
      console.error("Restock request error:", error);
    }
  };

  return (
    <div className="max-w-[95%] xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Page Title & Active Filter Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Medicine Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse DGDA-approved prescription &amp; OTC pharmaceuticals
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white px-3.5 py-2 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <span>Showing</span>
          <span className="font-mono font-bold text-slate-900">
            {filteredMedicines.length}
          </span>
          <span>products</span>
        </div>
      </div>

      {/* 2-COLUMN CATALOG LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-7 items-start">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-28 z-20">
          <div className="bg-white rounded-xl border border-slate-200/85 p-5">
            <div
              className={`flex items-center justify-between cursor-pointer transition-all ${
                isFiltersOpen ? "pb-3.5 border-b border-slate-100 mb-5" : ""
              }`}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-medical-blue-600" />
                <span>Filter Directory</span>
              </h3>

              <div className="flex items-center gap-2.5">
                {(selectedCategory !== "All" || selectedCompany !== "All") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory("All");
                      setSelectedCompany("All");
                    }}
                    className="text-xs font-semibold text-medical-blue-600 hover:text-medical-blue-800 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <div
                  className={`text-slate-400 transition-transform duration-200 ${
                    isFiltersOpen ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Filter Content */}
            <div className={`${isFiltersOpen ? "block" : "hidden"} space-y-6`}>
              {/* Category Filter */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={12} />
                  <span>Dosage Form</span>
                </span>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto scrollbar-none pr-1">
                  {categories.map((cat) => {
                    const count =
                      cat === "All"
                        ? medicines.length
                        : medicines.filter((m) => m.category === cat).length;
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full px-3 py-2 rounded-lg font-medium text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isActive
                            ? "bg-medical-blue-600 text-white font-semibold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate pr-2">{cat}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company Filter */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 size={12} />
                  <span>Manufacturer</span>
                </span>
                <div className="flex flex-col gap-1 max-h-56 overflow-y-auto scrollbar-none pr-1">
                  {companies.map((comp) => {
                    const count =
                      comp === "All"
                        ? medicines.length
                        : medicines.filter((m) => m.company === comp).length;
                    const isActive = selectedCompany === comp;
                    return (
                      <button
                        key={comp}
                        onClick={() => setSelectedCompany(comp)}
                        className={`w-full px-3 py-2 rounded-lg font-medium text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isActive
                            ? "bg-medical-blue-600 text-white font-semibold"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate pr-2">{comp}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT SIDE: MEDICINE CARDS GRID */}
        <section className="lg:col-span-4">
          {medicinesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600 mb-3" />
              <p className="text-sm font-medium text-slate-600">
                Loading medicine directory...
              </p>
            </div>
          ) : filteredMedicines.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginatedMedicines.map((med) => (
                  <MedicineCard
                    key={med.id}
                    medicine={med}
                    cart={cart}
                    wishlist={wishlist}
                    wishlistLoading={wishlistLoading}
                    selectedQuantity={selectedQuantities[med.id] || 1}
                    onIncreaseQuantity={() => {
                      const current = selectedQuantities[med.id] || 1;
                      const cartItem = cart?.find(
                        (item) => item?.id === med.id
                      );
                      const qtyInCart = cartItem ? cartItem.quantity || 0 : 0;
                      const remainingStock = (med.stock || 0) - qtyInCart;
                      if (current < remainingStock) {
                        setSelectedQuantities((prev) => ({
                          ...prev,
                          [med.id]: current + 1,
                        }));
                      }
                    }}
                    onDecreaseQuantity={() => {
                      const current = selectedQuantities[med.id] || 1;
                      if (current > 1) {
                        setSelectedQuantities((prev) => ({
                          ...prev,
                          [med.id]: current - 1,
                        }));
                      }
                    }}
                    onAddToCart={() => {
                      const qty = selectedQuantities[med.id] || 1;
                      addToCart(med, qty);
                      setSelectedQuantities((prev) => ({
                        ...prev,
                        [med.id]: 1,
                      }));
                    }}
                    onRequestRestock={() => handleRequestRestock(med.id)}
                    onViewProduct={(medicineToView) => setViewingMedicine(medicineToView)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredMedicines.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemName="medicines"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/85 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Package size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No medicines match your filter criteria
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
                Try clearing your selected category or manufacturer filter to
                browse all available medicines.
              </p>
              {(selectedCategory !== "All" || selectedCompany !== "All") && (
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedCompany("All");
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* PRODUCT DETAILS & ALTERNATIVE MEDICINES MODAL */}
      <ProductDetailModal
        isOpen={Boolean(viewingMedicine)}
        onClose={() => setViewingMedicine(null)}
        medicine={viewingMedicine}
        allMedicines={medicines}
        cart={cart}
        wishlist={wishlist}
        wishlistLoading={wishlistLoading}
        onAddToCart={(med, qty) => {
          addToCart(med, qty);
          setSelectedQuantities((prev) => ({ ...prev, [med.id]: 1 }));
        }}
        onRequestRestock={handleRequestRestock}
        onSelectMedicine={(med) => setViewingMedicine(med)}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading shop...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
