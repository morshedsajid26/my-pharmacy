"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Loader2, PlusCircle } from "lucide-react";
import InputField from "@/components/InputField";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import Password from "@/components/Password";
import { useEffect } from "react";
import { loginCustomerAction } from "@/lib/actions/online-customer.actions";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isPhone = /^[0-9+\s-]{8,}$/.test(identifier.trim());

      if (isPhone) {
        const result = await loginCustomerAction(identifier.trim(), password);
        if (result.success) {
          toast.success("Successfully logged in!");
          router.push("/overview");
        }
      } else {
        const success = await login(identifier.trim(), password);
        if (success) {
          toast.success("Successfully logged in!");
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login component error:", error);
      toast.error(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-medical-blue-600 flex items-center justify-center shadow-lg shadow-medical-blue-200 mb-4 animate-in zoom-in-50 duration-500">
            <PlusCircle className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            S&S<span className="text-medical-blue-600">Pharmacy</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Smart Pharmacy Management System
          </p>
        </div>

        {/* Auth Card Content */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900">
                Welcome back!
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Please enter your details to sign in.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                label="Email or Phone"
                type="text"
                placeholder="Enter your Email or Phone Number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />

              <Password
                name="password"
                id="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-medical-blue-600 focus:ring-medical-blue-500 transition-colors"
                  />
                  <span className="text-slate-500 group-hover:text-slate-700 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  title="Click here to reset your password"
                  className="font-semibold text-medical-blue-600 hover:text-medical-blue-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base gap-2 shadow-lg shadow-medical-blue-600/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-medical-blue-600 hover:text-medical-blue-700 transition-colors"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8 font-medium italic">
          &copy; {new Date().getFullYear()} PharmaPro. All rights reserved.
        </p>
      </div>
    </div>
  );
}
