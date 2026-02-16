"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/navBar";

export default function NavBarWrapper() {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login";

  if (hideNavbar) return null;

  return (
    <div className="bg-black border-b border-zinc-800">
      <NavBar />
    </div>
  );
}
