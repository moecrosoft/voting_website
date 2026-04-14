"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function LeaderboardUI() {
  const [projects, setProjects] = useState([]);
  const [targetDate] = useState(new Date("2026-04-14T17:00:00"));
  const [timeLeft, setTimeLeft] = useState("");

  const firstLoadRef = useRef(true);
  const prevTotalVotesRef = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(timer);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, "0");
        const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, "0");
        const s = Math.floor((diff / 1000) % 60).toString().padStart(2, "0");
        setTimeLeft(`${h}:${m}:${s}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      const json = await res.json();
      const data = json.data || [];

      const currentTotal = data.reduce((sum, p) => sum + (p.vote_count ?? 0), 0);

      if (!firstLoadRef.current && currentTotal > prevTotalVotesRef.current) {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff0000", "#ffffff"],
        });
      }

      prevTotalVotesRef.current = currentTotal;
      firstLoadRef.current = false;
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalVotes = projects.reduce((s, p) => s + (p.vote_count ?? 0), 0);
  const allZero = totalVotes === 0;

  const grouped = projects.reduce((acc, p) => {
    const v = p.vote_count ?? 0;
    if (!acc[v]) acc[v] = [];
    acc[v].push(p);
    return acc;
  }, {});

  const sortedVotes = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  const voteGroups = sortedVotes.map((v) => ({
    votes: v,
    items: grouped[v],
  }));

  const podiumGroups = voteGroups.filter((g) => g.votes > 0).slice(0, 3);

  const spring = { type: "spring", stiffness: 60, damping: 20 };

  return (
    <main className="h-[100dvh] w-full bg-[#020202] text-white flex flex-col px-4 md:px-10 overflow-hidden">

      {/* HEADER */}
      <header className="flex justify-between items-center pt-4 md:pt-8 pb-2 shrink-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-[#ff0000] uppercase tracking-tighter italic leading-none drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
            Leaderboard
          </h1>
          <p className="text-[9px] md:text-xs text-zinc-600 font-bold tracking-[0.4em] uppercase mt-1">
            Live Results
          </p>
        </div>

        <div className="bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-red-900/30">
          <p className="text-[8px] md:text-[9px] text-zinc-500 font-black uppercase text-center">
            Closing In
          </p>
          <p className="font-mono text-xl md:text-3xl font-bold text-red-500 tabular-nums leading-none">
            {timeLeft}
          </p>
        </div>
      </header>

      {/* PODIUM */}
      <div className="w-full shrink-0">
        <AnimatePresence mode="popLayout">
          {podiumGroups.length > 0 && !allZero && (
            <motion.div
              layout
              transition={spring}
              className="flex items-end justify-center gap-2 md:gap-10"
            >
              {podiumGroups[1] && (
                <PodiumStep data={podiumGroups[1]} rank={2} mobileH="h-16" desktopH="md:h-24" />
              )}

              {podiumGroups[0] && (
                <PodiumStep data={podiumGroups[0]} rank={1} mobileH="h-24" desktopH="md:h-36" />
              )}

              {podiumGroups[2] && (
                <PodiumStep data={podiumGroups[2]} rank={3} mobileH="h-10" desktopH="md:h-12" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* LIST — flex-1 + min-h-0 makes this scrollable within the remaining space */}
      <section className="w-full max-w-4xl mx-auto flex-1 min-h-0 overflow-y-auto py-2">
        <AnimatePresence mode="popLayout">

          {/* CASE 1: ALL ZERO → ONE ROW PER PROJECT */}
          {allZero
            ? projects.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl mb-2"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-zinc-500 font-black text-sm md:text-xl italic w-6 text-center">
                      —
                    </span>

                    <div className="flex items-center gap-2">
                      <img
                        src={p.image_url}
                        className="w-10 md:w-16 aspect-video rounded object-cover"
                        alt={p.title}
                      />
                      <span className="font-bold text-xs md:text-base uppercase truncate">
                        {p.title}
                      </span>
                    </div>
                  </div>

                  <div className="font-mono font-black text-lg md:text-2xl text-zinc-700">
                    0
                  </div>
                </motion.div>
              ))

            /* CASE 2: NORMAL GROUPED MODE */
            : voteGroups.map((group, idx) => (
                <motion.div
                  key={`group-${group.votes}`}
                  layout
                  className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl mb-2"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="text-zinc-500 font-black text-sm md:text-xl italic w-6 text-center">
                      #{idx + 1}
                    </span>

                    <div className="flex items-center gap-3 overflow-hidden">
                      {group.items.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 pr-3 border-r border-zinc-800 last:border-0"
                        >
                          <img
                            src={p.image_url}
                            className="w-10 md:w-16 aspect-video rounded object-cover"
                            alt={p.title}
                          />
                          <span className="font-bold text-xs md:text-base uppercase truncate max-w-[120px]">
                            {p.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="font-mono font-black text-lg md:text-2xl text-[#ff0000]">
                    {group.votes}
                  </div>
                </motion.div>
              ))}
        </AnimatePresence>
      </section>

      {/* FOOTER */}
      <footer className="flex justify-center items-center gap-6 md:gap-16 py-4 shrink-0">
        <img src="/itclub.png" className="h-5 md:h-7 opacity-40" alt="IT Club" />
        <div className="w-px h-5 bg-zinc-800" />
        <img src="/student.png" className="h-5 md:h-7 opacity-40" alt="Student" />
      </footer>

    </main>
  );
}

/* PODIUM */
function PodiumStep({ data, rank, mobileH, desktopH }) {
  const styles = {
    1: {
      border: "border-[#facc15]",
      emoji: "🥇",
      glow: "shadow-[0_0_25px_rgba(250,204,21,0.5)]",
      bg: "bg-gradient-to-t from-[#1c1917] via-[#a16207] to-[#facc15]",
      text: "text-yellow-400",
    },
    2: {
      border: "border-[#a1a1aa]",
      emoji: "🥈",
      glow: "shadow-[0_0_20px_rgba(161,161,170,0.4)]",
      bg: "bg-gradient-to-t from-[#1c1917] via-[#52525b] to-[#a1a1aa]",
      text: "text-zinc-300",
    },
    3: {
      border: "border-[#b45309]",
      emoji: "🥉",
      glow: "shadow-[0_0_20px_rgba(180,83,9,0.4)]",
      bg: "bg-gradient-to-t from-[#1c1917] via-[#7c2d12] to-[#b45309]",
      text: "text-orange-400",
    },
  }[rank];

  return (
    <motion.div
      layout
      className="flex flex-col items-center w-1/3 max-w-[180px] md:max-w-[260px]"
    >
      <div className="flex -space-x-4 mb-2">
        {data.items.slice(0, 3).map((p) => (
          <img
            key={p.id}
            src={p.image_url}
            alt={p.title}
            className={`w-16 md:w-24 aspect-video rounded border-2 ${styles.border} ${styles.glow}`}
          />
        ))}
      </div>

      <p className="text-xs md:text-lg font-bold text-center truncate w-full">
        {data.items.map((p) => p.title).join(" / ")}
      </p>

      <p className={`font-mono text-sm md:text-xl ${styles.text}`}>
        {data.votes}
      </p>

      <div
        className={`${mobileH} ${desktopH} w-full rounded-t-xl flex flex-col items-center justify-center ${styles.bg} ${styles.glow} border-t-2 ${styles.border} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/20 to-black/40" />
        <span className="text-xl md:text-4xl relative">{styles.emoji}</span>
        <span className={`text-[10px] md:text-sm font-bold ${styles.text} relative`}>
          #{rank}
        </span>
      </div>
    </motion.div>
  );
}