import DashboardNavbar from "@/components/DashboardComponents/DashboardNavbar";
import ThemeToggle from "@/components/Tools/ThemeToggle";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CrossPost Hub. | Post Once, Share Everywhere!",
  description:
    "Effortlessly share content to Instagram, LinkedIn, Twitter, and more — all at once.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="relative">
      <DashboardNavbar />
      {children}
      <div className="fixed bottom-10 right-10 ">
        <ThemeToggle/>
      </div>
    </div>
  );
}
