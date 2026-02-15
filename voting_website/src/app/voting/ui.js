"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function VotingPage() {
  const supabaseRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  async function load() {
    const supabase = supabaseRef.current;
    if (!supabase) return;

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
    supabaseRef.current = supabaseBrowser();
    const supabase = supabaseRef.current;

    load();

    const ch = supabase
      .channel("projects-voting-ws")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects" },
        () => load()
      )
      .subscribe();

    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      supabase.removeChannel(ch);
    };
  }, []);

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (next.size >= 3) return prev;
        next.add(id);
      }
      return next;
    });
  }

  async function submitVotes() {
    const ids = Array.from(selected);
    if (ids.length < 1 || ids.length > 3) return;

    setLoading(true);

    const res = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectIds: ids }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Vote failed");
      return;
    }

    setSelected(new Set());
    await load();
  }

  return (
    <main className="min-h-screen bg-black text-white pb-28">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">

          <h1 className="text-3xl md:text-4xl font-bold text-red-500 tracking-wide">
            Voting
          </h1>

          <div className="text-lg font-medium">
            Selected:
            <span className="ml-2 text-red-500 font-bold">
              {selected.size} / 3
            </span>
          </div>

        </div>
      </div>


      {/* Projects grid */}
      <div className="max-w-6xl mx-auto px-6 py-6 grid gap-6
                      grid-cols-1
                      sm:grid-cols-2
                      lg:grid-cols-3">

        {projects.map(p => {
          const isSelected = selected.has(p.id);

          return (
            <div
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`
                bg-zinc-900 rounded-xl border border-zinc-800
                cursor-pointer
                transition-all duration-200
                hover:scale-[1.02] hover:border-red-500
                active:scale-[0.98]
                ${isSelected ? "ring-4 ring-red-500 border-red-500" : ""}
              `}
            >

              {/* Image */}
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt=""
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              )}

              {/* Content */}
              <div className="p-5">

                <div className="text-sm text-gray-400 mb-1">
                  Group {p.group}
                </div>

                <h3 className="text-xl font-semibold mb-2 text-white">
                  {p.title}
                </h3>

                <p className="text-gray-400 text-sm">
                  {p.description}
                </p>

                {/* Select indicator */}
                <div className="mt-4">
                  <div
                    className={`
                      text-center py-2 rounded-lg font-medium transition
                      ${isSelected
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-gray-300"}
                    `}
                  >
                    {isSelected ? "✓ Selected" : "Tap to Select"}
                  </div>
                </div>

              </div>
            </div>
          );
        })}

      </div>


      {/* Sticky Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800">

        <div className="max-w-6xl mx-auto px-6 py-4">

          <button
            onClick={submitVotes}
            disabled={loading || selected.size === 0}
            className="
              w-full
              py-4
              text-xl
              font-semibold
              rounded-xl
              bg-red-600
              text-white
              hover:bg-red-700
              active:scale-[0.98]
              disabled:bg-zinc-700
              disabled:text-gray-400
              disabled:cursor-not-allowed
              transition
              cursor-pointer
            "
          >
            {loading ? "Submitting..." : "Submit Votes"}
          </button>

        </div>

      </div>

    </main>
  );
}
