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
    setSelected((prev) => {
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
    <main className="min-h-[100dvh] bg-black text-white flex flex-col justify-between">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-red-500 tracking-wide leading-snug">
            What are your three favourite projects?
          </h1>
          <div className="text-lg font-semibold mt-2 md:mt-0">
            Selected:
            <span className="ml-2 text-red-500 font-extrabold">{selected.size} / 3</span>
          </div>
        </div>
      </div>

      {/* Projects grid */}
      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const isSelected = selected.has(p.id);

          return (
            <div
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`
                relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200
                border-2 ${isSelected ? "border-red-500" : "border-zinc-800"}
                shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]
              `}
            >
              {p.image_url && (
                <div className="relative w-full aspect-video">
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Stronger gradient for text readability */}
                  <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/95 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="text-sm font-extrabold text-white mb-1">Group {p.group}</div>
                    <h3 className="text-2xl font-extrabold mb-1">{p.title}</h3>
                    <p className="text-sm font-extrabold text-white line-clamp-3">
                      {p.description || "\u00A0"}
                    </p>
                  </div>
                </div>
              )}

              {/* Selection indicator */}
              <div className="absolute top-2 right-2">
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${isSelected ? "bg-red-500 border-red-500" : "bg-black/50 border-gray-400"}
                  `}
                >
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="white"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      <div className="bg-black border-t border-zinc-800 py-4">
        <div className="max-w-6xl mx-auto flex justify-center">
          <button
            onClick={submitVotes}
            disabled={loading || selected.size === 0}
            className="
              w-1/2 sm:w-1/3 md:w-1/4 py-2 text-lg font-extrabold rounded-xl
              bg-red-600 text-white hover:bg-red-700
              active:scale-[0.98]
              disabled:bg-zinc-700 disabled:text-gray-400 disabled:cursor-not-allowed
              transition cursor-pointer
            "
          >
            {loading ? "Submitting..." : "Submit Votes"}
          </button>
        </div>
      </div>
    </main>
  );
}
