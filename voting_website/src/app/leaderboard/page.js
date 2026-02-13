"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function LeaderboardPage() {
  const supabaseRef = useRef(null);
  const [projects, setProjects] = useState([]);

  async function load() {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
      alert(error.message);
      return;
    }

    // Sort: vote_count desc, then created_at desc (newer first)
    const sorted = [...(data || [])].sort((a, b) => {
      const va = Number(a.vote_count ?? 0);
      const vb = Number(b.vote_count ?? 0);
      if (vb !== va) return vb - va;

      const ta = new Date(a.created_at ?? 0).getTime();
      const tb = new Date(b.created_at ?? 0).getTime();
      return tb - ta;
    });

    setProjects(sorted);
  }

  useEffect(() => {
    // create/reuse singleton client once
    supabaseRef.current = supabaseBrowser();
    const supabase = supabaseRef.current;

    // initial load
    load();

    // subscribe once
    const ch = supabase
      .channel("projects-leaderboard-ws")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects" },
        (payload) => {
          console.log("WS event (leaderboard):", payload.eventType, payload);
          load();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status (leaderboard):", status);
      });

    // keep UI correct if tab goes idle/sleeps
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      supabase.removeChannel(ch);
    };
    // IMPORTANT: keep [] constant; if you changed deps during hot reload, hard refresh page
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-red-600 mb-4">Leaderboard</h1>

      <div className="grid gap-2">
        {projects.map((p, i) => (
          <div
            key={p.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <span>
              #{i + 1} Group {p.group} — {p.title}
            </span>
            <b>{p.vote_count}</b>
          </div>
        ))}
      </div>
    </main>
  );
}
