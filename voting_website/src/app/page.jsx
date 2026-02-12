'use client'
import { handleLogin } from "./login";

export default function Home() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-red-600 mb-2">Login</h1>
                    <p className="text-gray-600">Enter your credentials to continue</p>
                </div>
          
                <form action={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                          name="username"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-500"
                          placeholder="Enter your username"
                          required
                        />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        name="password"
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-500"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Login
                    </button>
                </form>
            </div>
        </div>
    );
}
