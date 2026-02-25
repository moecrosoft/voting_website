"use client";

import { useState } from "react";
import LoginForm from "../login/page";
import AdminClient from "./ui";
import NavBar from '@/components/navBar';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return <LoginForm onSuccess={()=>setLoggedIn(true)} />;

  return (
    <>
      <NavBar/>
      <AdminClient />
    </>
  );
}