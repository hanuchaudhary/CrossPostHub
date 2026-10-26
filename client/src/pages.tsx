import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import About from "@/components/LandingComponents/About";
import Features from "@/components/LandingComponents/Features";
import Home from "@/components/LandingComponents/Home";
import LandingFooter from "@/components/LandingComponents/LandingFooter";
import Navbar from "@/components/LandingComponents/Navbar";
import PricingSection from "@/components/LandingComponents/PricingSection";
import { WhoIsItFor } from "@/components/LandingComponents/WhoIsItForSection";
import SigninForm from "@/components/AuthComponents/SigninForm";
import RegisterForm from "@/components/AuthComponents/RegisterForm";
import { ConnectAccounts } from "@/components/DashboardComponents/ConnectAccounts";
import { SecurityDisclaimerDialog } from "@/components/DashboardComponents/SecurityDisclaimerDialog";
import { CreatePostForm } from "@/components/CreatePost/CreatePostForm";
import TransactionsPage from "@/components/PaymentComponents/TransactionsPage";
import PaymentSuccessPage from "@/components/PaymentComponents/PaymentSuccesPage";
import PaymentFailedPage from "@/components/PaymentComponents/PaymentFailedPage";
import { SSEditor } from "@/components/EditComponents/ScreenshotEdit/SSEditor";
import CodeEditor from "@/components/EditComponents/CodeEdit/CodeEditor";
import { GithubEditor } from "@/components/EditComponents/GithubEdit/GithubEditor";
import ContactPage from "@/components/LandingComponents/FooterElems/ContactPage";
import PrivacyPage from "@/components/LandingComponents/FooterElems/PrivacyPage";
import RefundCancellationPage from "@/components/LandingComponents/FooterElems/RefundCancellationPage";
import TermsPage from "@/components/LandingComponents/FooterElems/TermsPage";
import DashboardNavbar from "@/components/DashboardComponents/DashboardNavbar";
import PageLoader from "@/components/Loaders/PageLoader";
import { ThemeToggle } from "@/components/Tools/ThemeToggle";
import { EditorNavbar } from "@/components/EditComponents/EditNavbar";
import { useSession } from "@/lib/auth-client";

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
  const { data, status } = useSession();
  if (status === "loading") return <PageLoader />;
  return data?.user ? children : <Navigate to="/signin" replace />;
}
export function MainLayout() { return <ProtectedRoute><div className="relative"><PageLoader /><DashboardNavbar /><Outlet /><div className="fixed bottom-6 right-6 md:block hidden"><ThemeToggle /></div></div></ProtectedRoute>; }
export function EditLayout() { return <ProtectedRoute><div className="p-3 w-full"><div className="inline-block mb-2"><EditorNavbar /></div><Outlet /></div></ProtectedRoute>; }
