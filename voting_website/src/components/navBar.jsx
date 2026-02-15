// src/components/navBar.jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function linkClass(path) {
    const active = pathname === path;

    return `
      px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base
      transition-all duration-200 border border-white/20
      ${
        active
          ? "bg-black text-white shadow-md border-white/40"
          : "text-white/90 hover:bg-red-700 hover:text-white hover:border-white/40"
      }
    `;
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 bg-red-600/90 backdrop-blur border-b border-red-700/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/admin" className="font-bold tracking-wide text-white">
            Voting
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2 bg-red-700/30 px-2 py-2 rounded-xl shadow-inner border border-white/10">
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

          {/* Desktop logout */}
          <div className="hidden md:block">
            <button
              onClick={logout}
              className="
                px-4 py-2 rounded-lg font-semibold
                bg-black text-white border border-white/30
                hover:bg-white hover:text-red-600 hover:border-white
                transition-all duration-300 shadow-md
                hover:scale-[1.03]
              "
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden px-3 py-2 rounded-lg bg-red-700/40 border border-white/20"
            aria-label="Toggle menu"
          >
            <span className="text-white text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="md:hidden mt-3 bg-red-700/30 border border-white/20 rounded-xl p-2 space-y-2">
            <Link
              href="/admin"
              className={linkClass("/admin") + " block text-center"}
            >
              Admin Panel
            </Link>
            <Link
              href="/leaderboard"
              className={linkClass("/leaderboard") + " block text-center"}
            >
              Leaderboard
            </Link>
            <Link
              href="/voting"
              className={linkClass("/voting") + " block text-center"}
            >
              Voting
            </Link>

            <button
              onClick={logout}
              className="
                w-full mt-1
                px-4 py-2 rounded-lg font-semibold
                bg-black text-white border border-white/30
                hover:bg-white hover:text-red-600 hover:border-white
                transition-all duration-300 shadow-md
              "
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
