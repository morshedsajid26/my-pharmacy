import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UIProvider } from "./context/UIContext";
import { AuthProvider } from "./context/AuthContext";
import router from "./routes/router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <RouterProvider router={router} />
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
