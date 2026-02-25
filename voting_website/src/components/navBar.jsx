'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  function linkClass() {
    return `
      px-4 py-2 rounded-lg font-semibold text-sm sm:text-base
      border
      transition-all duration-200
      cursor-pointer
      select-none
      bg-black/20 text-white border-white/20
      hover:bg-red-700 hover:border-white
      hover:shadow-md hover:shadow-red-900/30
      active:scale-[0.96]
    `;
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
              className="h-10 sm:h-12 md:h-14 w-auto object-contain rounded-lg"
            />
          </Link>

          {/* Centered buttons */}
          <div className="hidden md:flex items-center gap-3 justify-center flex-1">
            <Link href="/admin" className={linkClass()}>Admin</Link>
            <Link href="/leaderboard" className={linkClass()}>Leaderboard</Link>
            <Link href="/voting" className={linkClass()}>Voting</Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden px-4 py-2 rounded-lg bg-black/30 border border-white/30 shadow-md hover:bg-black/50 active:scale-[0.96] transition cursor-pointer"
          >
            <span className="text-white text-lg">{open ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-4 space-y-2 flex flex-col items-center">
            <Link href="/admin" className={linkClass() + " block text-center"}>Admin</Link>
            <Link href="/leaderboard" className={linkClass() + " block text-center"}>Leaderboard</Link>
            <Link href="/voting" className={linkClass() + " block text-center"}>Voting</Link>
          </div>
        )}
      </div>
    </nav>
  );
}