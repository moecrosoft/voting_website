"use client";

import { useState } from "react";
import LoginForm from "../login/page";
import VotingUI from "./ui";

export default function VotingPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn)
    return <LoginForm onSuccess={() => setLoggedIn(true)} />;

  return <VotingUI />;
}