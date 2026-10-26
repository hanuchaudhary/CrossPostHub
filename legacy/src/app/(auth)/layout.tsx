import AuthGradient from "@/components/AuthComponents/AuthGradeint";
import Navbar from "@/components/LandingComponents/Navbar";
import { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="relative pt-20 h-screen bg-background overflow-hidden">
      <Navbar />
      {children}
      <AuthGradient />
    </div>
  );
}
