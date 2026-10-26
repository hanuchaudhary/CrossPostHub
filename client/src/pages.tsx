import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router";
import About from "@/components/landing/about";
import Features from "@/components/landing/features";
import Home from "@/components/landing/home";
import LandingFooter from "@/components/landing/landing_footer";
import Navbar from "@/components/landing/navbar";
import PricingSection from "@/components/landing/pricing_section";
import { WhoIsItFor } from "@/components/landing/who_is_it_for_section";
import SigninForm from "@/components/auth/signin_form";
import RegisterForm from "@/components/auth/register_form";
import { ConnectAccounts } from "@/components/dashboard/connect_accounts";
import { SecurityDisclaimerDialog } from "@/components/dashboard/security_disclaimer_dialog";
import { CreatePostForm } from "@/components/create/create_post_form";
import TransactionsPage from "@/components/payment/transactions_page";
import PaymentSuccessPage from "@/components/payment/payment_succes_page";
import PaymentFailedPage from "@/components/payment/payment_failed_page";
import { SSEditor } from "@/components/edit/ScreenshotEdit/ss_editor";
import CodeEditor from "@/components/edit/CodeEdit/code_editor";
import { GithubEditor } from "@/components/edit/GithubEdit/github_editor";
import ContactPage from "@/components/landing/FooterElems/contact_page";
import PrivacyPage from "@/components/landing/FooterElems/privacy_page";
import RefundCancellationPage from "@/components/landing/FooterElems/refund_cancellation_page";
import TermsPage from "@/components/landing/FooterElems/terms_page";
import DashboardNavbar from "@/components/dashboard/dashboard_navbar";
import PageLoader from "@/components/loaders/page_loader";
import { ThemeToggle } from "@/components/tools/theme_toggle";
import { EditorNavbar } from "@/components/edit/edit_navbar";
import { authClient } from "./lib/auth.client";

export function LandingPage() { return <div className="h-full px-3 pt-20 overflow-hidden dark:bg-black bg-neutral-100"><Navbar /><Home /><Features /><About /><WhoIsItFor /><PricingSection /><LandingFooter /></div>; }
export const SigninPage = () => <SigninForm />;
export const RegisterPage = () => <RegisterForm />;
export const DashboardPage = () => <div className="relative"><SecurityDisclaimerDialog /><ConnectAccounts /></div>;
export const CreatePage = () => <div className="max-w-6xl overflow-x-hidden mx-auto sm:px-6 lg:px-8 md:py-10 pb-6"><CreatePostForm /></div>;
export const UpgradePage = () => <PricingSection />;
export const Transactions = () => <TransactionsPage />;
export const PaymentSuccess = () => <PaymentSuccessPage />;
export const PaymentFailed = () => <PaymentFailedPage />;
export const ScreenshotEditor = () => <div className="h-full flex items-center justify-center"><SSEditor /></div>;
export const CodeEditorPage = () => <CodeEditor />;
export const GithubEditorPage = () => <GithubEditor />;
export const Contact = () => <ContactPage />;
export const Privacy = () => <PrivacyPage />;
export const RefundCancellation = () => <RefundCancellationPage />;
export const Terms = () => <TermsPage />;

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  if (isPending) return <PageLoader />;
  return data?.user ? children : <Navigate to="/signin" replace />;
}
export function MainLayout() { return <ProtectedRoute><div className="relative"><PageLoader /><DashboardNavbar /><Outlet /><div className="fixed bottom-6 right-6 md:block hidden"><ThemeToggle /></div></div></ProtectedRoute>; }
export function EditLayout() { return <ProtectedRoute><div className="p-3 w-full"><div className="inline-block mb-2"><EditorNavbar /></div><Outlet /></div></ProtectedRoute>; }
