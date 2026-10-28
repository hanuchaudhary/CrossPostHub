import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { RouteRoot } from "./components/route-root";
import RouteErrorPage from "./pages/errors/route-error";
const LandingPage = lazy(() => import("./pages/landing"));
const SigninPage = lazy(() => import("./pages/auth/signin"));
const RegisterPage = lazy(() => import("./pages/auth/register"));
const ForgotPage = lazy(() => import("./pages/auth/forgot"));
const VerifyPage = lazy(() => import("./pages/auth/verify"));
const ResetPage = lazy(() => import("./pages/auth/reset"));
const PrivacyPage = lazy(() => import("./pages/legal/privacy"));
const TermsPage = lazy(() => import("./pages/legal/terms"));
const ContactPage = lazy(() => import("./pages/contact"));
const DashboardPage = lazy(() => import("./pages/dashboard"));
const PostsPage = lazy(() => import("./pages/posts"));
const CreatePage = lazy(() => import("./pages/posts/create"));
const SchedulePage = lazy(() => import("./pages/posts/schedule"));
const ConnectionsPage = lazy(() => import("./pages/account/connections"));
const SettingsPage = lazy(() => import("./pages/account/settings"));
const ProfilePage = lazy(() => import("./pages/account/profile"));
const BillingPage = lazy(() => import("./pages/account/billing"));
const NotificationsPage = lazy(() => import("./pages/notifications"));
const NotFoundPage = lazy(() => import("./pages/errors/not-found"));
const ProtectedLayout = lazy(() =>
  import("./components/workspace/layout").then((module) => ({
    default: module.ProtectedLayout,
  })),
);
export const router = createBrowserRouter([
  {
    element: <RouteRoot />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/signin", element: <SigninPage /> },
      { path: "/sign-in", element: <Navigate to="/signin" replace /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPage /> },
      { path: "/verify", element: <VerifyPage /> },
      { path: "/verify-email", element: <VerifyPage /> },
      { path: "/reset-password", element: <ResetPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/contact", element: <ContactPage /> },
      {
        element: <ProtectedLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/posts", element: <PostsPage /> },
          { path: "/create", element: <CreatePage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/connections", element: <ConnectionsPage /> },
          { path: "/setting", element: <Navigate to="/settings" replace /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/billing", element: <BillingPage /> },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
