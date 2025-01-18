import Navbar from "@/components/LandingComponents/Navbar";
import { ReactNode } from "react";


export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="relative">
      <Navbar />
      {children}
    </div>
  );
}
