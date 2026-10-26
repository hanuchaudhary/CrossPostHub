import { Route, Routes } from "react-router";
import { Toaster } from "sonner";
import {
  CodeEditorPage, Contact, CreatePage, DashboardPage, EditLayout,
  GithubEditorPage, LandingPage, MainLayout, PaymentFailed, PaymentSuccess,
  Privacy, RefundCancellation, RegisterPage, ScreenshotEditor, SigninPage,
  Terms, Transactions, UpgradePage,
} from "./pages";
import { ThemeProvider } from "./components/theme_provider";

export default function App() {
  return <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund-cancellation" element={<RefundCancellation />} />
      <Route path="/terms" element={<Terms />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="/payment/transactions" element={<Transactions />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
      </Route>
      <Route path="/edit" element={<EditLayout />}>
        <Route index element={<ScreenshotEditor />} />
        <Route path="code" element={<CodeEditorPage />} />
        <Route path="github" element={<GithubEditorPage />} />
      </Route>
      <Route path="*" element={<LandingPage />} />
    </Routes>
    <Toaster richColors position="top-right" />
  </ThemeProvider>
}
