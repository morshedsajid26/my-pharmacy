'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, PlusCircle, CheckCircle } from "lucide-react";
import InputField from "@/components/InputField";
import Password from "@/components/Password";
import { Button } from "@/components/Button";
import { registerCustomerAction, checkCustomerExistsAction } from "@/lib/actions/online-customer.actions";
import toast from "react-hot-toast";
import OTPInput from "@/components/OTPInput";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  
  // Use a ref for generated OTP to absolutely prevent stale closures
  const generatedOtpRef = useRef("");
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!/^01[3-9]\d{8}$/.test(phone)) {
      return toast.error("Please enter a valid 11-digit mobile number (starts with 01)");
    }

    setIsSubmitting(true);
    
    try {
      // Check if number is already registered before generating OTP
      const isExisting = await checkCustomerExistsAction(phone);
      if (isExisting) {
        setIsSubmitting(false);
        return toast.error("Mobile number is already registered!");
      }

      // Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      generatedOtpRef.current = code;
      setOtpStep(true);
      toast.success(`🔑 Verification OTP Sent! Code: ${code}`, { duration: 12000 });
    } catch (error) { 
      toast.error(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPComplete = async (enteredOtp) => {
    console.log("Entered OTP:", enteredOtp, "Expected:", generatedOtpRef.current);
    if (enteredOtp !== generatedOtpRef.current) {
      toast.error("Invalid OTP! Try the code displayed in the toast.");
      return;
    }

    setOtpVerifying(true);
    try {
      const result = await registerCustomerAction(name, phone, password);
      console.log("Registration result:", result);
      if (result.success) {
        toast.success(`Welcome, ${result.customer.name}! Account registered successfully.`);
        router.push("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setOtpVerifying(false);
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">S&S<span className="text-medical-blue-600">Pharmacy</span></h1>
          <p className="text-slate-500 text-sm mt-1">Smart Pharmacy Management System</p>
        </div>

        {/* Auth Card Content */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900">Create customer account</h2>
              <p className="text-sm text-slate-500 mt-1">Join PharmaPro and manage your medicines like a pro.</p>
            </div>

            {!otpStep ? (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <InputField 
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <InputField 
                  label="Phone Number"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <Password 
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex items-start gap-2 pt-2 cursor-pointer group">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded border-slate-300 text-medical-blue-600 focus:ring-medical-blue-500 transition-colors" required />
                  <span className="text-xs text-slate-500 leading-relaxed font-medium">
                    I agree to the <a href="#" className="font-bold text-medical-blue-600">Terms of Service</a> and <a href="#" className="font-bold text-medical-blue-600">Privacy Policy</a>.
                  </span>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base gap-2 shadow-lg shadow-medical-blue-600/20 mt-4" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <div className="text-center bg-medical-blue-50 rounded-2xl p-4 border border-medical-blue-100">
                  <div className="w-12 h-12 bg-medical-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-medical-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800">Verify your number</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    We've sent a 6-digit code to <br/>
                    <span className="font-bold text-slate-700">{phone}</span>
                  </p>
                </div>
                
                <OTPInput 
                  length={6} 
                  onComplete={handleOTPComplete}
                  disabled={otpVerifying} 
                />

                <div className="flex justify-center">
                  {otpVerifying && (
                    <div className="flex items-center gap-2 text-medical-blue-600 text-sm font-medium">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying code...
                    </div>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => setOtpStep(false)}
                    className="text-sm text-slate-400 hover:text-medical-blue-600 transition-colors underline"
                  >
                    Change phone number
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-medical-blue-600 hover:text-medical-blue-700 transition-colors">
                  Sign In
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
