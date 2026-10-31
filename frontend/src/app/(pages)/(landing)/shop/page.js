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

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const { customer } = useAuth();
  const { cart, addToCart } = useCart();
  const { medicines = [], isLoading: medicinesLoading } = usePublicMedicines();
  const { wishlist = [], isLoading: wishlistLoading, addRequest } = useCustomerWishlist();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Selected purchase quantity per medicine card
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCompany]);

  // Category and Company options derived from medicines
  const categories = useMemo(() => {
    return ["All", ...new Set(medicines.map((m) => m.category).filter(Boolean))];
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
    <div className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* 2-COLUMN CATALOG LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 z-20">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
            <div
              className={`flex items-center justify-between cursor-pointer transition-all ${
                isFiltersOpen ? "pb-4 border-b border-slate-100 mb-6" : ""
              }`}
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-slate-500" />
                <span>Filters</span>
              </h3>

              <div className="flex items-center gap-3">
                {(selectedCategory !== "All" || selectedCompany !== "All") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategory("All");
                      setSelectedCompany("All");
                    }}
                    className="text-xs font-extrabold text-medical-blue-600 hover:text-medical-blue-700 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <div
                  className={`text-slate-500 transition-transform duration-300 ${
                    isFiltersOpen ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* Filter Content */}
            <div className={`${isFiltersOpen ? "block" : "hidden"} space-y-6`}>
              {/* Category Filter */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Package size={12} className="text-slate-400" />
                  <span>Dosage Category</span>
                </span>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto scrollbar-none pr-1">
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
                        className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-medical-blue-600 text-white border-medical-blue-600 shadow-md shadow-medical-blue-600/10 scale-[1.01]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <span className="truncate pr-2">{cat}</span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/70 text-slate-500"
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
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 size={12} className="text-slate-400" />
                  <span>Manufacturer</span>
                </span>
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto scrollbar-none pr-1">
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
                        className={`w-full px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-medical-blue-600 text-white border-medical-blue-600 shadow-md shadow-medical-blue-600/10 scale-[1.01]"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-transparent hover:border-slate-200"
                        }`}
                      >
                        <span className="truncate pr-2">{comp}</span>
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shrink-0 ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/70 text-slate-500"
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
          {/* LOADING STATE */}
          {medicinesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-medical-blue-600 mb-3" />
              <p className="text-sm font-bold text-slate-600">Loading catalog medicines...</p>
            </div>
          ) : filteredMedicines.length > 0 ? (
            <>
              {/* MEDICINE CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
                      const cartItem = cart.find((item) => item.id === med.id);
                      const qtyInCart = cartItem ? cartItem.quantity : 0;
                      const remainingStock = med.stock - qtyInCart;
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
                    onAddToCart={(medicine, qty) => {
                      addToCart(medicine, qty);
                      setSelectedQuantities((prev) => ({
                        ...prev,
                        [medicine.id]: 1,
                      }));
                      toast.success(`Added ${qty} × ${medicine.name} to cart`);
                    }}
                    onRequestRestock={handleRequestRestock}
                  />
                ))}
              </div>

              {/* PAGINATION COMPONENT */}
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
            /* EMPTY STATE */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <Package size={28} />
              </div>
              <h3 className="text-lg font-black text-slate-800">No medicines match your filters</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
                We couldn't find any medicine matching your selected criteria. Try adjusting or clearing your filters.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
