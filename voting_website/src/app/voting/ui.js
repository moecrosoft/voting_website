"use client";

import { useEffect, useState } from "react";
import { onProjectsUpdate } from "@/lib/supabase-events";

export default function VotingUI() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load projects");
      setProjects(json.data || []);
    } catch (err) {
      console.error("Load projects error:", err);
      alert(err.message || "Failed to load projects");
    }
  }

  useEffect(() => {
    loadProjects();
    const unsub = onProjectsUpdate(() => loadProjects());
    return () => unsub();
  }, []);

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
    if (ids.length !== 3) return;

    setLoading(true);
    try {
      for (const id of ids) {
        const res = await fetch(`/api/projects?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vote_delta: 1 }),
        });
        if (!res.ok) throw new Error("Vote failed");
      }

      setShowConfirm(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setSelected(new Set());
      }, 1600);
    } catch (err) {
      console.error(err);
      alert(err.message || "Vote failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[100dvh] bg-black text-white flex flex-col justify-between">
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-red-500 uppercase italic tracking-tighter">
              Pick your top 3
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
              Select exactly three projects to submit
            </p>
          </div>
          <div className="text-lg font-bold bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
            Selected:
            <span className={`ml-2 font-black transition-colors ${selected.size === 3 ? "text-green-500" : "text-red-500"}`}>
              {selected.size} / 3
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const isSelected = selected.has(p.id);
          const isDisabled = !isSelected && selected.size >= 3;

          return (
            <div
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                isSelected ? "border-red-500 scale-[1.02] shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "border-zinc-800"
              } ${isDisabled ? "opacity-40 grayscale-[0.5]" : "hover:border-zinc-600"} shadow-lg active:scale-[0.98]`}
            >
              <div className="relative w-full aspect-video">
                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-red-600 border-red-600" : "bg-black/40 border-white/20"}`}>
                  {isSelected && <span className="text-xs font-bold">✓</span>}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Group {p.group}</div>
                  <h3 className="text-xl font-black uppercase italic leading-tight mb-1">{p.title}</h3>
                  <p className="text-xs font-medium text-zinc-300 line-clamp-2">{p.description || "\u00A0"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-black border-t border-zinc-900 py-6 sticky bottom-0">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-2">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading || selected.size !== 3}
            className="w-full max-w-xs py-3 text-lg font-black uppercase italic cursor-pointer rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-[0.95] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition-all shadow-xl"
          >
            {selected.size === 3 ? "Submit Votes" : `Pick ${3 - selected.size} more`}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-sm text-center space-y-4 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic">Final Selection</h2>
            <p className="text-zinc-400 text-sm">
              Are you sure you want to vote for these 3 projects? You cannot change your vote later.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 cursor-pointer py-3 font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Back
              </button>
              <button
                onClick={submitVotes}
                disabled={loading}
                className="flex-1 cursor-pointer py-3 font-bold rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(34,197,94,0.4)]">
              <span className="text-4xl">✓</span>
            </div>
            <h2 className="text-3xl font-black uppercase italic text-green-400">Votes Locked!</h2>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">Thank you for participating</p>
          </div>
        </div>
      )}
    </main>
  );
}