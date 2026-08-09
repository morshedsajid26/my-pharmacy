"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  X,
  Minus,
  Plus,
  Trash2,
  MapPin,
  Loader2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  getCurrentCustomer,
  createOnlineOrderAction,
} from "@/lib/actions/online-customer.actions";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    getCartTotal,
    getCartDeliveryCharge,
    getCartDiscount,
    getCartGrandTotal,
    saveCart,
    settings,
  } = useCart();

  const [customer, setCustomer] = useState(null);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [notes, setNotes] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      getCurrentCustomer()
        .then(setCustomer)
        .catch(() => {});
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const renderAddressSection = () => {
    if (!customer) {
      return (
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-xs text-amber-800">
          Please sign in or register to set your delivery address.
        </div>
      );
    }

    const savedAddresses = [];
    if (customer.address) {
      try {
        const parsed = JSON.parse(customer.address);
        if (Array.isArray(parsed)) {
          savedAddresses.push(...parsed);
        } else {
          savedAddresses.push(customer.address);
        }
      } catch (e) {
        savedAddresses.push(customer.address);
      }
    }

    return (
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span>Deliver to:</span>
          <span className="text-slate-800 font-extrabold">{customer.name}</span>
        </div>

        {savedAddresses.length > 0 ? (
          <div className="border-t border-slate-200/50 pt-3 space-y-2">
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              <span>Select Delivery Address:</span>
            </span>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {savedAddresses.map((addr, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedAddressIndex === idx
                      ? "bg-medical-blue-50/50 border-medical-blue-300 text-medical-blue-900 font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="checkout_address"
                    checked={selectedAddressIndex === idx}
                    onChange={() => setSelectedAddressIndex(idx)}
                    className="mt-0.5 text-medical-blue-600 focus:ring-medical-blue-500"
                  />
                  <span className="leading-tight break-words max-w-[210px]">
                    {addr}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200/50 pt-3 space-y-2.5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 font-semibold space-y-1">
              <span className="block font-bold">
                ⚠️ No saved address found!
              </span>
              <p className="leading-relaxed">
                You must register at least one delivery address in your profile
                to checkout.
              </p>
            </div>
            <Link
              href="/profile"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold text-xs text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <User size={12} />
              <span>Go to Profile to Add Address</span>
            </Link>
          </div>
        )}
      </div>
    );
  };

  const handleCheckout = async () => {
    if (!customer) {
      setIsCartOpen(false);
      router.push("/login?redirect=cart");
      return toast.error("Please Sign In to complete your order");
    }

    if (cart.length === 0) {
      return toast.error("Your cart is empty!");
    }

    let savedAddresses = [];
    if (customer.address) {
      try {
        const parsed = JSON.parse(customer.address);
        if (Array.isArray(parsed)) {
          savedAddresses.push(...parsed);
        } else {
          savedAddresses.push(customer.address);
        }
      } catch (e) {
        savedAddresses.push(customer.address);
      }
    }

    if (savedAddresses.length === 0) {
      return toast.error(
        "Please add a delivery address in your profile settings before placing an order!",
      );
    }

    const finalAddress = savedAddresses[selectedAddressIndex];
    if (!finalAddress) {
      return toast.error("Please select a delivery address!");
    }

    setCheckoutLoading(true);
    try {
      const result = await createOnlineOrderAction(cart, notes, finalAddress);
      if (result.success) {
        saveCart([]);
        setNotes("");
        setIsCartOpen(false);
        toast.success("Order placed successfully!");
        router.push("/orders");
      }
    } catch (error) {
      toast.error(error.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex z-[101]">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between h-full animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-medical-blue-600 w-5 h-5" />
              <h3 className="text-lg font-extrabold text-slate-900">
                Your Shopping Cart
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length > 0 ? (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-slate-800 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.company}
                        </p>
                        <span className="text-xs font-black text-medical-blue-600 mt-1 block">
                          ৳{item.sellingPrice} each
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() =>
                              updateCartQty(item.id, -1, item.stock)
                            }
                            className="p-1.5 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQty(item.id, 1, item.stock)
                            }
                            className="p-1.5 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <MapPin size={16} className="text-slate-400" />
                    <span>Delivery & Order Notes</span>
                  </h4>
                  {renderAddressSection()}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Add special instructions (optional):
                    </label>
                    <textarea
                      placeholder="E.g., Please ring the bell. Cash on delivery. Leave it at reception."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-medical-blue-500 outline-none h-20 resize-none font-medium text-slate-700"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-200 mb-4" />
                <h4 className="font-bold text-slate-700">Your cart is empty</h4>
                <p className="text-slate-400 text-xs mt-1">
                  Browse our store and add some medicines to checkout.
                </p>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
              <div className="space-y-2.5 border-b border-slate-200/60 pb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-500">Subtotal:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    ৳{getCartTotal().toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-500">
                    Delivery Charge:
                  </span>
                  {getCartDeliveryCharge() === 0 ? (
                    <span className="text-xs font-black text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-slate-800 font-mono">
                      ৳{getCartDeliveryCharge().toFixed(2)}
                    </span>
                  )}
                </div>

                {getCartDeliveryCharge() > 0 && (
                  <p className="text-[10px] text-amber-600 font-semibold leading-none">
                    💡 Add ৳
                    {(
                      settings.minOrderForFreeDelivery - getCartTotal()
                    ).toFixed(2)}{" "}
                    more for free delivery!
                  </p>
                )}

                {getCartDiscount() > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500 flex items-center gap-1">
                      <span>Discount:</span>
                      {settings.discountTiers && (
                        <span className="text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                          APPLIED
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-emerald-600 font-mono">
                      -৳{getCartDiscount().toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-700 text-base">
                  Grand Total:
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ৳{getCartGrandTotal().toFixed(2)}
                </span>
              </div>

              {customer ? (
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full h-12 rounded-xl bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-medical-blue-600/20 disabled:opacity-50 transition-all text-base cursor-pointer"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Place Cash-On-Delivery Order</>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    router.push("/login?redirect=cart");
                  }}
                  className="w-full h-12 rounded-xl bg-medical-blue-600 hover:bg-medical-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-base cursor-pointer"
                >
                  Sign In to Place Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
