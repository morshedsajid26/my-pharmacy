import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./layouts/MainLayout";
import { AuthLayout } from "./layouts/AuthLayout";
import { UIProvider } from "./context/UIContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { Medicines } from "./pages/Medicines";
import { Sales } from "./pages/Sales";
import { Purchases } from "./pages/Purchases";
import { LowStock } from "./pages/LowStock";
import { Reports } from "./pages/Reports";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UIProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Router>
            <Routes>
              {/* Auth Routes */}
              <Route path="/" element={<AuthLayout />}>
                <Route path="/" element={<Login />} />
                <Route path="signup" element={<Signup />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route element={
                // <ProtectedRoute>
                  <MainLayout />
                /* </ProtectedRoute> */
              }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/medicines" element={<Medicines />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/low-stock" element={<LowStock />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Routes>
          </Router>
        </UIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
