"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardPage() {
  const supabaseRef = useRef(null);
  const [projects, setProjects] = useState([]);

  // debounce so rapid updates don't spam load()
  const reloadTimerRef = useRef(null);

  async function load() {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
      alert(error.message);
      return;
    }

    // sort: votes desc, created_at desc
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

    // ✅ FIXED: first arg must be "postgres_changes" (Supabase v2)
    const ch = supabase
      .channel("leaderboard")
      .on(
        "postgres_changes",
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

  // ---------- TIES: merge items with same vote_count into one row ----------
  function groupByVotes(list) {
    const groups = [];
    for (const p of list) {
      const votes = Number(p.vote_count ?? 0);
      const last = groups[groups.length - 1];

      if (last && last.votes === votes) last.items.push(p);
      else groups.push({ votes, items: [p] });
    }
    return groups;
  }

  // ✅ Dense ranking: 1, 2, 3... (ties share same rank but next rank doesn't disappear)
  function computeDenseRanks(groups) {
    return groups.map((_, i) => i + 1);
  }

  const groups = groupByVotes(projects);
  const ranks = computeDenseRanks(groups);

  function rankBadge(rank) {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  }

  function rankGradient(rank) {
    if (rank === 1) return "from-yellow-400/20";
    if (rank === 2) return "from-gray-300/15";
    if (rank === 3) return "from-orange-400/15";
    return "from-red-500/10";
  }

  const motionProps = {
    layout: true,
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { type: "spring", stiffness: 500, damping: 35 },
  };

  const topGroups = groups.slice(0, 3);

  return (
    <main className="min-h-[100dvh] bg-black text-white pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-4xl font-bold text-red-500 tracking-wide">
            Leaderboard
          </h1>
          <p className="text-gray-400 mt-1">Live Results</p>
        </div>
      </div>

      {/* Podium (Top 3 vote groups) */}
      <div className="max-w-6xl mx-auto px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {topGroups.map((g, i) => {
              const rank = ranks[i] ?? i + 1;
              const tied = g.items.length > 1;

              return (
                <motion.div
                  key={`${g.votes}-${i}`}
                  {...motionProps}
                  className="
                    relative overflow-hidden
                    bg-zinc-900 border border-zinc-800
                    rounded-2xl p-5 text-center
                    shadow-lg ring-1 ring-white/10
                  "
                >
                  <div
                    className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${rankGradient(
                      rank
                    )} to-transparent`}
                  />

                  <div className="relative">
                    <div className="text-4xl mb-2">{rankBadge(rank)}</div>
                    <div className="text-sm text-gray-400 mb-1">Rank #{rank}</div>

                    {/* Groups side-by-side with "/" */}
                    <div className="text-lg font-semibold text-white leading-tight">
                      {g.items.map((p, idx) => (
                        <span key={p.id}>
                          Group {p.group}
                          {idx < g.items.length - 1 && (
                            <span className="mx-2 text-gray-500">/</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Titles side-by-side with "/" */}
                    <div className="text-gray-400 text-sm mt-1 line-clamp-2">
                      {g.items.map((p, idx) => (
                        <span key={p.id}>
                          {p.title}
                          {idx < g.items.length - 1 && (
                            <span className="mx-2 text-gray-600">/</span>
                          )}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4">
                      <div className="text-3xl font-bold text-red-500">{g.votes}</div>
                      <div className="text-gray-500 text-sm">votes</div>
                    </div>

                    {tied && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs text-gray-300">
                        <span className="font-semibold text-white/90">Tie</span>
                        <span>•</span>
                        <span>{g.items.length} groups</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Full leaderboard (ties merged into one row) */}
      <div className="max-w-6xl mx-auto px-6 mt-6 space-y-3">
        <AnimatePresence>
          {groups.map((g, i) => {
            const rank = ranks[i] ?? i + 1;
            const tied = g.items.length > 1;

            return (
              <motion.div
                key={`${g.votes}-${i}`}
                {...motionProps}
                className="
                  relative overflow-hidden
                  bg-zinc-900 border border-zinc-800
                  rounded-2xl px-5 py-4
                  flex items-center justify-between gap-4
                  hover:border-red-500 transition
                "
              >
                <div
                  className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${rankGradient(
                    rank
                  )} to-transparent`}
                />

                {/* Left */}
                <div className="relative flex items-center gap-4 min-w-0">
                  <div className="w-16 flex items-center justify-center">
                    <div className="text-xl font-bold text-red-500">
                      {rankBadge(rank)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-lg truncate">
                      {g.items.map((p, idx) => (
                        <span key={p.id}>
                          Group {p.group}
                          {idx < g.items.length - 1 && (
                            <span className="mx-2 text-gray-500">/</span>
                          )}
                        </span>
                      ))}
                    </div>

                    <div className="text-gray-400 text-sm truncate">
                      {g.items.map((p, idx) => (
                        <span key={p.id}>
                          {p.title}
                          {idx < g.items.length - 1 && (
                            <span className="mx-2 text-gray-600">/</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {tied && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs text-gray-300">
                        <span className="font-semibold text-white/90">Tie</span>
                        <span>•</span>
                        <span>{g.items.length} groups</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="relative text-right shrink-0">
                  <div className="text-2xl font-bold text-white">{g.votes}</div>
                  <div className="text-xs text-gray-400">votes</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
}
