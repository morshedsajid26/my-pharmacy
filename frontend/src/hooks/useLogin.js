'use client';

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

/**
 * Custom hook to handle user/customer login API integration, state, and routing.
 */
export function useLogin() {
  const { login: authLogin, user, customer } = useAuth();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      let identifier = "";
      let password = "";

      if (typeof credentials === "object" && credentials !== null) {
        identifier = credentials.identifier || credentials.email || credentials.phone || "";
        password = credentials.password || "";
      }

      const trimmedIdentifier = String(identifier || "").trim();
      if (!trimmedIdentifier || !password) {
        throw new Error("Please enter your email/phone and password");
      }

      const result = await authLogin(trimmedIdentifier, password);
      if (!result?.success) {
        throw new Error(result?.error || "Invalid email/phone or password");
      }

      return result;
    },
    onSuccess: (result) => {
      toast.success("Login successful! Redirecting...", { id: "auth-toast" });
      setTimeout(() => {
        if (result.role === "customer") {
          router.replace("/overview");
        } else {
          router.replace("/dashboard");
        }
      }, 600);
    },
    onError: (error) => {
      const errorMsg = error?.message || "Invalid email/phone or password";
      toast.error(errorMsg, { id: "auth-toast" });
    },
  });

  // Automatically redirect if already authenticated upon initial visit
  useEffect(() => {
    if (!loginMutation.isPending) {
      if (user) {
        router.replace("/dashboard");
      } else if (customer) {
        router.replace("/overview");
      }
    }
  }, [user, customer, loginMutation.isPending, router]);

  const isAuthenticated = !loginMutation.isPending && (!!user || !!customer);

  return {
    login: loginMutation.mutateAsync,
    isSubmitting: loginMutation.isPending,
    isPending: loginMutation.isPending,
    isAuthenticated,
    user,
    customer,
    error: loginMutation.error,
    reset: loginMutation.reset,
  };
}

export default useLogin;

