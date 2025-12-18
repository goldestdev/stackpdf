
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#0f1115",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "StackPDF - Your Personal PDF Toolbox",
  description: "Secure, local, and powerful PDF tools.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

import { HistoryProvider } from "@/context/HistoryContext";
import HistorySidebar from "@/components/HistorySidebar";
import GlobalInit from "@/components/GlobalInit";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontClass = inter?.className || 'font-sans';
  return (
    <html lang="en">
      <body className={`${fontClass} min-h-screen flex flex-col`}>
        <GlobalInit />
        <HistoryProvider>
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <HistorySidebar />
        </HistoryProvider>
      </body>
    </html>
  );
}
