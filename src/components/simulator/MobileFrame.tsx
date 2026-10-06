"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Smartphone, Monitor, Volume2, VolumeX, ShieldAlert, Sliders } from "lucide-react";
import { soundFX } from "@/lib/audio";

interface MobileFrameProps {
  children: React.ReactNode;
  roomTitle?: string;
}

export function MobileFrame({ children, roomTitle }: MobileFrameProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullView, setIsFullView] = useState(false);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.setMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-[#070A10] flex flex-col items-center justify-center p-0 md:p-6 text-slate-100 relative selection:bg-amber-500">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Desktop Navigation & Controls Bar */}
      <header className="hidden md:flex w-full max-w-5xl items-center justify-between mb-4 px-4 py-2 rounded-2xl glass-panel z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-extrabold text-sm shadow-lg shadow-amber-500/20">
            BP
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-wide text-white">BidPulse</span>
            <span className="ml-2 text-xs text-amber-400 font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              Mobile Simulator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFullView(!isFullView)}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition"
            title="Toggle Desktop Frame vs Full View"
          >
            {isFullView ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>Device Frame</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>Responsive View</span>
              </>
            )}
          </button>

          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400">Suara Mati</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Audio Aktif</span>
              </>
            )}
          </button>

          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Buka CMS Controller</span>
          </Link>
        </div>
      </header>

      {/* Main Content: Phone Frame on Desktop or 100% on Mobile */}
      <main
        className={`w-full transition-all duration-300 relative z-10 flex justify-center ${
          isFullView
            ? "max-w-md h-[92vh] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl"
            : "max-w-[420px] md:h-[860px] md:rounded-[48px] md:border-[10px] md:border-[#1F2937] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] md:ring-1 md:ring-slate-700/50"
        } h-screen bg-[#0A0D15] flex flex-col overflow-hidden`}
      >
        {/* Dynamic Island / Speaker Notch (Desktop frame only) */}
        {!isFullView && (
          <div className="hidden md:flex absolute top-2 inset-x-0 justify-center z-50 pointer-events-none">
            <div className="w-28 h-5 bg-black rounded-full flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>
          </div>
        )}

        {/* Mobile Status Bar (Simulated on desktop) */}
        <div className="hidden md:flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-slate-400 select-none z-40 bg-gradient-to-b from-black/60 to-transparent">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono tracking-tighter">5G</span>
            <div className="w-5 h-2.5 rounded-sm border border-slate-500 p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>

        {/* Child content: Full mobile viewport */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
}
