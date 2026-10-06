"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Smartphone, Monitor, Volume2, VolumeX, Sliders, ExternalLink } from "lucide-react";
import { soundFX } from "@/lib/audio";

interface MobileFrameProps {
  children: React.ReactNode;
  activeScreen?: string;
  onNavigateScreen?: (screen: any) => void;
  onAndroidBack?: () => void;
  onAndroidHome?: () => void;
}

export function MobileFrame({
  children,
  activeScreen,
  onNavigateScreen,
  onAndroidBack,
  onAndroidHome,
}: MobileFrameProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullView, setIsFullView] = useState(false);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  const screens = [
    { id: "login", label: "1. Masuk" },
    { id: "otp", label: "2. OTP" },
    { id: "home", label: "3. Beranda" },
    { id: "sessions", label: "4. Sesi" },
    { id: "catalog", label: "5. Katalog" },
    { id: "detail", label: "6. Live Bidding" },
  ];

  return (
    <div className="min-h-screen bg-[#070A11] flex flex-col items-center justify-center p-0 md:p-4 text-slate-100 relative selection:bg-blue-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Desktop Navigation & Controls Bar */}
      <header className="hidden md:flex w-full max-w-5xl items-center justify-between mb-3 px-4 py-2.5 rounded-2xl glass-panel z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0066D6] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
            BP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide text-white">Bidding Plus</span>
              <span className="text-[10px] text-blue-400 font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                1:1 Exact Mobile UI
              </span>
            </div>
          </div>
        </div>

        {/* Quick Screen Jump Pills */}
        {onNavigateScreen && (
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {screens.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigateScreen(s.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  activeScreen === s.id
                    ? "bg-[#0066D6] text-white shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullView(!isFullView)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition cursor-pointer"
            title="Toggle Device Frame"
          >
            {isFullView ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span>Device Frame</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>Responsive</span>
              </>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#0066D6] hover:bg-[#0055B8] text-white shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>CMS Admin</span>
          </Link>
        </div>
      </header>

      {/* Main Content: Phone Frame on Desktop or 100% on Mobile */}
      <main
        className={`w-full transition-all duration-300 relative z-10 flex justify-center ${
          isFullView
            ? "max-w-md h-[94vh] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
            : "max-w-[390px] md:h-[820px] md:rounded-[44px] md:border-[10px] md:border-[#1E293B] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] md:ring-1 md:ring-slate-700/60"
        } h-screen bg-white flex flex-col overflow-hidden text-slate-800`}
      >
        {/* Android Status Bar (Exact matching Screenshots: 11:20, VoLTE, Wifi, Battery) */}
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-semibold select-none z-40 bg-[#0066D6] text-white">
          <span>11:20</span>
          <div className="flex items-center gap-1 text-[10px] font-sans">
            <span className="scale-75 origin-right">🔔</span>
            <span className="font-mono text-[9px] font-bold">Vo) LTE1</span>
            <span className="text-[10px]">📶</span>
            <span className="font-mono text-[9px] font-bold">4.5G</span>
            <div className="flex items-center gap-0.5 border border-white/60 rounded px-1 py-0.2 text-[8px] font-bold">
              <span>72</span>
            </div>
          </div>
        </div>

        {/* Child Screen Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
          {children}
        </div>

        {/* Android Navigation Bar (Bottom: |||  O  < matching Screenshots) */}
        <div className="bg-black py-2 px-10 flex items-center justify-between text-white/70 select-none shrink-0 z-40">
          {/* Recent Apps */}
          <button
            onClick={() => onNavigateScreen && onNavigateScreen("home")}
            className="p-1 hover:text-white transition active:scale-90 cursor-pointer"
            title="Recent Apps"
          >
            <div className="flex gap-0.5 text-xs font-bold tracking-tighter">
              <span>|</span>
              <span>|</span>
              <span>|</span>
            </div>
          </button>

          {/* Home */}
          <button
            onClick={onAndroidHome || (() => onNavigateScreen && onNavigateScreen("home"))}
            className="p-1 hover:text-white transition active:scale-90 cursor-pointer"
            title="Home"
          >
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/80" />
          </button>

          {/* Back */}
          <button
            onClick={onAndroidBack}
            className="p-1 hover:text-white transition active:scale-90 cursor-pointer"
            title="Back"
          >
            <span className="text-sm font-bold">&lt;</span>
          </button>
        </div>
      </main>
    </div>
  );
}
