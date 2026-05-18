import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Loader2 } from "lucide-react";
import InputField from "../components/InputField";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import Password from "../components/Password";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      // Error is already handled in AuthContext toast, but we catch it here to prevent crash
      console.error("Login component error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900">Welcome back!</h2>
        <p className="text-sm text-slate-500 mt-1">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField 
          label="Email Address"
          type="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-medical-blue-600 focus:ring-medical-blue-500 transition-colors" />
            <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
          </label>
          <Link to="/forgot-password" title="Click here to reset your password" className="font-semibold text-medical-blue-600 hover:text-medical-blue-700 transition-colors">Forgot password?</Link>
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
          <Link to="/signup" className="font-bold text-medical-blue-600 hover:text-medical-blue-700 transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
