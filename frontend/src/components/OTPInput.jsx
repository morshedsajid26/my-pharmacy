import React, { useRef, useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const OTPInput = ({ length = 6, onComplete }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);
  const router = useRouter();

  // Auto focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    // Check if complete
    const combinedOtp = newOtp.join("");
    if (combinedOtp.length === length) {
      if (onComplete) {
        onComplete(combinedOtp);
      } else {
        // Fallback behavior if used as a standalone page route
        handleAutoVerify(combinedOtp);
      }
    }
  };

  const handleAutoVerify = async (val) => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsVerifying(false);
    if (val === "123456") {
      toast.success("OTP Verified Successfully!");
      router.push("/reset-password");
    } else {
      toast.error("Invalid OTP. Try 123456");
      setOtp(new Array(length).fill(""));
      inputRefs.current[0].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(data)) return;
    
    const pasteData = data.slice(0, length).split("");
    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus last filled or next empty
    const nextIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[nextIndex].focus();

    if (pasteData.length === length) {
      if (onComplete) onComplete(data.slice(0, length));
      else handleAutoVerify(data.slice(0, length));
    }
  };

  // If onComplete is NOT provided, we assume it's being used as a full page
  const isPage = !onComplete;

  const content = (
    <div className="flex flex-col items-center">
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            ref={(el) => (inputRefs.current[index] = el)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-2xl bg-white transition-all outline-none 
              ${digit ? 'border-medical-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-slate-200'} 
              focus:border-medical-blue-500 focus:ring-4 focus:ring-medical-blue-500/10 text-slate-900`}
          />
        ))}
      </div>
      {isVerifying && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-6 flex items-center gap-2 text-medical-blue-600 font-medium"
        >
          <Loader2 className="animate-spin w-5 h-5" />
          <span>Verifying code...</span>
        </motion.div>
      )}
    </div>
  );

  if (isPage) {
    return (
      <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-medical-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck className="text-medical-blue-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Code</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-[280px] mx-auto leading-relaxed">
            Please enter the 6-digit verification code sent to your device.
          </p>
        </div>

        {content}

        <div className="mt-10 space-y-4">
          <p className="text-center text-sm text-slate-500 font-medium">
            Didn't receive the code?{" "}
            <button className="text-medical-blue-600 font-bold hover:underline">Resend OTP</button>
          </p>
          <button 
            onClick={() => router.back()}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold"
          >
            <ArrowLeft size={16} />
            Back to previous step
          </button>
        </div>
      </div>
    );
  }

  return content;
};

export default OTPInput;
