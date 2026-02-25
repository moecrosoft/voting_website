"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { supabaseBrowser } from "@/lib/supabase-browser";

// Confetti trigger
function triggerConfetti(votes = 1) {
  if (typeof window === "undefined") return;
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
  const supabaseRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Load all projects initially
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
        if (!firstLoadRef.current && currentVote > prevVote) {
          triggerConfetti(currentVote - prevVote);
        }
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
    const supabase = supabaseBrowser();
    supabaseRef.current = supabase;

    loadProjects();

    // Remove previous subscription if any
    if (subscriptionRef.current) supabase.removeChannel(subscriptionRef.current);

    try {
      subscriptionRef.current = supabase
        .channel("projects-leaderboard")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "projects" },
          (payload) => {
            const updatedProject = payload.new;
            setProjects((prev) =>
              prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
            );

            const prevVote = prevVotesRef.current[updatedProject.id] ?? 0;
            if (updatedProject.vote_count > prevVote) {
              triggerConfetti(updatedProject.vote_count - prevVote);
            }
            prevVotesRef.current[updatedProject.id] = updatedProject.vote_count;
          }
        )
        .subscribe();
    } catch (err) {
      console.error("Supabase subscription error:", err);
    }

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, []);

  const sortedProjects = [...projects].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  const maxVotes = Math.max(...projects.map((p) => p.vote_count ?? 0), 1);

  const voteGroups = [];
  const zeroGroups = [];
  sortedProjects.forEach((p) => {
    const votes = p.vote_count ?? 0;
    if (votes === 0) zeroGroups.push(p);
    else {
      const last = voteGroups[voteGroups.length - 1];
      if (last && last.votes === votes) last.items.push(p);
      else voteGroups.push({ votes, items: [p] });
    }
  });

  const top3 = voteGroups.slice(0, 3);
  const rest = voteGroups.slice(3);

  const motionProps = { layout: true, transition: { type: "spring", stiffness: 300, damping: 35 } };
  const topColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
  const rankEmoji = ["🥇", "🥈", "🥉"];

  return (
    <main className="min-h-[100dvh] bg-black text-white pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <h1 className="text-3xl md:text-4xl font-bold text-red-500 tracking-wide drop-shadow-[0_0_4px_red]">
            Leaderboard
          </h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base">Live Results</p>
        </div>
      </div>

      {/* Projects */}
      <div className="max-w-6xl mx-auto px-6 mt-4 space-y-2">
        <AnimatePresence>
          {top3.map((g, i) => {
            const width = (g.votes / maxVotes) * 100;
            const groupNames = g.items.map((p) => `Group ${p.group}`).join(" / ");
            return (
              <motion.div
                key={`top-${i}`}
                {...motionProps}
                className="relative h-14 md:h-16 grid grid-cols-[60px_1fr_auto] items-center rounded-xl overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  className="absolute left-0 top-0 bottom-0 rounded-xl"
                  style={{ backgroundColor: topColors[i] }}
                />
                <div className="relative z-10 text-xl md:text-2xl font-extrabold px-3 [text-shadow:0_0_8px_black,0_0_12px_black]">
                  {rankEmoji[i]}
                </div>
                <div className="relative z-10 px-2 py-1 text-lg md:text-xl font-extrabold tracking-wide text-white [text-shadow:0_0_8px_black,0_0_12px_black]">
                  {groupNames}
                </div>
                <div className="relative z-10 px-4 text-lg md:text-xl font-extrabold text-white [text-shadow:0_0_8px_black,0_0_12px_black]">
                  {g.votes} votes
                </div>
              </motion.div>
            );
          })}

          {rest.map((g, i) => {
            const width = (g.votes / maxVotes) * 100;
            const groupNames = g.items.map((p) => `Group ${p.group}`).join(" / ");
            return (
              <motion.div
                key={`rest-${i}`}
                {...motionProps}
                className="relative h-14 md:h-16 grid grid-cols-[60px_1fr_auto] items-center rounded-xl overflow-hidden"
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  className="absolute left-0 top-0 bottom-0 rounded-xl bg-gray-700"
                />
                <div className="relative z-10 px-3 text-lg md:text-xl font-extrabold text-orange-400 drop-shadow-[0_0_4px_black]">
                  #{i + 4}
                </div>
                <div className="relative z-10 px-2 py-1 text-lg md:text-xl font-extrabold tracking-wide text-white drop-shadow-[0_0_4px_black] truncate">
                  {groupNames}
                </div>
                <div className="relative z-10 px-4 text-lg md:text-xl font-extrabold text-white drop-shadow-[0_0_4px_black]">
                  {g.votes} votes
                </div>
              </motion.div>
            );
          })}

          {zeroGroups.map((p, i) => (
            <div key={`zero-${i}`} className="h-12 md:h-14 grid grid-cols-[60px_1fr_auto] items-center">
              <div />
              <div className="px-2 text-lg md:text-xl font-extrabold tracking-wide text-white drop-shadow-[0_0_4px_black] truncate">
                Group {p.group}
              </div>
              <div className="px-4 text-lg md:text-xl font-extrabold text-white drop-shadow-[0_0_4px_black]">
                0 votes
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}