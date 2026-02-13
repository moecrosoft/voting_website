"use client";

import { useActionState } from "react";
import { handleLogin } from "./actions";

export default function LoginPage() {
  const [state, formAction] = useActionState(handleLogin, { error: "" });

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="border p-6 rounded w-80">
        <h1 className="text-red-600 mb-4 text-xl">Admin Login</h1>

        <form action={formAction} className="grid gap-3">
          <input name="username" placeholder="Username" required className="border p-2 rounded" />
          <input name="password" type="password" placeholder="Password" required className="border p-2 rounded" />
          <button type="submit" className="bg-red-600 text-white py-2 rounded cursor-pointer">
            Login
          </button>
        </form>

        {state?.error && <div className="text-red-600 mt-3">{state.error}</div>}
      </div>
    </main>
  );
}
