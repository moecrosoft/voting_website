"use client";

import { supabaseBrowser } from "@/lib/supabase-browser";

let subscription = null;
let listeners = [];

export function subscribeProjects() {
  if (subscription) return; // already subscribed

  const supabase = supabaseBrowser();

  subscription = supabase
    .channel("projects-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "projects" },
      (payload) => {
        listeners.forEach((cb) => cb(payload));
      }
    )
    .subscribe();

  return subscription;
}

export function onProjectsUpdate(cb) {
  if (!subscription) subscribeProjects();
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
