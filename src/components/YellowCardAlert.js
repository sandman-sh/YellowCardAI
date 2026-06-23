"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function YellowCardAlert({ trigger, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      setVisible(true);
      // Play a referee whistle synth sound using Web Audio API!
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Double whistle blast!
        const playBlast = (time, duration) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, time);
          osc.frequency.exponentialRampToValueAtTime(1000, time + duration);
          
          gain.gain.setValueAtTime(0.3, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(time);
          osc.stop(time + duration);
        };

        playBlast(audioCtx.currentTime, 0.15);
        playBlast(audioCtx.currentTime + 0.2, 0.25);
      } catch (e) {
        console.warn("Audio Context not supported or allowed:", e);
      }

      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [trigger, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Screen Shake container */}
      <div className="relative p-6 flex flex-col items-center max-w-sm w-full mx-4 border-8 border-black bg-ref-yellow text-black text-center neo-shadow animate-bounce shadow-amber-300">
        
        {/* The Yellow Card representation */}
        <div className="w-24 h-36 bg-black border-4 border-black text-ref-yellow font-black text-4xl flex items-center justify-center transform rotate-6 mb-6 neo-shadow-white">
          🟨
        </div>

        <h2 className="text-3xl font-black uppercase tracking-tight leading-none mb-2">
          YELLOW CARD!
        </h2>

        <p className="text-sm font-bold uppercase tracking-widest bg-black text-ref-yellow px-2 py-1 mb-4 border-2 border-black">
          TILT DETECTED BY REFEREE
        </p>

        <p className="font-bold text-xs leading-relaxed mb-6 border-t-2 border-black pt-4">
          "Emotional betting is a tactical foul. Your next bets must follow strict bankroll rules. Stop chasing losses!"
        </p>

        <button
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="w-full neo-button !bg-black !text-ref-yellow hover:!bg-white hover:!text-black text-sm font-black border-4 border-black"
        >
          ACKNOWLEDGE WARNING
        </button>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
