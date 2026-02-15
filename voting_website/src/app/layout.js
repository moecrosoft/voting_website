// app/layout.js
"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/navBar";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login";

  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          min-h-screen bg-black text-white antialiased
        `}
      >
        <div className="min-h-screen flex flex-col">
          {!hideNavbar && <NavBar />}

          {/* Global responsive container for all pages */}
          <main className="flex-1 w-full">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          {/* Small bottom spacing so content doesn't feel tight on mobile */}
          <div className="h-8" />
        </div>
      </body>
    </html>
  );
}
