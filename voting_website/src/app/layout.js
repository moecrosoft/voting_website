// app/layout.js
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import NavBarWrapper from "@/components/NavBarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SIM ITC",
  icons: {
    icon: "/itc2.png", 
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-black">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          min-h-[100dvh] bg-black text-white antialiased
          overflow-x-hidden
        `}
      >
        <div className="min-h-[100dvh] flex flex-col bg-black">
          <NavBarWrapper />

          <main className="flex-1 w-full bg-black">
            <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>

          <footer className="h-8 bg-black" />
        </div>
      </body>
    </html>
  );
}
