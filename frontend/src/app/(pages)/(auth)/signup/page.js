'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, PlusCircle, CheckCircle } from "lucide-react";
import InputField from "@/components/InputField";
import Password from "@/components/Password";
import { Button } from "@/components/Button";
import { registerCustomerAction, checkCustomerExistsAction, sendVerificationEmailAction } from "@/lib/actions/online-customer.actions";
import toast from "react-hot-toast";
import OTPInput from "@/components/OTPInput";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    setIsSubmitting(true);
    
    try {
      // Check if number or email is already registered before generating OTP
      const check = await checkCustomerExistsAction(phone, email);
      if (check.exists) {
        setIsSubmitting(false);
        return toast.error(`${check.field === 'phone' ? 'Mobile number' : 'Email address'} is already registered!`);
      }

      // Generate OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      generatedOtpRef.current = code;
      
      // Send real email
      await sendVerificationEmailAction(email, code);
      
      setOtpStep(true);
      toast.success(`Verification code sent to your email!`, { duration: 6000 });
      // Keep showing it in dev so it's easy to test without opening email
      
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
      const result = await registerCustomerAction(name, phone, email, password);
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
    <div className="p-5">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 text-center">Create Customer Account</h2>
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

                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Phone"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />

                  <InputField 
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

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
                  <h3 className="font-bold text-slate-800">Verify your email</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    We've sent a 6-digit code to <br/>
                    <span className="font-bold text-slate-700">{email}</span>
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
                    Change email address
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-medical-blue-600 hover:text-medical-blue-700 transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
    </div>
  );
}
