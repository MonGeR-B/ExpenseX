// web/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

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
      <body className={`min-h-screen bg-black text-white ${outfit.className}`} suppressHydrationWarning>
        {children}
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
