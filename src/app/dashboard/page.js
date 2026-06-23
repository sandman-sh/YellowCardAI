"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import dynamic from "next/dynamic";
import { useWalrusMemory } from "@/hooks/useWalrusMemory";
import MatchData from "@/components/MatchData";
import AgentChat from "@/components/AgentChat";
import TiltLedger from "@/components/TiltLedger";
import YellowCardAlert from "@/components/YellowCardAlert";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

const ConnectButtonDynamic = dynamic(
  async () => (await import("@mysten/dapp-kit")).ConnectButton,
  { ssr: false }
);

export default function DashboardPage() {
  const account = useCurrentAccount();
  const connected = !!account;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Custom hook for on-chain Walrus state
  const { memory, isLoading, syncStatus, blobId, txSignature, readMemory, updateMemory } = useWalrusMemory();

  // Track drafted bet from MatchData
  const [draftedBet, setDraftedBet] = useState("");
  
  // Trigger Yellow Card flash
  const [yellowCardTrigger, setYellowCardTrigger] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if wallet is not connected
  useEffect(() => {
    if (mounted && !connected) {
      router.push("/");
    }
  }, [connected, mounted, router]);

  const handleSelectTeam = (targetTeam, opponentTeam) => {
    setDraftedBet(`${targetTeam}`);
  };

  const handleTriggerYellowCard = () => {
    setYellowCardTrigger(true);
  };

  if (!mounted) return null;

  if (!connected) {
    return (
      <div className="min-h-screen bg-pitch-green text-white flex flex-col items-center justify-center p-6 border-[12px] border-black">
        <div className="bg-white text-black p-8 border-8 border-black max-w-md w-full text-center neo-shadow">
          <ShieldAlert size={48} className="mx-auto text-ref-red mb-4" />
          <h2 className="text-2xl font-black uppercase tracking-tight mb-2">OFFSIDE! Wallet Required</h2>
          <p className="text-sm font-bold text-stone-600 mb-6">
            You must connect your Sui wallet to access the YellowCard AI Copilot on-chain dashboard.
          </p>
          <div className="bg-black p-1 neo-shadow inline-block">
            <ConnectButtonDynamic className="!bg-ref-yellow !text-black !font-black !rounded-none !border-4 !border-black hover:!bg-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-pitch-green text-white p-4 md:p-8 relative referee-notepad-lines" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1c5c3c 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      
      {/* Bauhaus Stark Grid lines */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-black z-10" />

      {/* Yellow Card Modal Alert Overlay */}
      <YellowCardAlert 
        trigger={yellowCardTrigger} 
        onClose={() => setYellowCardTrigger(false)} 
      />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8 z-20 relative">
        {/* Logo and Name */}
        <div className="flex items-center gap-3 bg-black p-3 border-4 border-black neo-shadow-yellow cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-10 bg-ref-yellow border-2 border-black transform rotate-6 flex items-center justify-center">
            <span className="text-black font-black text-xs">YC</span>
          </div>
          <span className="font-black text-2xl tracking-tighter text-white">
            YELLOWCARD <span className="text-ref-yellow">AI</span>
          </span>
        </div>

        {/* Status indicator and Wallet buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* On-chain loading indicator */}
          {isLoading && (
            <div className="bg-black border-2 border-black text-xs font-bold px-3 py-1.5 text-white flex items-center gap-1.5 neo-shadow-white">
              <RefreshCw size={12} className="animate-spin text-ref-yellow" />
              <span>Fetching Walrus Memory...</span>
            </div>
          )}

          {account && (
            <div className="hidden lg:flex items-center bg-black border-4 border-black px-3 py-1.5 text-xs font-bold text-white select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 animate-ping" />
              <span>Sui Mainnet: {account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
            </div>
          )}

          <div className="bg-black border-4 border-black neo-shadow-white p-0.5">
            <ConnectButtonDynamic className="!bg-ref-yellow !text-black !font-black !rounded-none !border-0 !h-9 !text-xs hover:!bg-white" />
          </div>
        </div>
      </header>

      {/* Dashboard Main Grid Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 z-20 relative items-stretch mb-8">
        
        {/* Block A: Match Data (Left) */}
        <div className="lg:col-span-4 h-full">
          <MatchData onSelectTeam={handleSelectTeam} />
        </div>

        {/* Block B: Chat Referee Notepad (Center/Right) */}
        <div className="lg:col-span-8 h-full">
          <AgentChat 
            memory={memory} 
            updateMemory={updateMemory}
            syncStatus={syncStatus}
            onTriggerYellowCard={handleTriggerYellowCard}
            draftedBet={draftedBet}
            clearDraftedBet={() => setDraftedBet("")}
          />
        </div>

      </div>

      {/* Dashboard Bottom Grid Content */}
      <div className="max-w-7xl mx-auto z-20 relative">
        
        {/* Block C: Tilt Ledger */}
        <TiltLedger 
          memory={memory} 
          blobId={blobId} 
          txSignature={txSignature} 
        />
        
      </div>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t-4 border-black flex justify-between items-center text-stone-300 text-xs font-bold z-20 relative">
        <p>© 2026 YellowCard AI Betting Copilot. Running live on Sui Mainnet & Walrus Mainnet Memory Network.</p>
        <button 
          onClick={() => router.push("/")}
          className="hover:text-ref-yellow flex items-center gap-1 uppercase"
        >
          <Home size={12} /> Home
        </button>
      </footer>
    </main>
  );
}
