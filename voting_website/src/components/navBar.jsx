"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const pathname = usePathname();

    function linkClass(path) {
        return `px-4 py-2 rounded transition-colors ${
            pathname === path
                ? "bg-red-800"
                : "hover:bg-red-700"
        }`;
    }

    return (
        <nav className="sticky top-0 z-50 bg-red-600 text-white shadow-md w-full">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center space-x-8 py-4">

                    <Link href="/admin" className={linkClass("/admin")}>
                        Admin Panel
                    </Link>

                    <Link href="/leaderboard" className={linkClass("/leaderboard")}>
                        Leaderboard
                    </Link>

                    <Link href="/voting" className={linkClass("/voting")}>
                        Voting
                    </Link>

                </div>
            </div>
        </nav>
    );
}