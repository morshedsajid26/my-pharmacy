import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export function usePasswordReset() {
  const sendOtpMutation = useMutation({
    mutationFn: async (email) => {
      const res = await api.post("/otp/forgot-password", { email });
      return res?.data || res;
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }) => {
      const res = await api.post("/otp/verify-otp", { email, otp });
      return res?.data || res;
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ email, token, newPassword }) => {
      const res = await api.post("/otp/reset-password", {
        email,
        token,
        newPassword,
      });
      return res?.data || res;
    },
  });

  return {
    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}

export default usePasswordReset;
