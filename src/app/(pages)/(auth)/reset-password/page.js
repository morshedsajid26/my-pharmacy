"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, Loader2, ArrowLeft, PlusCircle } from "lucide-react";
import Password from "@/components/Password";
import { Button } from "@/components/Button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { resetPasswordAction } from "@/lib/actions/auth.actions";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
    if (!email || !token) {
      toast.error("Invalid password reset session. Please request a new OTP.");
      router.replace("/forgot-password");
    }
  }, [user, email, token, router]);

  if (user || !email || !token) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      return toast.error("Please enter a new password");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    setIsSubmitting(true);
    try {
      const result = await resetPasswordAction(email, token, password);
      if (result.success) {
        toast.success("Password reset successful!");
        router.push("/login");
      }
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
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
              <h2 className="text-2xl font-bold text-slate-900">
                Reset Password
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Please enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Password
                label="New Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Password
                label="Confirm New Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full h-12 text-base gap-2 shadow-lg shadow-medical-blue-600/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-medical-blue-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8 font-medium italic">
          &copy; {new Date().getFullYear()} PharmaPro Dashboard. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
