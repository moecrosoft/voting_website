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
    <html lang="en" className="bg-black">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          min-h-screen bg-black text-white antialiased
        `}
      >
        {/* Full page wrapper */}
        <div className="min-h-screen flex flex-col bg-black">

          {/* Navbar */}
          {!hideNavbar && (
            <div className="bg-black border-b border-zinc-800">
              <NavBar />
            </div>
          )}

          {/* Main content */}
          <main className="flex-1 w-full bg-black">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>

          {/* Bottom spacing */}
          <footer className="h-8 bg-black" />

        </div>
      </body>
    </html>
  );
}
