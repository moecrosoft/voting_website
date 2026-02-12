import NavBar from "@/components/navBar";

export default function Voting() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto">
                <NavBar/>

                <h1 className="text-red-600 mb-8">Voting</h1>
                <p className="text-gray-600">Voting page content will be displayed here.</p>
            </div>
        </div>
    );
}
