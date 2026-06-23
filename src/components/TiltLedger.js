"use client";

import { Activity, ShieldAlert, CheckCircle, Ban, HelpCircle, ExternalLink, Link2 } from "lucide-react";

export default function TiltLedger({ memory, blobId, txSignature }) {
  const { bets = [], totalBets = 0, winRate = 0, recentLossesCount = 0, emotionalState = "STABLE", tiltWarningCount = 0 } = memory;

  // Map emotional state to color tokens and text descriptions
  const getEmotionalConfig = (state) => {
    switch (state) {
      case "BLOWN BANKROLL":
        return {
          bg: "bg-ref-red",
          text: "text-white",
          border: "border-ref-red",
          title: "Blown Bankroll 🚨",
          desc: "Critical danger. You have wiped out key funds. Betting is locked.",
          percentage: 100
        };
      case "TILTING":
        return {
          bg: "bg-orange-500",
          text: "text-black",
          border: "border-orange-500",
          title: "TILTING ⚠️",
          desc: "Chasing losses detected. Ref must review every single action.",
          percentage: 75
        };
      case "FRUSTRATED":
        return {
          bg: "bg-ref-yellow",
          text: "text-black",
          border: "border-ref-yellow",
          title: "Frustrated 🟨",
          desc: "Recent loss registered. High potential to force a panic bet.",
          percentage: 45
        };
      case "STABLE":
      default:
        return {
          bg: "bg-emerald-600",
          text: "text-white",
          border: "border-emerald-600",
          title: "Stable 🟩",
          desc: "Disciplined bankroll strategy. VAR approves your mindset.",
          percentage: 10
        };
    }
  };

  const stateConfig = getEmotionalConfig(emotionalState);

  const getOutcomeBadge = (outcome) => {
    switch (outcome) {
      case "Win":
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-400 font-bold px-1.5 py-0.5 text-[9px] uppercase flex items-center gap-0.5"><CheckCircle size={10} /> WIN</span>;
      case "Loss":
        return <span className="bg-red-100 text-red-800 border border-red-400 font-bold px-1.5 py-0.5 text-[9px] uppercase flex items-center gap-0.5"><Ban size={10} /> LOSS</span>;
      case "Blocked":
        return <span className="bg-ref-yellow text-black border border-black font-bold px-1.5 py-0.5 text-[9px] uppercase flex items-center gap-0.5"><ShieldAlert size={10} /> BLOCKED</span>;
      default:
        return <span className="bg-stone-100 text-stone-800 border border-stone-400 font-bold px-1.5 py-0.5 text-[9px] uppercase flex items-center gap-0.5"><HelpCircle size={10} /> UNKNOWN</span>;
    }
  };

  return (
    <div className="neo-card h-full bg-white text-black p-4 md:p-6 border-4 border-black">
      
      {/* Block Title */}
      <div className="border-b-4 border-black pb-3 mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗄️</span>
          <h2 className="font-black text-xl uppercase tracking-tight">
            Block C: Tilt Ledger & Walrus Memory
          </h2>
        </div>

        {/* On-chain Explorer Hooks */}
        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
          {blobId && (
            <a 
              href={`https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white hover:bg-ref-yellow hover:text-black border-2 border-black px-2 py-0.5 flex items-center gap-1 transition-colors"
            >
              <Link2 size={10} /> Walrus Blob JSON
            </a>
          )}
          {txSignature && (
            <a 
              href={`https://suiscan.xyz/mainnet/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white hover:bg-ref-yellow hover:text-black border-2 border-black px-2 py-0.5 flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={10} /> Sui Tx
            </a>
          )}
        </div>
      </div>

      {/* Grid: Stat blocks */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Statistics Cards (Left Col) */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <div className="border-4 border-black p-3 bg-stone-50 neo-shadow">
            <span className="text-[10px] font-black uppercase text-stone-500 block mb-1">Total Bets</span>
            <span className="text-3xl font-black">{totalBets}</span>
          </div>

          <div className="border-4 border-black p-3 bg-stone-50 neo-shadow">
            <span className="text-[10px] font-black uppercase text-stone-500 block mb-1">Win Rate</span>
            <span className="text-3xl font-black text-emerald-600">{winRate}%</span>
          </div>

          <div className="border-4 border-black p-3 bg-stone-50 neo-shadow">
            <span className="text-[10px] font-black uppercase text-stone-500 block mb-1">Loss Streak</span>
            <span className={`text-3xl font-black ${recentLossesCount >= 2 ? 'text-ref-red' : 'text-black'}`}>
              {recentLossesCount}
            </span>
          </div>

          <div className="border-4 border-black p-3 bg-stone-50 neo-shadow">
            <span className="text-[10px] font-black uppercase text-stone-500 block mb-1">Warnings</span>
            <span className="text-3xl font-black text-ref-yellow bg-black px-2 py-0.5 border border-black neo-shadow-red w-fit inline-block">
              {tiltWarningCount}🟨
            </span>
          </div>
        </div>

        {/* Referee Tilt Indicator (Center Col) */}
        <div className="md:col-span-4 border-4 border-black p-4 bg-stone-50 neo-shadow h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black uppercase text-stone-500">Referee Emotional Evaluation</span>
              <Activity size={12} className="text-stone-500 animate-pulse" />
            </div>
            
            <h3 className={`text-xl font-black uppercase tracking-tight px-2 py-1 border-2 border-black inline-block mb-3 ${stateConfig.bg} ${stateConfig.text}`}>
              {stateConfig.title}
            </h3>
            
            <p className="text-xs font-bold text-stone-600 leading-relaxed">
              "{stateConfig.desc}"
            </p>
          </div>

          {/* Simple Bauhaus Progress Bar */}
          <div className="mt-6 border-4 border-black bg-stone-200 h-6 relative overflow-hidden">
            <div 
              className={`h-full border-r-4 border-black transition-all duration-500 ${
                emotionalState === "STABLE" ? "bg-emerald-600" :
                emotionalState === "FRUSTRATED" ? "bg-ref-yellow" :
                emotionalState === "TILTING" ? "bg-orange-500" : "bg-ref-red"
              }`}
              style={{ width: `${stateConfig.percentage}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-black mix-blend-difference">
              Tilt Meter: {stateConfig.percentage}%
            </span>
          </div>
        </div>

        {/* Betting Ledger Table (Right Col) */}
        <div className="md:col-span-4 border-4 border-black bg-stone-50 neo-shadow p-3 max-h-[220px] overflow-y-auto custom-scrollbar">
          <span className="text-[10px] font-black uppercase text-stone-500 block mb-2">On-Chain State History Ledger</span>
          
          {bets.length === 0 ? (
            <p className="text-xs font-bold text-stone-500 text-center py-8">
              No betting transactions recorded yet. Submit your first proposal in the chat!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...bets].reverse().map((bet) => (
                <div 
                  key={bet.id} 
                  className="border-2 border-black bg-white p-2 flex items-center justify-between text-xs hover:bg-stone-50"
                >
                  <div className="flex flex-col max-w-[60%]">
                    <span className="font-black truncate uppercase text-[10px]">
                      {bet.team}
                    </span>
                    <span className="text-[9px] font-bold text-stone-500">
                      {bet.match} • {bet.amount} SUI
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    {getOutcomeBadge(bet.outcome)}
                    <span className="text-[8px] font-bold text-stone-400 mt-1">{bet.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
