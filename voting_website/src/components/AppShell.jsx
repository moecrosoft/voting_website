"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/navBar";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  // ✅ Login page: full-screen, no padding, no footer, no navbar, no scroll
  if (isLogin) {
    return (
      <div className="fixed inset-0 bg-black overflow-hidden">
        {children}
      </div>
    );
  }

  // ✅ Normal pages: navbar + container + footer
  return (
    <div className="min-h-[100dvh] flex flex-col bg-black">
      <div className="bg-black border-b border-zinc-800">
        <NavBar />
      </div>

      <main className="flex-1 w-full bg-black">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      <footer className="h-8 bg-black" />
    </div>
  );
}
