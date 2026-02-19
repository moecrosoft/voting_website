"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaderboardPage() {
  const supabaseRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const reloadTimerRef = useRef(null);

  async function load() {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
      alert(error.message);
      return;
    }

    setProjects(data || []);
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
      .channel("leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => scheduleLoad()
      )
      .subscribe();

    return () => supabase.removeChannel(ch);
  }, []);

  // ---------- Sorting & grouping ----------
  const sortedProjects = [...projects].sort(
    (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)
  );

  const maxVotes = Math.max(...projects.map((p) => p.vote_count ?? 0), 1);

  // Group by vote count (except 0 votes)
  const voteGroups = [];
  const zeroGroups = [];

  sortedProjects.forEach((p) => {
    const votes = p.vote_count ?? 0;
    if (votes === 0) {
      zeroGroups.push(p);
      return;
    }

    const last = voteGroups[voteGroups.length - 1];
    if (last && last.votes === votes) {
      last.items.push(p);
    } else {
      voteGroups.push({ votes, items: [p] });
    }
  });

  const top3 = voteGroups.slice(0, 3);
  const rest = voteGroups.slice(3);

  const motionProps = {
    layout: true,
    transition: { type: "spring", stiffness: 300, damping: 35 },
  };

  const topColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // gold, silver, bronze
  const rankColor = "#FFA500"; // orange for #4, #5, etc.
  const rankEmoji = ["🥇", "🥈", "🥉"];

  return (
    <main className="min-h-[100dvh] bg-black text-white pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <h1 className="text-4xl font-bold text-red-500 tracking-wide">Leaderboard</h1>
          <p className="text-gray-400 mt-1">Live Results</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-6 space-y-3">
        <AnimatePresence>
          {/* Top 3 */}
          {top3.map((g, i) => {
            const width = (g.votes / maxVotes) * 100;
            const groupNames = g.items.map((p) => `Group ${p.group}`).join(" / ");

            return (
              <motion.div
                key={`top-${i}`}
                {...motionProps}
                className="relative h-16 flex items-center rounded-2xl overflow-hidden grid grid-cols-[60px_1fr_auto] items-center"
              >
                {/* Bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  className="absolute left-0 top-0 bottom-0 rounded-2xl"
                  style={{ backgroundColor: topColors[i] }}
                />

                {/* Emoji */}
                <div className="relative z-10 text-xl md:text-2xl font-extrabold px-4">
                  {rankEmoji[i]}
                </div>

                {/* Group names */}
                <div className="relative z-10 px-2 text-xl md:text-2xl font-extrabold text-white truncate">
                  {groupNames}
                </div>

                {/* Vote count */}
                <div className="relative z-10 px-6 text-xl md:text-2xl font-extrabold text-white flex-shrink-0">
                  {g.votes} votes
                </div>
              </motion.div>
            );
          })}

          {/* Rest (#4, #5...) */}
          {rest.map((g, i) => {
            const width = (g.votes / maxVotes) * 100;
            const groupNames = g.items.map((p) => `Group ${p.group}`).join(" / ");

            return (
              <motion.div
                key={`rest-${i}`}
                {...motionProps}
                className="relative h-16 flex items-center rounded-2xl overflow-hidden grid grid-cols-[60px_1fr_auto] items-center"
              >
                {/* Grey bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  className="absolute left-0 top-0 bottom-0 rounded-2xl bg-gray-600"
                />

                {/* Rank number */}
                <div
                  className="relative z-10 px-4 text-xl md:text-2xl font-extrabold flex-shrink-0"
                  style={{ color: rankColor }}
                >
                  #{i + 4}
                </div>

                {/* Group names */}
                <div className="relative z-10 px-2 text-xl md:text-2xl font-extrabold text-white truncate">
                  {groupNames}
                </div>

                {/* Vote count */}
                <div className="relative z-10 px-6 text-xl md:text-2xl font-extrabold text-white flex-shrink-0">
                  {g.votes} votes
                </div>
              </motion.div>
            );
          })}

          {/* Groups with 0 votes */}
          {zeroGroups.map((p, i) => (
            <div
              key={`zero-${i}`}
              className="relative h-16 flex items-center grid grid-cols-[60px_1fr_auto] items-center"
            >
              <div className="relative z-10 px-4 text-xl md:text-2xl font-extrabold flex-shrink-0"></div>
              <div className="flex-1 px-2 text-xl md:text-2xl font-extrabold text-white truncate">
                Group {p.group}
              </div>
              <div className="relative z-10 px-6 text-xl md:text-2xl font-extrabold text-white flex-shrink-0">
                0 votes
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
