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
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
        const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
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
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 }, colors: ["#ff0000", "#ffffff"] });
      }
      prevTotalVotesRef.current = currentTotal;
      firstLoadRef.current = false;
      setProjects(data);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 3000);
    return () => clearInterval(interval);
  }, []);

  const grouped = projects.reduce((acc, p) => {
    const v = p.vote_count ?? 0;
    if (!acc[v]) acc[v] = [];
    acc[v].push(p);
    return acc;
  }, {});

  const sortedVotes = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  const votedGroups = sortedVotes.filter(v => v > 0).map(v => ({ votes: v, items: grouped[v] }));
  const podiumGroups = votedGroups.slice(0, 3);
  const listVotes = [...sortedVotes.filter(v => v > 0).slice(3), ...sortedVotes.filter(v => v === 0)];

  const hasAnyPodium = podiumGroups.length > 0;
  const spring = { type: "spring", stiffness: 60, damping: 20 };

  return (
    <main className="h-[100dvh] w-full bg-[#020202] text-white flex flex-col px-4 md:px-12 py-2 md:py-4 overflow-hidden select-none">
      
      <header className="flex justify-between items-center mt-2 md:mt-6 mb-2 md:mb-10 flex-shrink-0 z-50">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-5xl font-black text-[#ff0000] uppercase tracking-tighter italic leading-none drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
            Leaderboard
          </h1>
          <p className="text-[7px] md:text-xs text-zinc-600 font-bold tracking-[0.4em] uppercase mt-1">Live Results</p>
        </div>
        <div className="bg-zinc-900/50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-red-900/30">
          <p className="text-[6px] md:text-[9px] text-zinc-500 font-black uppercase text-center">Closing In</p>
          <p className="font-mono text-sm md:text-3xl font-bold text-red-500 tabular-nums leading-none">{timeLeft}</p>
        </div>
      </header>

      {/* Spacer to keep center alignment on mobile */}
      <div className="flex-grow md:hidden" />

      <div className="flex-shrink-0 flex flex-col items-center w-full">
        {/* Podium Area */}
        <div className="w-full mb-4 md:mb-12">
          <AnimatePresence mode="popLayout">
            {hasAnyPodium && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring}
                className="flex items-end justify-center gap-1 md:gap-8 w-full"
              >
                {podiumGroups[1] ? (
                  <PodiumStep data={podiumGroups[1]} rank={2} h="h-8 md:h-24" order="order-1" spring={spring} />
                ) : <div className="hidden md:block md:w-72 order-1" />}

                {podiumGroups[0] && (
                  <PodiumStep data={podiumGroups[0]} rank={1} h="h-14 md:h-36" order="order-2" spring={spring} />
                )}

                {podiumGroups[2] ? (
                  <PodiumStep data={podiumGroups[2]} rank={3} h="h-6 md:h-12" order="order-3" spring={spring} />
                ) : <div className="hidden md:block md:w-72 order-3" />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scrollable List Area */}
        <section className="w-full max-w-4xl mx-auto max-h-[30vh] md:max-h-none overflow-y-auto no-scrollbar px-1">
          <AnimatePresence mode="popLayout">
            {listVotes.map((voteValue, idx) => (
              <motion.div
                key={`row-${voteValue}`}
                layout
                className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800/50 p-1.5 md:p-2.5 rounded-xl mb-1.5 last:mb-0"
              >
                <div className="flex items-center gap-2 md:gap-8 overflow-hidden">
                  <span className="text-zinc-700 font-black text-[10px] md:text-xl italic w-4 md:w-6 text-center flex-shrink-0">
                    {voteValue > 0 ? `#${idx + podiumGroups.length + 1}` : "—"}
                  </span>
                  <div className="flex items-center overflow-hidden">
                    {grouped[voteValue].map(p => (
                      <div key={p.id} className="flex items-center gap-2 pr-3 border-r border-zinc-800 last:border-0 flex-shrink-0">
                        <img src={p.image_url} alt="" className="w-8 md:w-20 aspect-video rounded-sm object-cover bg-black" />
                        <span className="font-bold text-[8px] md:text-lg uppercase truncate max-w-[60px] md:max-w-xs">{p.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 ml-2 flex-shrink-0">
                  <span className={`text-sm md:text-3xl font-mono font-black ${voteValue > 0 ? 'text-[#ff0000]' : 'text-zinc-800'}`}>
                    {voteValue}
                  </span>
                  <span className="text-[5px] md:text-[8px] text-zinc-600 font-black uppercase">Pts</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>

      <div className="flex-grow md:hidden" />

      {/* Footer with extra bottom padding for mobile browsers */}
      <footer className="flex justify-center items-center gap-6 md:gap-16 flex-shrink-0 py-2 pb-8 md:pb-2 mt-auto border-t border-zinc-900/30">
        <img src="/itclub.png" alt="" className="h-3 md:h-8 w-auto object-contain opacity-60" />
        <div className="w-px h-3 md:h-6 bg-zinc-900" />
        <img src="/student.png" alt="" className="h-3 md:h-8 w-auto object-contain opacity-60" />
      </footer>
    </main>
  );
}

function PodiumStep({ data, rank, h, order, spring }) {
  const isGold = rank === 1;
  const numTied = data.items.length;
  const isTie = numTied > 1;

  const podiumStyles = {
    1: { block: "from-[#facc15] via-[#a16207] to-[#1c1917]", border: "border-[#facc15]", glow: "shadow-[0_-15px_40px_rgba(234,179,8,0.4)]", emoji: "🥇", text: "text-[#eab308]", imgBorder: "border-[#facc15] shadow-[0_0_20px_rgba(234,179,8,0.6)]" },
    2: { block: "from-[#a1a1aa] via-[#52525b] to-[#1c1917]", border: "border-[#a1a1aa]", glow: "shadow-[0_-10px_30px_rgba(161,161,170,0.3)]", emoji: "🥈", text: "text-[#a1a1aa]", imgBorder: "border-[#a1a1aa] shadow-[0_0_15px_rgba(161,161,170,0.4)]" },
    3: { block: "from-[#b45309] via-[#7c2d12] to-[#1c1917]", border: "border-[#b45309]", glow: "shadow-[0_-8px_20px_rgba(180,83,9,0.25)]", emoji: "🥉", text: "text-[#b45309]", imgBorder: "border-[#b45309] shadow-[0_0_12px_rgba(180,83,9,0.4)]" }
  }[rank];

  // LAPTOP DIMENSIONS (DO NOT TOUCH)
  const desktopWidth = isTie ? (numTied > 2 ? 'md:w-[450px]' : 'md:w-96') : 'md:w-72';
  const desktopOverlap = isTie ? (isGold ? 'md:-space-x-32' : 'md:-space-x-24') : 'md:-space-x-32';

  return (
    <motion.div 
      layout 
      transition={spring} 
      className={`flex flex-col items-center flex-1 md:flex-none ${desktopWidth} ${order} min-w-0`}
    >
      {/* Image Stack */}
      <div className={`flex justify-center -space-x-8 md:${desktopOverlap} mb-1 md:mb-4 relative z-10 w-full px-0.5`}>
        {data.items.slice(0, 3).map((p, i) => (
          <div key={p.id} 
               className={`w-full md:w-56 aspect-video rounded-md border-[1.5px] md:border-2 ${podiumStyles.imgBorder} overflow-hidden bg-black flex-shrink-0 relative`}
               style={{ 
                 zIndex: 10 - i, 
                 rotate: isTie ? (i % 2 === 0 ? '-1.5deg' : '1.5deg') : '0deg', 
                 transform: isGold ? 'scale(1.1)' : 'scale(1)' 
               }}>
            <img src={p.image_url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Project Names */}
      <div className="text-center mb-0.5 md:mb-2 px-1 w-full min-h-[30px] md:min-h-[45px] flex flex-col justify-end">
        <div className="flex flex-col gap-0 max-w-[95%] mx-auto overflow-hidden">
          {data.items.slice(0, 3).map(p => (
            <p key={p.id} className="font-black text-[7px] md:text-2xl uppercase truncate text-white italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              {p.title}
            </p>
          ))}
        </div>
        <p className={`font-mono font-black text-[8px] md:text-3xl mt-0.5 leading-none ${isGold ? 'text-yellow-400' : 'text-zinc-200'}`}>
          {data.votes} <span className="text-[4px] md:text-sm text-zinc-600">PTS</span>
        </p>
      </div>

      {/* Podium Block */}
      <div className={`${h} w-full rounded-t-lg md:rounded-t-[2.5rem] border-t md:border-t-4 ${podiumStyles.border} ${podiumStyles.glow} bg-gradient-to-t ${podiumStyles.block} flex flex-col items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/10 to-black/40" />
        <span className="text-xs md:text-6xl mb-0.5 md:mb-1 drop-shadow-xl relative">{podiumStyles.emoji}</span>
        <span className={`font-black text-[5px] md:text-2xl italic ${podiumStyles.text} relative brightness-125`}>#{rank}</span>
      </div>
    </motion.div>
  );
}