"use client";

import { useState } from "react";
import LoginForm from "../login/page";
import LeaderboardUI from "./ui";

export default function LeaderboardPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return <LoginForm onSuccess={() => setLoggedIn(true)} />;

  return <LeaderboardUI />;
}