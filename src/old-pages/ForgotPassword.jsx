import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import InputField from "../components/InputField";
import OTPInput from "../components/OTPInput";
import { Button } from "../components/Button";
import toast from "react-hot-toast";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(2);
    toast.success("OTP sent to your email!");
  };

  const handleVerifyOTP = async (otp) => {
    setIsSubmitting(true);
    // Mock Verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    
    if (otp === "123456") { // Mock success
      toast.success("Identity verified!");
      navigate("/reset-password");
    } else {
      toast.error("Invalid OTP. Try 123456");
    }
  };

  if (step === 2) {
    return (
      <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-500">
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
                onClick={() => setStep(1)}
                disabled={isSubmitting}
             >
                Change Email
             </Button>
             <p className="text-center text-sm text-slate-500">
                Didn't get the code?{" "}
                <button 
                  onClick={handleSendOTP}
                  className="font-bold text-medical-blue-600 hover:text-medical-blue-700 transition-colors"
                >
                  Resend
                </button>
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-medical-blue-600 transition-colors mb-4 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Sign In
        </Link>
        <div className="w-12 h-12 bg-medical-blue-50 rounded-xl flex items-center justify-center mb-6">
           <KeyRound className="text-medical-blue-600 w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Forgot password?</h2>
        <p className="text-sm text-slate-500 mt-1">Enter your email and we'll send you a 6-digit verification code.</p>
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
  );
}
