// app/layout.js
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";

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
    icon: "/itc.png",
    apple: '/itc.png'
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-black">
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          bg-black text-white antialiased
          overflow-x-hidden
        `}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
