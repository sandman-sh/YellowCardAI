"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
import dynamic from "next/dynamic";
import { ShieldAlert, TrendingUp, Layers, Brain, Zap, ArrowRight, ChevronDown, Activity, Eye, Lock, BarChart3 } from "lucide-react";

const ConnectButtonDynamic = dynamic(
  async () => (await import("@mysten/dapp-kit")).ConnectButton,
  { ssr: false }
);

export default function LandingPage() {
  const account = useCurrentAccount();
  const connected = !!account;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Animated counters
  const [countBets, setCountBets] = useState(0);
  const [countCards, setCountCards] = useState(0);
  const [countSaved, setCountSaved] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);



  // Animate counters on mount
  useEffect(() => {
    if (!mounted) return;
    const targets = { bets: 12847, cards: 3291, saved: 847 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCountBets(Math.floor(targets.bets * ease));
      setCountCards(Math.floor(targets.cards * ease));
      setCountSaved(Math.floor(targets.saved * ease));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [mounted]);

  // ── Scroll-triggered reveal via IntersectionObserver ──
  useEffect(() => {
    if (!mounted) return;
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-pitch-green text-white relative overflow-hidden">
      {/* ─── PITCH GRID BACKGROUND ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Pitch dot pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(28,92,60,0.6) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-white/[0.07]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/[0.07]" />
        {/* Center line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/[0.05]" />
        {/* Penalty arcs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] border-b-2 border-white/[0.05] rounded-b-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] border-t-2 border-white/[0.05] rounded-t-full" />
      </div>

      {/* ─── OUTER BOLD FRAME ─── */}
      <div className="fixed inset-0 pointer-events-none border-[10px] border-black z-40" />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── SECTION 1: HEADER / NAVIGATION ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <header className="relative z-30 w-full px-6 md:px-12 py-5 anim-fade-in-down">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-13 bg-ref-yellow border-[3px] border-black transform rotate-6 flex items-center justify-center neo-shadow">
                <span className="text-black font-black text-sm transform -rotate-6">YC</span>
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-2xl tracking-[-0.06em] text-white">
                YELLOWCARD
              </span>
              <span className="font-black text-xs tracking-[0.3em] text-ref-yellow">
                AI REFEREE
              </span>
            </div>
          </div>

          {/* Nav Links + Connect */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-widest text-white/60">
              <a href="#how-it-works" className="hover:text-ref-yellow transition-colors link-underline">How It Works</a>
              <a href="#features" className="hover:text-ref-yellow transition-colors link-underline">Features</a>
              {connected && (
                <button 
                  onClick={() => router.push("/dashboard")} 
                  className="hover:text-ref-yellow transition-colors link-underline cursor-pointer uppercase font-black bg-transparent border-0 text-white/60"
                >
                  Dashboard
                </button>
              )}
            </nav>
            <div className="border-4 border-black neo-shadow-yellow">
              <ConnectButtonDynamic />
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── SECTION 2: HERO ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative z-20 w-full px-6 md:px-12 pt-12 md:pt-20 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* ── LEFT: Copy ── */}
          <div className="lg:col-span-7 flex flex-col gap-8 anim-fade-in-left delay-200">
            {/* Badge */}
            <div className="flex items-center gap-3">
              <div className="bg-ref-red text-white font-black text-[11px] tracking-[0.2em] px-4 py-2 border-4 border-black uppercase neo-shadow inline-flex items-center gap-2">
                <Lock size={12} />
                NO TILT ZONE
              </div>
              <div className="hidden sm:block h-[3px] w-16 bg-ref-yellow" />
              <span className="hidden sm:inline text-ref-yellow text-[11px] font-black tracking-[0.15em] uppercase">FIFA World Cup 2026</span>
            </div>

            {/* Headline */}
            <div className="anim-fade-in-up delay-300">
              <h1 className="text-[3.2rem] md:text-[5.5rem] lg:text-[6.5rem] font-black leading-[0.88] tracking-[-0.04em] uppercase">
                <span className="text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">Stop</span>
                <br />
                <span className="text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">The </span>
                <span className="text-ref-yellow drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">Tilt.</span>
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-12 h-1 bg-ref-yellow" />
                <p className="text-white/50 font-black text-xs tracking-[0.2em] uppercase">Protect Your Bankroll</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl font-bold text-white/70 max-w-lg leading-relaxed anim-fade-in-up delay-500">
              The <span className="text-ref-yellow">AI Copilot</span> that remembers your betting history{" "}
              <span className="text-white underline decoration-ref-yellow decoration-4 underline-offset-4">on-chain</span>{" "}
              and issues a YellowCard when you're betting with your emotions.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 items-start anim-fade-in-up delay-600">
              {connected ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="neo-button !bg-ref-yellow !text-black hover:!bg-white hover:!text-black !h-14 !px-10 !text-base flex items-center gap-2 border-4 border-black neo-shadow-yellow transition-all font-black uppercase cursor-pointer"
                >
                  GO TO DASHBOARD
                  <ArrowRight size={16} />
                </button>
              ) : (
                <div className="border-4 border-black neo-shadow-yellow group">
                  <ConnectButtonDynamic className="!bg-ref-yellow !text-black !font-black !rounded-none !border-0 !h-14 !px-10 !text-base hover:!bg-white !transition-all" />
                </div>
              )}
              <a
                href="#how-it-works"
                className="neo-button !bg-black !text-white hover:!bg-ref-yellow hover:!text-black !h-14 !px-8 !text-sm flex items-center gap-2 border-4 border-white/20 hover:!border-black transition-all"
              >
                HOW IT WORKS
                <ArrowRight size={16} />
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-2 anim-fade-in delay-800">
              {["SUI BLOCKCHAIN", "WALRUS MEMORY", "OPENROUTER AI", "LIVE MATCH DATA"].map((t) => (
                <span key={t} className="text-[9px] font-black tracking-[0.15em] uppercase text-white/30 border border-white/10 px-3 py-1.5 hover:text-ref-yellow hover:border-ref-yellow/30 transition-colors cursor-default">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Giant Yellow Card Visual ── */}
          <div className="lg:col-span-5 flex justify-center items-center relative anim-fade-in-right delay-400">
            {/* Main Yellow Card */}
            <div className="relative group">
              {/* Glow */}
              <div className="absolute -inset-4 bg-ref-yellow/10 blur-3xl rounded-3xl group-hover:bg-ref-yellow/20 transition-all duration-700" />

              <div className="relative w-[280px] md:w-[320px] h-[400px] md:h-[460px] bg-ref-yellow border-[6px] border-black neo-shadow flex flex-col items-center justify-between p-8 transform hover:rotate-0 rotate-3 transition-transform duration-500 anim-pulse-glow anim-float-slow">
                {/* Top: Referee Badge */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-black text-ref-yellow text-[10px] font-black tracking-[0.2em] px-3 py-1.5 uppercase">
                      REFEREE
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-black" />
                      <div className="w-2 h-2 bg-black" />
                      <div className="w-2 h-2 bg-ref-red border border-black" />
                    </div>
                  </div>
                  <div className="w-full h-[3px] bg-black" />
                </div>

                {/* Center: Large Icon */}
                <div className="flex flex-col items-center gap-4 my-6">
                  <div className="text-7xl md:text-8xl leading-none select-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
                    🟨
                  </div>
                  <div className="bg-black text-ref-yellow font-black text-2xl md:text-3xl tracking-[-0.03em] px-5 py-2 text-center uppercase">
                    CAUTION
                  </div>
                </div>

                {/* Bottom: Rule */}
                <div className="w-full">
                  <div className="w-full h-[3px] bg-black mb-3" />
                  <p className="text-black text-[10px] font-black text-center leading-relaxed uppercase tracking-wide">
                    Emotional Betting Detected
                  </p>
                  <p className="text-black/60 text-[9px] font-bold text-center mt-1">
                    Rule §4.2 — Consecutive loss threshold exceeded
                  </p>
                </div>
              </div>

              {/* Floating Red Card (behind) */}
              <div className="absolute -bottom-6 -left-12 w-[100px] h-[140px] bg-ref-red border-4 border-black transform -rotate-12 neo-shadow flex flex-col items-center justify-center gap-2 z-[-1] opacity-80 anim-float-reverse anim-pulse-glow-red">
                <span className="text-3xl select-none">🟥</span>
                <span className="text-white text-[8px] font-black tracking-widest uppercase">EJECTED</span>
              </div>

              {/* Floating stat chip */}
              <div className="absolute -top-5 -right-6 bg-black text-white border-4 border-black neo-shadow-yellow px-4 py-2 flex items-center gap-2 z-10 anim-float">
                <Activity size={14} className="text-ref-yellow" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase text-white/50">Tilt Level</span>
                  <span className="text-sm font-black text-ref-red">HIGH</span>
                </div>
              </div>

              {/* Floating chain chip */}
              <div className="absolute -bottom-4 -right-8 bg-white text-black border-4 border-black neo-shadow px-3 py-2 flex items-center gap-2 z-10 anim-float delay-500">
                <Layers size={12} className="text-pitch-green" />
                <span className="text-[9px] font-black uppercase tracking-wider">On-Chain</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2 text-white/30 anim-scroll-hint">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── SECTION 3: LIVE STATS BAR ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative z-20 bg-black border-y-4 border-black anim-shimmer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { label: "Bets Analyzed", value: countBets.toLocaleString(), icon: <Eye size={18} />, color: "text-ref-yellow" },
            { label: "Yellow Cards Issued", value: countCards.toLocaleString(), icon: <ShieldAlert size={18} />, color: "text-ref-red" },
            { label: "SUI Saved from Tilt", value: `${countSaved.toLocaleString()}+`, icon: <TrendingUp size={18} />, color: "text-emerald-400" }
          ].map((stat) => (
            <div key={stat.label} className="flex items-center justify-center gap-4 px-8 py-6">
              <div className={`${stat.color}`}>{stat.icon}</div>
              <div>
                <div className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── SECTION 4: HOW IT WORKS ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative z-20 w-full px-6 md:px-12 py-20 md:py-32 reveal">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-ref-yellow">How It Works</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mt-3 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                Three-Step<br /><span className="text-ref-yellow">VAR Review</span>
              </h2>
            </div>
            <p className="text-white/50 font-bold text-sm max-w-sm md:text-right">
              Every bet goes through our AI referee for a full VAR analysis before hitting the chain.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                num: "01",
                title: "PROPOSE",
                subtitle: "State Your Bet",
                desc: "Tell the referee what you want to bet — the team, amount, and match. The AI analyzes your language and bet sizing patterns in real-time.",
                icon: <Brain size={28} />,
                accent: "bg-ref-yellow",
                accentText: "text-black",
                shadowClass: "neo-shadow-yellow"
              },
              {
                num: "02",
                title: "ANALYZE",
                subtitle: "Walrus Memory Check",
                desc: "Your complete on-chain betting history is pulled from Walrus storage. Win rate, loss streaks, and emotional patterns are evaluated by the AI referee.",
                icon: <Eye size={28} />,
                accent: "bg-white",
                accentText: "text-black",
                shadowClass: "neo-shadow-white"
              },
              {
                num: "03",
                title: "VERDICT",
                subtitle: "Play On or Yellow Card",
                desc: "If tilt is detected — oversized bets, loss-chasing, emotional language — a Yellow Card is issued and the bet is blocked. Otherwise, play continues.",
                icon: <ShieldAlert size={28} />,
                accent: "bg-ref-red",
                accentText: "text-white",
                shadowClass: "neo-shadow-red"
              }
            ].map((step, i) => (
              <div key={step.num} className={`border-4 border-black ${i === 1 ? 'bg-pitch-green/50' : 'bg-black/60'} p-8 flex flex-col gap-6 relative group hover:bg-black transition-colors duration-300`}>
                {/* Step number */}
                <div className="flex items-center justify-between">
                  <span className="text-white/10 text-7xl font-black leading-none select-none group-hover:text-white/20 transition-colors">{step.num}</span>
                  <div className={`w-14 h-14 ${step.accent} ${step.accentText} border-4 border-black flex items-center justify-center ${step.shadowClass}`}>
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white">{step.title}</h3>
                  <span className="text-ref-yellow text-xs font-black uppercase tracking-[0.15em]">{step.subtitle}</span>
                </div>
                <p className="text-white/50 text-sm font-semibold leading-relaxed">{step.desc}</p>

                {/* Arrow connector (not on last) */}
                {i < 2 && (
                  <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-ref-yellow border-4 border-black items-center justify-center">
                    <ArrowRight size={16} className="text-black" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── SECTION 5: FEATURES GRID ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="features" className="relative z-20 w-full px-6 md:px-12 pb-20 md:pb-32 reveal">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-ref-yellow">Features</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mt-3 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              Built for <span className="text-ref-yellow">Discipline</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldAlert size={24} />,
                title: "Tilt Detection",
                desc: "Pattern analysis on bet size, frequency, and emotional language after consecutive losses.",
                color: "bg-ref-yellow text-black"
              },
              {
                icon: <Layers size={24} />,
                title: "Walrus On-Chain Memory",
                desc: "Your full bet ledger stored on decentralized Walrus blob storage, linked to Sui transactions.",
                color: "bg-ref-red text-white"
              },
              {
                icon: <BarChart3 size={24} />,
                title: "Live Match Data",
                desc: "Real-time 2026 World Cup fixtures and scores from OpenLigaDB, directly in your dashboard.",
                color: "bg-white text-black"
              },
              {
                icon: <Brain size={24} />,
                title: "AI Referee Brain",
                desc: "Powered by Llama 3 70B via OpenRouter. Every bet gets a full cognitive emotional analysis.",
                color: "bg-pitch-green text-white"
              }
            ].map((feat, i) => (
              <div key={feat.title} className="bg-black/60 border-4 border-black p-6 flex flex-col gap-4 hover:bg-black transition-all duration-300 group cursor-default hover:-translate-y-1" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`w-12 h-12 ${feat.color} border-[3px] border-black flex items-center justify-center neo-shadow group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white">{feat.title}</h3>
                <p className="text-white/40 text-sm font-semibold leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════════════════ */}
      {/* ─── FOOTER ─── */}
      {/* ═══════════════════════════════════════════════════════ */}
      <footer className="relative z-20 w-full px-6 md:px-12 py-8 border-t-4 border-black bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-8 bg-ref-yellow border-2 border-black transform rotate-6" />
            <span className="font-black text-sm text-white/50">
              YELLOWCARD AI © 2026
            </span>
          </div>

          {/* Center: tagline */}
          <p className="text-[10px] font-bold text-white/25 uppercase tracking-[0.15em] text-center">
            Designed in Bauhaus style for Walrus Agents World Cup
          </p>

          {/* Right: Links */}
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
            <a href="https://sui.io" target="_blank" rel="noopener noreferrer" className="hover:text-ref-yellow transition-colors link-underline">Sui</a>
            <a href="https://walrus.space" target="_blank" rel="noopener noreferrer" className="hover:text-ref-yellow transition-colors link-underline">Walrus</a>
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="hover:text-ref-yellow transition-colors link-underline">OpenRouter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
