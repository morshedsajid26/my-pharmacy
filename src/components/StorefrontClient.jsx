"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
  Plus,
  Minus,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  PlusCircle,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Phone,
  FileText,
  Loader2,
  Heart,
  SlidersHorizontal,
  Pill,
  Award,
  Truck,
  Thermometer,
  PhoneCall,
  Activity,
  Sparkles,
  Star,
  Check,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  registerCustomerAction,
  loginCustomerAction,
  logoutCustomerAction,
  updateCustomerProfileAction,
  getCustomerOrdersAction,
  createOnlineOrderAction,
  getCustomerWishlistAction,
  addMedicineRequestAction,
  removeMedicineRequestAction,
} from "@/lib/actions/online-customer.actions";
import { getStorefrontSettingsAction } from "@/lib/actions/online-admin.actions";
import toast, { Toaster } from "react-hot-toast";
import OTPInput from "@/components/OTPInput";
import StorefrontHeader from "../app/(pages)/(landing)/StorefrontHeader";
import StorefrontHero from "../app/(pages)/(landing)/StorefrontHero";
import TrustBadges from "../app/(pages)/(landing)/TrustBadges";
import MedicineCard from "../app/(pages)/(landing)/MedicineCard";
import StandardsBanner from "../app/(pages)/(landing)/StandardsBanner";
import Testimonials from "../app/(pages)/(landing)/Testimonials";
import FAQSection from "../app/(pages)/(landing)/FAQSection";
import StorefrontFooter from "../app/(pages)/(landing)/StorefrontFooter";
import PremiumHero from "../app/(pages)/(landing)/PremiumHero";
import PremiumFeatures from "../app/(pages)/(landing)/PremiumFeatures";
import PremiumCategories from "../app/(pages)/(landing)/PremiumCategories";
import PremiumBrands from "../app/(pages)/(landing)/PremiumBrands";
import PremiumProductRow from "../app/(pages)/(landing)/PremiumProductRow";
import PremiumCTA from "../app/(pages)/(landing)/PremiumCTA";
import ChatWidget from "./ChatWidget";

