"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function VotingPage() {
  const supabase = supabaseBrowser(); 
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setProjects(data || []);
  }

  useEffect(() => {
    load();

    const ch = supabase
      .channel("projects-voting-ws")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload) => {
          console.log("WS event (voting):", payload.eventType, payload);
          load();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status (voting):", status);
      });

    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 3) return prev;
        next.add(id);
      }

      return next;
    });
  }

  async function submitVotes() {
    const ids = Array.from(selected);
    if (ids.length < 1 || ids.length > 3) return alert("Pick 1 to 3.");

    setLoading(true);

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectIds: ids }),
    });

    let json = {};
    try {
      json = await res.json();
    } catch {
      json = {};
    }

    setLoading(false);

    if (!res.ok) return alert(json.error || "Vote failed");

    setSelected(new Set());
    await load();
  }

  return (
    <main className="p-6">
      <h1 className="text-red-600 mb-2">Voting</h1>
      <p className="mb-4">Selected: {selected.size}/3</p>

      <button
        onClick={submitVotes}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded mb-4 cursor-pointer disabled:opacity-60"
      >
        {loading ? "Submitting..." : "Submit Votes"}
      </button>

      <div className="grid gap-4">
        {projects.map((p) => {
          const isSelected = selected.has(p.id);

          return (
            <div
              key={p.id}
              className={`border p-4 rounded ${
                isSelected ? "ring-2 ring-red-500" : ""
              }`}
            >
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt=""
                  className="max-w-xs mb-2 rounded"
                />
              ) : null}

              <div className="text-sm text-gray-600">{p.group}</div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="my-2">{p.description}</p>

              <div>
                Votes: <b>{p.vote_count}</b>
              </div>

              <button
                onClick={() => toggle(p.id)}
                className="mt-2 border px-3 py-1 rounded cursor-pointer"
              >
                {isSelected ? "Selected" : "Select"}
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
