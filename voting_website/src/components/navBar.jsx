"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const hideNavbarPaths = ["/login", "/voting", "/leaderboard"];
  if (hideNavbarPaths.includes(pathname)) {
    return null;
  }

  function linkClass(path) {
    const active = pathname === path;
    return `
      px-4 py-2 rounded-lg font-semibold text-sm sm:text-base
      border
      transition-all duration-200
      cursor-pointer
      select-none
      ${
        active
          ? `
            bg-black text-white border-white/40
            shadow-md shadow-black/40
          `
          : `
            bg-black/20 text-white border-white/20
            hover:bg-red-700 hover:border-white
            hover:shadow-md hover:shadow-red-900/30
            active:scale-[0.96]
          `
      }
    `;
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 bg-red-600 border-b border-red-700 shadow-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center hover:opacity-90 transition">
            <Image
              src="/itc.jpg"
              alt="Voting"
              width={180}
              height={60}
              priority
              className="h-10 sm:h-12 md:h-14 w-auto object-contain rounded-lg"
            />
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className={linkClass("/admin")}>
              Admin
            </Link>
            <Link href="/leaderboard" className={linkClass("/leaderboard")}>
              Leaderboard
            </Link>
            <Link href="/voting" className={linkClass("/voting")}>
              Voting
            </Link>
          </div>
          <div className="hidden md:block">
            <button
              onClick={logout}
              className="px-5 py-2 rounded-lg font-semibold bg-black text-white border border-white/30 shadow-md shadow-black/40 hover:bg-white hover:text-red-600 hover:border-white hover:shadow-lg hover:shadow-red-900/30 active:scale-[0.96] transition-all duration-200 cursor-pointer select-none"
            >
              Logout
            </button>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden px-4 py-2 rounded-lg bg-black/30 border border-white/30 shadow-md hover:bg-black/50 active:scale-[0.96] transition cursor-pointer"
          >
            <span className="text-white text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>
        {open && (
          <div className="md:hidden mt-4 space-y-2">
            <Link href="/admin" className={linkClass("/admin") + " block text-center"}>
              Admin Panel
            </Link>
            <Link href="/leaderboard" className={linkClass("/leaderboard") + " block text-center"}>
              Leaderboard
            </Link>
            <Link href="/voting" className={linkClass("/voting") + " block text-center"}>
              Voting
            </Link>
            <button
              onClick={logout}
              className="w-full px-5 py-2 rounded-lg font-semibold bg-black text-white border border-white/30 shadow-md shadow-black/40 hover:bg-white hover:text-red-600 hover:shadow-lg hover:shadow-red-900/30 active:scale-[0.96] transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
