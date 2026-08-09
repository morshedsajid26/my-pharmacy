'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Loader2, PlusCircle } from "lucide-react";
import OTPInput from "@/components/OTPInput";
import { Button } from "@/components/Button";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { sendResetOtpAction, verifyResetOtpAction } from "@/lib/actions/auth.actions";

export default function VerifyOTPPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
    if (!email) {
      toast.error("Invalid access. Please enter your email first.");
      router.replace("/forgot-password");
    }
  }, [user, email, router]);

  const handleSendOTP = async () => {
    setIsSubmitting(true);
    try {
      const result = await sendResetOtpAction(email);
      if (result.success) {
        toast.success("OTP resent to your email!");
      }
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setIsSubmitting(true);
    try {
      const result = await verifyResetOtpAction(email, otp);
      if (result.success) {
        toast.success("Identity verified!");
        // Route to reset-password passing verified email and token
        router.push(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.resetToken)}`);
      }
    } catch (error) {
      toast.error(error.message || "Invalid or expired OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user || !email) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-medical-blue-600 flex items-center justify-center shadow-lg shadow-medical-blue-200 mb-4 animate-in zoom-in-50 duration-500">
            <PlusCircle className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">S&S<span className="text-medical-blue-600">Pharmacy</span></h1>
          <p className="text-slate-500 text-sm mt-1">Smart Pharmacy Management System</p>
        </div>

        {/* Auth Card Content */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="p-8">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-medical-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="text-medical-blue-600 w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Verify Identity</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                We've sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span>. 
                Enter it below to continue.
              </p>
            </div>

            <div className="space-y-8">
              <OTPInput onComplete={handleVerifyOTP} />
              
              <div className="space-y-4">
                <Button 
                    variant="outline" 
                    className="w-full h-12" 
                    onClick={() => router.push("/forgot-password")}
                    disabled={isSubmitting}
                >
                    Change Email
                </Button>
                <p className="text-center text-sm text-slate-500">
                    Didn't get the code?{" "}
                    <button 
                      onClick={handleSendOTP}
                      className="font-bold text-medical-blue-600 hover:text-medical-blue-700 transition-colors"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Resend"}
                    </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs mt-8 font-medium italic">
          &copy; {new Date().getFullYear()} PharmaPro Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
