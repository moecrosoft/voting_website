import Link from "next/link";

export default function NavBar() {
    return (
        <nav className="sticky top-0 z-50 bg-red-600 text-white shadow-md w-full">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-center space-x-8 py-4">
                    <Link href="/adminPanel" className="px-4 py-2 rounded transition-colors hover:bg-red-700">
                        Admin Panel
                    </Link>
                    <Link href="/Results" className="px-4 py-2 rounded transition-colors hover:bg-red-700">
                        Results
                    </Link>
                    <Link href="/Voting" className="px-4 py-2 rounded transition-colors hover:bg-red-700">
                        Voting
                    </Link>
                </div>
            </div>
        </nav>
  );
}
