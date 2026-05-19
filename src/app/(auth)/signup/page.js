'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, PlusCircle } from "lucide-react";
import InputField from "@/components/InputField";
import Password from "@/components/Password";
import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/Button";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Pharmacist");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return alert("Passwords do not match!");
    }
    setIsSubmitting(true);
    try {
      const success = await signup(name, email, password, role);
      if (success) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Signup component error:", error);
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">S&S<span className="text-medical-blue-600">Pharmacy</span></h1>
          <p className="text-slate-500 text-sm mt-1">Smart Pharmacy Management System</p>
        </div>

        {/* Auth Card Content */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900">Create account</h2>
              <p className="text-sm text-slate-500 mt-1">Join PharmaPro and manage your pharmacy like a pro.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField 
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <InputField 
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Dropdown 
                label="Account Role"
                placeholder="Select Role"
                options={["Owner", "Pharmacist", "Staff"]}
                value={role}
                onSelect={(val) => setRole(val)}
                labelClass="text-slate-700 font-medium text-sm"
                inputClass="!border-slate-200 !text-slate-900"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Password 
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Password 
                  label="Confirm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

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
          &copy; {new Date().getFullYear()} PharmaPro Dashboard. All rights reserved.
        </p>
      </div>
    </div>
  );
}
