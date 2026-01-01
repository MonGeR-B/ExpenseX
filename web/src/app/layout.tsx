// web/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";

export const metadata: Metadata = {
  title: "ExpenseX Dashboard",
  description: "Personal-first expense tracker",
  icons: {
    icon: "/globe.svg",
  },
};

import { Toaster } from 'sonner';

import { Outfit } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`h-screen overflow-hidden bg-black text-white ${outfit.className}`} suppressHydrationWarning>
        {children}
        <Toaster theme="dark" position="top-center" />
        <Analytics />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-N6HJF7JF90"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-N6HJF7JF90');
          `}
        </Script>
      </body>
    </html>
  );
}


