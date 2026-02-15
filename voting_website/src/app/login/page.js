"use client";

import { useActionState } from "react";
import { handleLogin } from "./actions";

export default function LoginPage() {

  const [state, formAction] = useActionState(handleLogin, { error: "" });

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">

      {/* Login Card */}
      <div className="
        w-full max-w-md
        bg-zinc-900
        border border-zinc-800
        rounded-2xl
        shadow-2xl
        p-8
      ">

        {/* Title */}
        <div className="mb-6 text-center">

          <h1 className="text-3xl font-bold text-red-500 mb-2">
            Admin Login
          </h1>

        </div>


        {/* Form */}
        <form action={formAction} className="space-y-4">

          <input
            name="username"
            placeholder="Username"
            required
            className="
              w-full
              p-3
              rounded-lg
              bg-zinc-800
              border border-zinc-700
              text-white
              placeholder-gray-400
              focus:outline-none
              focus:border-red-500
              transition
            "
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="
              w-full
              p-3
              rounded-lg
              bg-zinc-800
              border border-zinc-700
              text-white
              placeholder-gray-400
              focus:outline-none
              focus:border-red-500
              transition
            "
          />

          <button
            type="submit"
            className="
              w-full
              py-3
              rounded-lg
              bg-red-600
              hover:bg-red-700
              active:scale-[0.98]
              text-white
              font-semibold
              text-lg
              transition
              shadow-lg
              cursor-pointer
            "
          >
            Login
          </button>

        </form>


        {/* Error */}
        {state?.error && (
          <div className="
            mt-4
            bg-red-900/40
            border border-red-500
            text-red-400
            px-4 py-2
            rounded-lg
            text-sm
            text-center
          ">
            {state.error}
          </div>
        )}

      </div>

    </main>
  );
}
