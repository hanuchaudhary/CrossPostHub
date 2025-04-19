import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";
import AuthProvider from "@/components/AuthComponents/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import RenewalPrompt from "@/components/PaymentComponents/RenewalPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrosspostHub | Post Once, Share Everywhere!",
  description:
    "Effortlessly share content to Instagram, LinkedIn, Twitter, and more — all at once.",
  icons: [
    {
      rel: "icon",
      sizes: "32x32",
      url: "/logo.svg",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-emerald-950 selection:text-emerald-400`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <RenewalPrompt/>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
