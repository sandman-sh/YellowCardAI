"use client";

import { useState, useEffect, useRef } from "react";
import { Send, AlertTriangle, ShieldCheck, RefreshCw, Key, Pocket, Bot, Check, X } from "lucide-react";
import { useCurrentAccount } from "@mysten/dapp-kit";

export default function AgentChat({ 
  memory, 
  updateMemory, 
  syncStatus, 
  onTriggerYellowCard,
  draftedBet,
  clearDraftedBet
}) {
  const account = useCurrentAccount();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "referee",
      content: "**Welcome back!** I am **SIRO**, your Web3 betting copilot and referee. State your proposed bet size and team (e.g. *'Put 2 SUI on Brazil to win'*). I will inspect your Walrus Memory and emotional tilt before approving the bet."
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  // Track proposed bet pending user validation (if not tilt)
  const [pendingBet, setPendingBet] = useState(null);
  
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, loading]);

  // Set input when user drafts a bet from Block A
  useEffect(() => {
    if (draftedBet) {
      setInput(`I want to put 2 SUI on ${draftedBet} to win.`);
      if (clearDraftedBet) clearDraftedBet();
    }
  }, [draftedBet, clearDraftedBet]);

  // API key is handled securely on the server via .env

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setPendingBet(null);

    // Append user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Call Next API Route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          memory: memory,
          address: account?.address
        })
      });

      if (!response.ok) {
        throw new Error("Referee failed to respond.");
      }

      const data = await response.json();
      
      // Append referee message
      setMessages(prev => [...prev, { 
        role: "referee", 
        content: data.refereeResponse,
        isTilt: data.isTilt
      }]);

      if (data.isTilt) {
        // Trigger Yellow Card flash animation
        onTriggerYellowCard();
        
        // Log blocked attempt to history automatically as an update
        const updatedBets = [
          ...memory.bets,
          {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            match: data.betDetails?.match || "Unknown Match",
            team: data.betDetails?.team || "Emotional Bet",
            amount: data.betDetails?.amount || 0,
            outcome: "Blocked",
            status: "YELLOW CARD",
            timestamp: new Date().toISOString()
          }
        ];

        // Update on-chain and local memory
        await updateMemory(updatedBets, { isTilt: true, emotionalState: data.emotionalState });
      } else if (data.betDetails) {
        // Safe bet proposal: set as pending so user can confirm and pay/log it
        setPendingBet({
          match: data.betDetails.match || "World Cup Match",
          team: data.betDetails.team || "Select Team",
          amount: data.betDetails.amount || 1,
          emotionalState: data.emotionalState
        });
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: "referee", 
        content: "**System Foul:** Could not reach SIRO's brain. Using fallback local rules." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBet = async (outcome) => {
    if (!pendingBet) return;

    const newBetRecord = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      match: pendingBet.match,
      team: pendingBet.team,
      amount: pendingBet.amount,
      outcome: outcome, // 'Win' or 'Loss'
      status: "APPROVED",
      timestamp: new Date().toISOString()
    };

    const updatedBets = [...memory.bets, newBetRecord];

    try {
      // Sync on-chain
      await updateMemory(updatedBets, { isTilt: false, emotionalState: pendingBet.emotionalState });
      
      // Append referee confirmation log
      setMessages(prev => [...prev, {
        role: "referee",
        content: `**Bet Approved by SIRO & Recorded On-Chain!** Placed ${pendingBet.amount} SUI on ${pendingBet.team}. Added to Walrus Memory. Play continues!`
      }]);
    } catch (e) {
      console.error("On-chain confirm fail:", e);
    } finally {
      setPendingBet(null);
    }
  };

  return (
    <div className="neo-card flex flex-col h-full bg-[#fcf8e3] text-black border-4 border-black min-h-[450px]">
      
      {/* Referee Header */}
      <div className="bg-black text-white p-4 border-b-4 border-black flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <Bot size={20} className="text-ref-yellow" />
          <h2 className="font-black text-lg uppercase tracking-tight">
            Block B: Chat with SIRO
          </h2>
        </div>
      </div>

      {/* Chat Messages Lined Notebook Page */}
      <div 
        ref={chatContainerRef} 
        className="flex-1 overflow-y-auto p-6 referee-notepad-lines custom-scrollbar max-h-[380px] bg-amber-50"
      >
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div 
                className={`p-3 border-2 border-black neo-shadow text-xs ${
                  msg.role === "user" 
                    ? "bg-black text-white neo-shadow-yellow" 
                    : msg.isTilt
                      ? "bg-ref-yellow text-black neo-shadow-red font-bold"
                      : "bg-white text-black neo-shadow-green"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">
                  {formatMessageText(msg.content)}
                </p>
              </div>
              <span className="text-[8px] font-black text-stone-500 uppercase mt-1">
                {msg.role === "user" ? "Player" : "SIRO"}
              </span>
            </div>
          ))}

          {loading && (
            <div className="mr-auto max-w-[85%] items-start flex flex-col">
              <div className="p-3 border-2 border-black bg-white text-black neo-shadow flex items-center gap-2 text-xs">
                <RefreshCw size={14} className="animate-spin text-ref-yellow" />
                <span className="font-bold uppercase tracking-widest text-[10px]">SIRO is reviewing the play...</span>
              </div>
            </div>
          )}
          

        </div>
      </div>

      {/* Pending Bet Confirmation Screen */}
      {pendingBet && (
        <div className="p-4 bg-emerald-100 border-t-4 border-black text-black">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-emerald-700" size={18} />
            <span className="font-black text-xs uppercase tracking-tight text-emerald-800">
              VAR APPROVED: Play On
            </span>
          </div>
          <p className="text-xs font-bold mb-3">
            The referee approved your bet of <span className="underline">{pendingBet.amount} SUI</span> on <span className="font-black">{pendingBet.team}</span>. Log result to update Walrus Memory:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleConfirmBet("Win")}
              className="neo-button !bg-emerald-600 !text-white text-xs py-2 hover:!bg-emerald-700 flex items-center justify-center gap-1.5"
            >
              <Check size={14} /> LOG WIN
            </button>
            <button
              onClick={() => handleConfirmBet("Loss")}
              className="neo-button !bg-ref-red !text-white text-xs py-2 hover:!bg-red-700 flex items-center justify-center gap-1.5"
            >
              <X size={14} /> LOG LOSS
            </button>
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      {syncStatus !== "idle" && (
        <div className={`px-4 py-1 text-[10px] font-black uppercase border-t-2 border-black flex justify-between items-center ${
          syncStatus === "syncing" ? "bg-ref-yellow text-black" :
          syncStatus === "synced" ? "bg-emerald-700 text-white" :
          syncStatus === "failed" ? "bg-ref-red text-white" : "bg-black text-white"
        }`}>
          <span>WALRUS SYNC: {syncStatus}</span>
          {syncStatus === "syncing" && <RefreshCw size={10} className="animate-spin" />}
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t-4 border-black flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || !!pendingBet}
          placeholder={pendingBet ? "Resolve the pending bet above..." : "Propose a bet (e.g. Put 2 SUI on France)..."}
          className="flex-1 neo-input text-xs"
        />
        <button
          type="submit"
          disabled={loading || !input.trim() || !!pendingBet}
          className="neo-button !bg-ref-yellow hover:!bg-black hover:!text-ref-yellow disabled:!bg-stone-300 disabled:!text-stone-500 disabled:!cursor-not-allowed border-4 border-black"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

// Helpers to format simple Markdown bold (**) and italic (*) in message texts
function formatMessageText(text) {
  if (!text) return "";
  
  // Split by bold patterns (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold">
          {formatItalics(boldText)}
        </strong>
      );
    }
    return <span key={index}>{formatItalics(part)}</span>;
  });
}

function formatItalics(text) {
  if (!text) return "";
  const parts = text.split(/(\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
