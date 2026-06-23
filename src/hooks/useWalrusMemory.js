"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

const DEFAULT_STATE = {
  bets: [],
  totalBets: 0,
  winRate: 0,
  recentLossesCount: 0,
  emotionalState: "STABLE",
  tiltWarningCount: 0,
  lastUpdated: null
};

export function useWalrusMemory() {
  const account = useCurrentAccount();
  
  const [memory, setMemory] = useState(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle' | 'fetching' | 'syncing' | 'synced' | 'failed'
  const [blobId, setBlobId] = useState(null);
  const [txSignature, setTxSignature] = useState(null); // preserved for compatibility, remains null in backend-mode
  
  // Load local storage fallback
  const getLocalFallback = useCallback((address) => {
    try {
      const stored = localStorage.getItem(`yellowcard_mem_${address}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to read local memory fallback:", e);
    }
    return DEFAULT_STATE;
  }, []);

  // Save to local storage fallback
  const saveLocalFallback = useCallback((address, state) => {
    try {
      localStorage.setItem(`yellowcard_mem_${address}`, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to write local memory fallback:", e);
    }
  }, []);

  // Read memory from Walrus via backend API
  const readMemory = useCallback(async () => {
    if (!account) return DEFAULT_STATE;
    
    setIsLoading(true);
    setSyncStatus("fetching");
    
    try {
      const response = await fetch(`/api/memory?address=${encodeURIComponent(account.address)}`);
      if (response.ok) {
        const data = await response.json();
        setMemory(data.memory);
        setBlobId(data.blobId);
        setSyncStatus("synced");
        saveLocalFallback(account.address, data.memory);
        setIsLoading(false);
        return data.memory;
      }
    } catch (error) {
      console.error("Error reading Walrus memory from backend:", error);
    }

    // Fallback: local storage or default
    const local = getLocalFallback(account.address);
    setMemory(local);
    setSyncStatus(local.lastUpdated ? "idle" : "synced");
    setIsLoading(false);
    return local;
  }, [account, getLocalFallback, saveLocalFallback]);

  // Update memory via backend API
  const updateMemory = useCallback(async (newBetsList, aiAnalysis) => {
    if (!account) {
      throw new Error("Sui Wallet not connected");
    }

    setSyncStatus("syncing");
    
    // Construct the new state
    const wins = newBetsList.filter(b => b.outcome === "Win").length;
    const losses = newBetsList.filter(b => b.outcome === "Loss").length;
    const winRate = newBetsList.length > 0 ? (wins / newBetsList.length) * 100 : 0;
    
    // Count consecutive losses in the most recent bets
    let consecutiveLosses = 0;
    for (let i = newBetsList.length - 1; i >= 0; i--) {
      if (newBetsList[i].outcome === "Loss") {
        consecutiveLosses++;
      } else if (newBetsList[i].outcome === "Win") {
        break; // stop counting if they won
      }
    }

    const updatedState = {
      bets: newBetsList,
      totalBets: newBetsList.length,
      winRate: Math.round(winRate),
      recentLossesCount: consecutiveLosses,
      emotionalState: aiAnalysis.emotionalState || "STABLE",
      tiltWarningCount: aiAnalysis.isTilt ? (memory.tiltWarningCount || 0) + 1 : (memory.tiltWarningCount || 0),
      lastUpdated: new Date().toISOString()
    };

    // Optimistically update local UI and fallback storage
    setMemory(updatedState);
    saveLocalFallback(account.address, updatedState);

    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account.address,
          memory: updatedState
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save memory to backend");
      }

      const data = await response.json();
      setBlobId(data.blobId);
      setSyncStatus("synced");
      return { blobId: data.blobId };

    } catch (err) {
      console.error("Failed on-chain memory sync on Sui:", err);
      setSyncStatus("failed");
      return null;
    }
  }, [account, memory, saveLocalFallback]);

  // Run initial fetch when wallet changes
  useEffect(() => {
    if (account) {
      readMemory();
    } else {
      setMemory(DEFAULT_STATE);
      setBlobId(null);
      setTxSignature(null);
      setSyncStatus("idle");
    }
  }, [account, readMemory]);

  return {
    memory,
    isLoading,
    syncStatus,
    blobId,
    txSignature,
    readMemory,
    updateMemory
  };
}
