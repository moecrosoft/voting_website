"use client";

import { useState } from "react";

export default function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      onSuccess();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleLogin}
        className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 space-y-6 shadow-lg w-96"
      >
        <h1 className="text-3xl font-bold text-red-500 text-center">Login</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label className="text-sm text-gray-300">Username</label>
          <input
            type="text"
            className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">Password</label>
          <input
            type="password"
            className="w-full mt-1 px-3 py-2 rounded-xl bg-black border border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="w-full bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl font-semibold cursor-pointer transition">
          Login
        </button>
      </form>
    </main>
  );
}