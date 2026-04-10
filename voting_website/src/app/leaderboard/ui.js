"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { onProjectsUpdate } from "@/lib/supabase-events";

function triggerConfetti(votes = 1) {
  for (let i = 0; i < votes; i++) {
    const x = Math.random() * 0.7 + 0.15;
    const y = Math.random() * 0.7 + 0.15;
    confetti({
      particleCount: 35,
      startVelocity: 25,
      spread: 120,
      ticks: 300,
      gravity: 0.3,
      origin: { x, y },
      scalar: 1.2,
      colors: ["#FFD700", "#FF4500", "#1E90FF", "#32CD32", "#FF69B4", "#FFFFFF"],
    });
  }
}

export default function LeaderboardUI() {
  const [projects, setProjects] = useState([]);
  const prevVotesRef = useRef({});
  const firstLoadRef = useRef(true);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load projects");
      const data = json.data || [];

      const prev = prevVotesRef.current;
      data.forEach((p) => {
        const prevVote = prev[p.id] ?? 0;
        const currentVote = p.vote_count ?? 0;
        if (!firstLoadRef.current && currentVote > prevVote) triggerConfetti(currentVote - prevVote);
        prev[p.id] = currentVote;
      });
      prevVotesRef.current = prev;
      firstLoadRef.current = false;
      setProjects(data);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  }

  useEffect(() => {
    loadProjects();
    const unsub = onProjectsUpdate(() => loadProjects());
    return () => unsub();
  }, []);

  const sortedProjects = [...projects].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  const maxVotes = Math.max(...projects.map((p) => p.vote_count ?? 0), 1);

  const groups = [];
  sortedProjects.forEach((p) => {
    const votes = p.vote_count ?? 0;
    const last = groups[groups.length - 1];
    if (last && last.votes === votes && votes > 0) {
      last.items.push(p);
      last.stableKey += `-${p.id}`; 
    } else {
      groups.push({ votes, items: [p], stableKey: `group-${p.id}`, isZero: votes === 0 });
    }
  });

  const kahootTransition = {
    type: "spring",
    stiffness: 50,
    damping: 10,
    mass: 1.2,
  };

  const topColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankEmoji = ["🥇", "🥈", "🥉"];
  const ROW_HEIGHT = 72; 

  const heavyShadow = {
    textShadow: "0px 0px 8px rgba(0,0,0,1), 0px 0px 12px rgba(0,0,0,1), 0px 2px 4px rgba(0,0,0,1)"
  };

  return (
    <main className="min-h-[100dvh] bg-black text-white pb-12">
      <div className="sticky top-0 z-20 bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl md:text-4xl font-bold text-red-500 tracking-wide drop-shadow-[0_0_4px_red]">Leaderboard</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Live Results</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-4 relative" style={{ height: groups.length * ROW_HEIGHT }}>
        <AnimatePresence>
          {groups.map((g, index) => {
            const width = (g.votes / maxVotes) * 100;
            const isTop3 = index < 3 && !g.isZero;
            const groupNames = g.items.map((p) => p.title || `Group ${p.group}`).join(" / ");

            return (
              <motion.div
                key={g.stableKey}
                layout
                initial={{ opacity: 0, x: -20, y: index * ROW_HEIGHT }}
                animate={{ opacity: 1, x: 0, y: index * ROW_HEIGHT }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={kahootTransition}
                className="absolute left-0 right-0 h-14 md:h-16 grid grid-cols-[60px_1fr_auto] items-center rounded-xl overflow-hidden"
                style={{ zIndex: groups.length - index }}
              >
                {/* Background Bar */}
                {!g.isZero && (
                  <motion.div
                    layout
                    transition={kahootTransition}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    className="absolute left-0 top-0 bottom-0 rounded-xl"
                    style={{ backgroundColor: isTop3 ? topColors[index] : "#3f3f46" }}
                  />
                )}

                {/* Rank Emoji / Number with Deep Shadow and Orange Color for ranks below 3 */}
                <div 
                  className={`relative z-10 text-xl md:text-2xl font-extrabold px-3 text-center ${!isTop3 && !g.isZero ? "text-[#FFA500]" : "text-white"}`}
                  style={heavyShadow}
                >
                  {!g.isZero && (isTop3 ? rankEmoji[index] : `#${index + 1}`)}
                </div>

                {/* Project Text with Deep Shadow */}
                <div 
                  className="relative z-10 px-2 py-1 text-lg md:text-xl font-extrabold tracking-wide text-white truncate"
                  style={heavyShadow}
                >
                  {groupNames}
                </div>

                {/* Vote Count with Deep Shadow */}
                <div 
                  className="relative z-10 px-4 text-lg md:text-xl font-extrabold text-white"
                  style={heavyShadow}
                >
                  {g.votes} votes
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </main>
  );
}