export default function StorefrontClient({
  initialMedicines,
  initialCustomer,
  initialSettings,
  mode = "landing",
}) {
  // Storefront & Customer State
  const [medicines] = useState(initialMedicines || []);
  const [customer, setCustomer] = useState(initialCustomer);
  const [settings, setSettings] = useState(
    initialSettings || {
      minOrderForFreeDelivery: 500,
      deliveryCharge: 20,
      discountTiers: [],
    },
  );

  // Load latest storefront settings (including discount tiers)
  useEffect(() => {
    async function loadSettings() {
      const fresh = await getStorefrontSettingsAction();
      if (fresh) setSettings(fresh);
      console.log("Fetched storefront settings:", fresh);
    }
    loadSettings();
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCompany]);

  // Selected purchase quantity per medicine on the cards
  const [selectedQuantities, setSelectedQuantities] = useState({});

  // Interactive UI drawers & modals
  const { cart, isCartOpen, setIsCartOpen, addToCart, getCartTotal } = useCart();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"

  // Orders & Checkout State
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Wishlist requests state
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Auth Form State
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authAddress, setAuthAddress] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Load customer wishlist requests
  useEffect(() => {
    async function loadWishlist() {
      if (customer) {
        try {
          const list = await getCustomerWishlistAction();
          setWishlist(list);
        } catch (e) {
          console.error("Failed to load customer wishlist:", e);
        }
      } else {
        setWishlist([]);
      }
    }
    loadWishlist();
  }, [customer]);

  // Get unique categories list
  const categories = ["All", ...new Set(medicines.map((m) => m.category))];

  // Get unique pharmaceutical companies list
  const companies = ["All", ...new Set(medicines.map((m) => m.company))];

  // Filter medicines based on search, category & company
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || med.category === selectedCategory;
    const matchesCompany =
      selectedCompany === "All" || med.company === selectedCompany;
    return matchesSearch && matchesCategory && matchesCompany;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredMedicines.length / ITEMS_PER_PAGE);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Toggle Medicine Restock Request
  const handleRequestRestock = async (medId) => {
    if (!customer) {
      setAuthMode("login");
      setIsAuthModalOpen(true);
      return toast.error("Please Sign In to request a restock");
    }

    setWishlistLoading(true);
    try {
      const isRequested = wishlist.includes(medId);
      if (isRequested) {
        const res = await removeMedicineRequestAction(medId);
        if (res.success) {
          setWishlist((prev) => prev.filter((id) => id !== medId));
          toast.success("Restock request cancelled successfully.");
        }
      } else {
        const res = await addMedicineRequestAction(medId);
        if (res.success) {
          setWishlist((prev) => [...prev, medId]);
          toast.success(
            "Restock request submitted! We will notify you when restocked.",
          );
        }
      }
    } catch (error) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Customer Auth Functions
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authPhone || !authPassword) {
      return toast.error("Please fill in all required fields");
    }

    setAuthSubmitting(true);
    try {
      if (authMode === "login") {
        const result = await loginCustomerAction(authPhone, authPassword);
        if (result.success) {
          setCustomer(result.customer);
          setIsAuthModalOpen(false);
          toast.success(`Welcome back, ${result.customer.name}!`);
          resetAuthForm();
        }
      } else {
        if (!authName) {
          setAuthSubmitting(false);
          return toast.error("Please provide your name to register");
        }

        // Basic Phone validation (11 digits starting with 01)
        if (!/^01[3-9]\d{8}$/.test(authPhone)) {
          setAuthSubmitting(false);
          return toast.error(
            "Please enter a valid 11-digit mobile number (starts with 01)",
          );
        }

        // Generate a random 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setOtpStep(true);
        toast.success(
          `🔑 Verification OTP Sent! For testing, use code: ${code}`,
          { duration: 12000 },
        );
      }
    } catch (error) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleOTPComplete = async (enteredOtp) => {
    if (enteredOtp !== generatedOtp) {
      toast.error(
        "Invalid OTP! Try the code displayed in the top notification toast.",
      );
      return;
    }

    setOtpVerifying(true);
    try {
      // Execute registration action (address is omitted during signup)
      const result = await registerCustomerAction(
        authName,
        authPhone,
        authPassword,
      );
      if (result.success) {
        setCustomer(result.customer);
        setIsAuthModalOpen(false);
        setOtpStep(false);
        setGeneratedOtp("");
        toast.success(
          `Welcome, ${result.customer.name}! Phone verified and account registered successfully.`,
        );
        resetAuthForm();
      }
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutCustomerAction();
      setCustomer(null);
      setCustomerOrders([]);
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  const resetAuthForm = () => {
    setAuthName("");
    setAuthPhone("");
    setAuthPassword("");
    setAuthAddress("");
    setOtpStep(false);
    setGeneratedOtp("");
  };

  // Load Order History for active customer
  const loadOrders = async () => {
    if (!customer) return;
    setOrdersLoading(true);
    try {
      const orders = await getCustomerOrdersAction();
      setCustomerOrders(orders);
    } catch (e) {
      toast.error(e.message || "Failed to load orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Trigger loading orders when orders modal opens
  useEffect(() => {
    if (isOrdersModalOpen && customer) {
      loadOrders();
    }
  }, [isOrdersModalOpen, customer]);

  const totalItems = cart.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Toaster position="top-center" />
      <ChatWidget />

      {/* FLOATING CART WIDGET */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center rounded-l-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-y border-l border-medical-blue-600/20 group active:scale-95 cursor-pointer"
      >
        {/* Top Segment: Cart Icon & Item Count */}
        <div className="bg-medical-blue-600 group-hover:bg-medical-blue-700 text-white px-3.5 py-3 flex flex-col items-center justify-center gap-1 min-w-[80px] border-b border-white/15 transition-colors">
          <ShoppingCart
            size={18}
            className="text-white group-hover:scale-110 transition-transform"
          />
          <span className="text-[10px] font-black tracking-wide whitespace-nowrap">
            {totalItems} {totalItems === 1 ? "Item" : "Items"}
          </span>
        </div>

        {/* Bottom Segment: Total Price */}
        <div className="bg-emerald-500 group-hover:bg-emerald-600 text-white w-full px-2 py-2 flex items-center justify-center transition-colors">
          <span className="text-xs font-black tracking-wide whitespace-nowrap">
            ৳{getCartTotal()}
          </span>
        </div>
      </button>

      <StorefrontHeader
        customer={customer}
        cartCount={cart.length}
        onOrdersClick={() => setIsOrdersModalOpen(true)}
        onLogout={handleLogout}
        onAuthClick={() => {
          setAuthMode("login");
          setIsAuthModalOpen(true);
        }}
        onCartClick={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {mode === 'landing' && !searchQuery.trim() && (
        <>
          <PremiumHero 
            customer={customer}
            onAuthClick={() => {
              setAuthMode("login");
              setIsAuthModalOpen(true);
            }}
          />
          <PremiumFeatures />
          <PremiumCategories categories={categories} />
          
          <PremiumProductRow
            title="Flash Sale"
            subtitle="Hurry Up! Deals end soon"
            medicines={medicines.slice(0, 4)}
            cart={cart}
            wishlist={wishlist}
            wishlistLoading={wishlistLoading}
            selectedQuantities={selectedQuantities}
            onIncreaseQuantity={(medId, maxStock) => {
              const current = selectedQuantities[medId] || 1;
              const cartItem = cart.find(item => item.id === medId);
              const qtyInCart = cartItem ? cartItem.quantity : 0;
              const remainingStock = maxStock - qtyInCart;
              if (current < remainingStock) {
                setSelectedQuantities(prev => ({ ...prev, [medId]: current + 1 }));
              }
            }}
            onDecreaseQuantity={(medId) => {
              const current = selectedQuantities[medId] || 1;
              if (current > 1) {
                setSelectedQuantities(prev => ({ ...prev, [medId]: current - 1 }));
              }
            }}
            onAddToCart={(med, qty) => {
              addToCart(med, qty);
              setSelectedQuantities(prev => ({ ...prev, [med.id]: 1 }));
            }}
            onRequestRestock={handleRequestRestock}
          />

          <PremiumCTA />

          <PremiumBrands medicines={medicines} />

          <PremiumProductRow
            title="Trending Products"
            subtitle="Most loved by our customers"
            medicines={medicines.slice(4, 8)}
            cart={cart}
            wishlist={wishlist}
            wishlistLoading={wishlistLoading}
            selectedQuantities={selectedQuantities}
            onIncreaseQuantity={(medId, maxStock) => {
              const current = selectedQuantities[medId] || 1;
              const cartItem = cart.find(item => item.id === medId);
              const qtyInCart = cartItem ? cartItem.quantity : 0;
              const remainingStock = maxStock - qtyInCart;
              if (current < remainingStock) {
                setSelectedQuantities(prev => ({ ...prev, [medId]: current + 1 }));
              }
            }}
            onDecreaseQuantity={(medId) => {
              const current = selectedQuantities[medId] || 1;
              if (current > 1) {
                setSelectedQuantities(prev => ({ ...prev, [medId]: current - 1 }));
              }
            }}
            onAddToCart={(med, qty) => {
              addToCart(med, qty);
              setSelectedQuantities(prev => ({ ...prev, [med.id]: 1 }));
            }}
            onRequestRestock={handleRequestRestock}
          />
        </>
      )}

      {/* CATALOG AREA */}
      {(mode === "shop" || searchQuery.trim() !== "") && (
        <main className="max-w-[95%] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* MOBILE ORDER HISTORY TRIGGER */}
          {customer && (
            <div className="md:hidden mb-6">
              <button
                onClick={() => setIsOrdersModalOpen(true)}
                className="w-full flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-slate-700 font-bold text-xs"
              >
                <span className="flex items-center gap-2">
                  <Clock size={18} /> My Order History
                </span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* 2-COLUMN SIDEBAR LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative">
            {/* LEFT SIDEBAR: FILTERS */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 z-20">
              <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-md shadow-slate-100/30">
                <div
                  className={`flex items-center justify-between cursor-pointer transition-all ${isFiltersOpen ? "pb-4 border-b border-slate-100 mb-6" : ""}`}
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-slate-500" />
                    <span>Catalog Filters</span>
                  </h3>

                  <div className="flex items-center gap-3">
                    {(selectedCategory !== "All" ||
                      selectedCompany !== "All") && (
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
                    {/* Dropdown Icon */}
                    <div
                      className={`text-slate-500 transition-transform duration-300 ${isFiltersOpen ? "rotate-180" : ""}`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Filter Content (Collapsible) */}
                <div
                  className={`${isFiltersOpen ? "block" : "hidden"} space-y-6`}
                >
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Package size={12} className="text-slate-400" />
                      <span>Category</span>
                    </span>
                    <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto scrollbar-none pr-1">
                      {categories.map((cat) => {
                        const count =
                          cat === "All"
                            ? medicines.length
                            : medicines.filter((m) => m.category === cat)
                                .length;
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

                  {/* Brand/Company Filter */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span>Pharmaceutical Brand</span>
                    </span>
                    <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto scrollbar-none pr-1">
                      {companies.map((comp) => {
                        const count =
                          comp === "All"
                            ? medicines.length
                            : medicines.filter((m) => m.company === comp)
                                .length;
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
            </div>

            {/* RIGHT SIDE: MEDICINE CARDS GRID */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMedicines.length > 0 ? (
                  paginatedMedicines.map((med) => (
                    <MedicineCard
                      key={med.id}
                      medicine={med}
                      cart={cart}
                      wishlist={wishlist}
                      wishlistLoading={wishlistLoading}
                      selectedQuantity={selectedQuantities[med.id] || 1}
                      onIncreaseQuantity={() => {
                        const current = selectedQuantities[med.id] || 1;
                        const cartItem = cart.find(
                          (item) => item.id === med.id,
                        );
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
                      onAddToCart={() => {
                        const qty = selectedQuantities[med.id] || 1;
                        addToCart(med, qty);
                        setSelectedQuantities((prev) => ({
                          ...prev,
                          [med.id]: 1,
                        }));
                      }}
                      onRequestRestock={() => handleRequestRestock(med.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">
                      No medicines found
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Try resetting your search query or choosing another
                      category.
                    </p>
                  </div>
                )}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">
                    Showing{" "}
                    <span className="text-slate-800">
                      {Math.min(
                        (currentPage - 1) * ITEMS_PER_PAGE + 1,
                        filteredMedicines.length,
                      )}
                    </span>{" "}
                    to{" "}
                    <span className="text-slate-800">
                      {Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredMedicines.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="text-slate-800">
                      {filteredMedicines.length}
                    </span>{" "}
                    medicines
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-650 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-100 transition-all cursor-pointer flex items-center justify-center min-w-10 min-h-10"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Render page numbers */}
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? "bg-medical-blue-600 hover:bg-medical-blue-700 text-white shadow-md shadow-medical-blue-600/10"
                              : "bg-white border border-slate-100 hover:border-slate-350 text-slate-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-650 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-100 transition-all cursor-pointer flex items-center justify-center min-w-10 min-h-10"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {mode === "landing" && !searchQuery.trim() && (
        <>
          <StandardsBanner />
          <Testimonials />
          <FAQSection openFaq={openFaq} onToggleFaq={setOpenFaq} />
        </>
      )}

      <StorefrontFooter />

      {/* LOGIN / SIGNUP INLINE DRAWER MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAuthModalOpen(false)}
          />

          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-300">
            {otpStep ? (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="text-medical-blue-600 w-6 h-6 animate-pulse" />
                    <span className="font-black text-slate-900 text-lg">
                      Verify Mobile
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setOtpStep(false);
                      setGeneratedOtp("");
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight">
                    Enter Verification Code
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                    We sent a 6-digit verification code to{" "}
                    <strong className="text-slate-800">{authPhone}</strong>.
                  </p>
                </div>

                <div className="py-4">
                  <OTPInput length={6} onComplete={handleOTPComplete} />
                </div>

                {otpVerifying && (
                  <div className="flex items-center justify-center gap-2 text-medical-blue-600 text-xs font-bold animate-pulse">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Verifying registration details...</span>
                  </div>
                )}

                <div className="text-center pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    Didn't receive the code?{" "}
                    <button
                      onClick={() => {
                        const newCode = Math.floor(
                          100000 + Math.random() * 900000,
                        ).toString();
                        setGeneratedOtp(newCode);
                        toast.success(
                          `🔑 New OTP Sent! Use code: ${newCode} to verify your phone number.`,
                          { duration: 10000 },
                        );
                      }}
                      className="font-bold text-medical-blue-600 hover:underline cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </p>

                  <button
                    onClick={() => {
                      setOtpStep(false);
                      setGeneratedOtp("");
                    }}
                    className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    Back to Edit Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <PlusCircle className="text-medical-blue-600 w-6 h-6" />
                    <span className="font-black text-slate-900 text-lg">
                      Customer Portal
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {authMode === "login"
                      ? "Welcome back!"
                      : "Create an Account"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {authMode === "login"
                      ? "Enter your mobile number and password to login & order."
                      : "Fill in the details to register your delivery account."}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === "signup" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="E.g., Sajid Morshed"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                        className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-medical-blue-500 outline-none font-semibold text-slate-800"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Mobile Number (Phone)
                    </label>
                    <input
                      type="tel"
                      placeholder="E.g., 01712345678"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      required
                      className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-medical-blue-500 outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm focus:ring-2 focus:ring-medical-blue-500 outline-none font-semibold text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full h-12 bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-medical-blue-600/10 disabled:opacity-50 transition-all text-sm mt-6 cursor-pointer"
                  >
                    {authSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>
                        {authMode === "login" ? "Sign In" : "Register with OTP"}
                      </span>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                  {authMode === "login" ? (
                    <p className="text-xs text-slate-500">
                      Don't have an account?{" "}
                      <button
                        onClick={() => setAuthMode("signup")}
                        className="font-bold text-medical-blue-600 hover:text-medical-blue-700 cursor-pointer"
                      >
                        Register Now
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Already have an account?{" "}
                      <button
                        onClick={() => setAuthMode("login")}
                        className="font-bold text-medical-blue-600 hover:text-medical-blue-700 cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MY ORDERS HISTORY PORTAL MODAL */}
      {isOrdersModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsOrdersModalOpen(false)}
          />

          <div className="bg-white rounded-3xl max-w-3xl w-full h-[80vh] flex flex-col justify-between shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-medical-blue-600 w-5 h-5" />
                <h3 className="text-lg font-extrabold text-slate-900">
                  Your Online Orders History
                </h3>
              </div>
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {ordersLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-medical-blue-600" />
                </div>
              ) : customerOrders.length > 0 ? (
                <div className="space-y-6">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4"
                    >
                      {/* Top Summary */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div className="space-y-1">
                          <span className="font-extrabold text-slate-800 text-sm">
                            {order.orderNo}
                          </span>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Ordered:{" "}
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-slate-800">
                            ৳{order.totalAmount}
                          </span>
                          {order.status === "PENDING" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm">
                              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                              <span>Pending Approval</span>
                            </span>
                          ) : order.status === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                              <CheckCircle
                                size={12}
                                className="text-emerald-500"
                              />
                              <span>Approved & Fulfilling</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200 shadow-sm">
                              <XCircle size={12} className="text-red-500" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs sm:text-sm text-slate-600"
                          >
                            <span className="font-semibold text-slate-700 max-w-[200px] sm:max-w-md truncate">
                              {item.medicine.name}{" "}
                              <span className="text-slate-400 text-[10px] font-medium">
                                ({item.medicine.company})
                              </span>
                            </span>
                            <div className="flex items-center gap-6">
                              <span>Qty: {item.quantity}</span>
                              <span className="font-bold text-slate-800 w-16 text-right">
                                ৳{item.totalPrice}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Delivery Detail */}
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
                        <div className="flex items-start gap-1">
                          <MapPin size={12} className="text-slate-400 mt-0.5" />
                          <span>
                            Delivery to:{" "}
                            <strong className="text-slate-700">
                              {order.address}
                            </strong>
                          </span>
                        </div>
                        {order.notes && (
                          <div className="flex items-start gap-1">
                            <FileText
                              size={12}
                              className="text-slate-400 mt-0.5"
                            />
                            <span>
                              Notes:{" "}
                              <em className="text-slate-600">{order.notes}</em>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <Package className="w-12 h-12 text-slate-200 mb-4" />
                  <h4 className="font-bold text-slate-700">
                    No order history found
                  </h4>
                  <p className="text-slate-400 text-xs mt-1">
                    Once you place an order, it will appear here instantly.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsOrdersModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all cursor-pointer"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
