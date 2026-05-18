"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  KeyRound,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import InputField from "@/components/InputField";
import OTPInput from "@/components/OTPInput";
import { Button } from "@/components/Button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { sendResetOtpAction } from "@/lib/actions/auth.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendResetOtpAction(email);
      if (result.success) {
        toast.success("OTP sent to your email!");
        router.push(
          `/forgot-password/verify?email=${encodeURIComponent(email)}`,
        );
      }
    } catch (error) {
      toast.error(error.message || "Email is not registered");
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
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="p-8">
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-medical-blue-600 transition-colors mb-4 group"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Back to Sign In
              </Link>
              <div className="w-12 h-12 bg-medical-blue-50 rounded-xl flex items-center justify-center mb-6">
                <KeyRound className="text-medical-blue-600 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                Forgot password?
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter your email and we'll send you a 6-digit verification code.
              </p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
              <InputField
                label="Email Address"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                    <Send className="w-4 h-4" />
                    <span>Send OTP Code</span>
                  </>
                )}
              </Button>
            </form>
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
