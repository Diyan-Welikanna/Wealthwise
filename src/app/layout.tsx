import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import PWARegister from "@/components/PWARegister";
import NotificationPermission from "@/components/NotificationPermission";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WealthWise - Your Intelligent Finance Companion",
  description: "Personal finance management made simple with WealthWise",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WealthWise",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={`${inter.variable} font-inter antialiased h-full bg-gray-50 transition-colors`}>
        <ErrorBoundary>
          <Providers>
            <PWARegister />
            <NotificationPermission />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
