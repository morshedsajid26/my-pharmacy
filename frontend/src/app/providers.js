'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { UIProvider } from "@/context/UIContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <UIProvider>
            <Toaster
              position="top-center"
              reverseOrder={false}
              containerStyle={{
                zIndex: 999999,
              }}
              toastOptions={{
                duration: 3500,
                style: {
                  background: "#0f172a",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                  borderRadius: "10px",
                  padding: "12px 18px",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                  zIndex: 999999,
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#ffffff",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
            <CartDrawer />
            {children}
          </UIProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
