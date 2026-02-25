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

    // Realtime subscription
    const unsub = onProjectsUpdate(() => loadProjects());
    return () => unsub();
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
    try {
      for (const id of ids) {
        const res = await fetch(`/api/projects?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vote_delta: 1 }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Vote failed");
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
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-red-500">
            What are your three favourite projects?
          </h1>
          <div className="text-lg font-semibold">
            Selected:
            <span className="ml-2 text-red-500 font-extrabold">{selected.size} / 3</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const isSelected = selected.has(p.id);
          return (
            <div
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                isSelected ? "border-red-500" : "border-zinc-800"
              } shadow-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="relative w-full aspect-video">
                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/95 to-transparent" />
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="absolute top-2 right-2 w-4 h-4 accent-red-600 opacity-80 z-10"
                />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-sm font-extrabold mb-1">Group {p.group}</div>
                  <h3 className="text-2xl font-extrabold mb-1">{p.title}</h3>
                  <p className="text-sm font-extrabold line-clamp-3">{p.description || "\u00A0"}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-black border-t border-zinc-800 py-4">
        <div className="max-w-6xl mx-auto flex justify-center">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading || selected.size === 0}
            className="w-1/2 sm:w-1/3 md:w-1/4 py-2 text-lg font-extrabold rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] disabled:bg-zinc-700 disabled:text-gray-400 disabled:cursor-not-allowed transition cursor-pointer"
          >
            Submit Votes
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-[90%] max-w-md text-center space-y-4">
            <h2 className="text-2xl font-extrabold">Confirm Votes</h2>
            <p className="text-gray-400">
              You selected {selected.size} project{selected.size > 1 ? "s" : ""}. Confirm voting?
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 cursor-pointer">
                Cancel
              </button>
              <button onClick={submitVotes} className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-700 cursor-pointer">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-[90%] max-w-md text-center space-y-3">
            <h2 className="text-2xl font-extrabold text-green-400">Vote Submitted 🎉</h2>
            <p className="text-gray-400">Thank you for voting!</p>
          </div>
        </div>
      )}
    </main>
  );
}
