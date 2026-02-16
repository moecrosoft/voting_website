"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function handleLogin(prevState, formData) {
  const username = (formData.get("username")?.toString() ?? "").trim();
  const password = (formData.get("password")?.toString() ?? "").trim();

  const envUser = (process.env.ADMIN_USERNAME ?? "").trim();
  const envHash = (process.env.ADMIN_PASSWORD ?? "").trim().replace(/\r/g, "");

  if (!envUser || !envHash) return { error: "Missing env vars" };

  const isUsernameValid = username === envUser;
  const isPasswordValid = await bcrypt.compare(password, envHash);

  if (!isUsernameValid || !isPasswordValid) {
    return { error: "Invalid credentials" };
  }

  const cookieStore = await cookies();

  cookieStore.set("session", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    maxAge: 3600 * 24,
    path: "/",
  });

  redirect("/admin");
}
