import { Navigate, createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { AuthLayout } from "../layouts/AuthLayout";
import { Dashboard } from "../pages/Dashboard";
import { Medicines } from "../pages/Medicines";
import { Sales } from "../pages/Sales";
import { Purchases } from "../pages/Purchases";
import { LowStock } from "../pages/LowStock";
import { Reports } from "../pages/Reports";
import { Login } from "../pages/Login";
import { Signup } from "../pages/Signup";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ResetPassword } from "../pages/ResetPassword";
import { ProtectedRoute } from "./ProtectedRoute";
import OTPInput from "../components/OTPInput";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verify-otp",
        element: <OTPInput/>,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    element: (
   
        <MainLayout />

    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "medicines",
        element: <Medicines />,
      },
      {
        path: "sales",
        element: <Sales />,
      },
      {
        path: "purchases",
        element: <Purchases />,
      },
      {
        path: "low-stock",
        element: <LowStock />,
      },
      {
        path: "reports",
        element: <Reports />,
      },
    ],
  },
]);

export default router;
