"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardPage() {
  const supabaseRef = useRef(null);
  const [projects, setProjects] = useState([]);

  // Debounce reload so many UPDATE events don't spam load()
  const reloadTimerRef = useRef(null);

  async function load() {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const { data, error } = await supabase.from("projects").select("*");

    if (error) {
      alert(error.message);
      return;
    }

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

  function scheduleLoad() {
    if (reloadTimerRef.current) return;
    reloadTimerRef.current = setTimeout(() => {
      reloadTimerRef.current = null;
      load();
    }, 150);
  }

  useEffect(() => {
    supabaseRef.current = supabaseBrowser();
    const supabase = supabaseRef.current;

    load();

    const ch = supabase
      .channel("projects-leaderboard-ws")
      .on(
        "postgres_changes",
        // listen to all changes so INSERT/DELETE also animate nicely
        { event: "*", schema: "public", table: "projects" },
        () => scheduleLoad()
      )
      .subscribe();

    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      supabase.removeChannel(ch);
    };
  }, []);

  function getRankStyle(index) {
    if (index === 0) return "border-yellow-400 ring-yellow-400";
    if (index === 1) return "border-gray-300 ring-gray-300";
    if (index === 2) return "border-orange-400 ring-orange-400";
    return "border-zinc-800";
  }

  function getRankIcon(index) {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  }

  const cardMotion = {
    layout: true,
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { type: "spring", stiffness: 500, damping: 35 },
  };

  return (
    <main className="min-h-screen bg-black text-white pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-3xl md:text-4xl font-bold text-red-500 tracking-wide">
            Leaderboard
          </h1>
          <p className="text-gray-400 mt-1">Live Results</p>
        </div>
      </div>

      {/* Podium Top 3 */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {projects.slice(0, 3).map((p, i) => (
              <motion.div
                key={p.id}
                {...cardMotion}
                className={`
                  bg-zinc-900 border rounded-xl p-5 text-center
                  shadow-lg ring-2 ${getRankStyle(i)}
                `}
              >
                <div className="text-4xl mb-2">{getRankIcon(i)}</div>

                <div className="text-lg font-semibold">Group {p.group}</div>

                <div className="text-gray-400 text-sm mb-2">{p.title}</div>

                <div className="text-3xl font-bold text-red-500">
                  {p.vote_count ?? 0}
                </div>

                <div className="text-gray-500 text-sm">votes</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Full leaderboard list */}
      <div className="max-w-6xl mx-auto px-6 mt-6 space-y-3">
        <AnimatePresence>
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              {...cardMotion}
              className={`
                bg-zinc-900 border border-zinc-800
                rounded-xl px-5 py-4
                flex items-center justify-between
                hover:border-red-500
              `}
            >
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold text-red-500 w-10">
                  {getRankIcon(i)}
                </div>

                <div>
                  <div className="font-semibold text-lg">Group {p.group}</div>
                  <div className="text-gray-400 text-sm">{p.title}</div>
                </div>
              </div>

              <div className="text-2xl font-bold text-white">
                {p.vote_count ?? 0}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
