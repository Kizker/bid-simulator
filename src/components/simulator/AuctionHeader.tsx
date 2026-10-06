"use client";

import React from "react";
import { Users, Clock, Flame, AlertTriangle } from "lucide-react";
import type { AuctionRoom } from "@/db/schema";

interface AuctionHeaderProps {
  room: AuctionRoom;
  timeRemaining: number;
}

export function AuctionHeader({ room, timeRemaining }: AuctionHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isUrgent = timeRemaining <= 10 && room.status === "ACTIVE";
  const isEnding = timeRemaining <= 30 && room.status === "ACTIVE";

  return (
    <div className="px-4 py-3 bg-[#0B0F19]/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center justify-between mb-1.5">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {room.status === "ACTIVE" && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              LIVE
            </span>
          )}
          {room.status === "PAUSED" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              PAUSED
            </span>
          )}
          {room.status === "UPCOMING" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
              UPCOMING
            </span>
          )}
          {room.status === "ENDED" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40">
              SOLD / ENDED
            </span>
          )}

          <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800/60 border border-slate-700/50">
            {room.category}
          </span>
        </div>

        {/* Live Viewer Count */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded-full">
          <Users className="w-3 h-3 text-slate-400" />
          <span className="font-mono text-[11px]">86 Menonton</span>
        </div>
      </div>

      {/* Title & Countdown Timer Row */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-sm font-bold text-white truncate max-w-[210px]" title={room.title}>
          {room.title}
        </h1>

        {/* Countdown Timer Display */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all ${
            isUrgent
              ? "bg-rose-500/25 border-2 border-rose-500 text-rose-300 animate-pulse-fast shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              : isEnding
              ? "bg-amber-500/20 border border-amber-500/60 text-amber-300"
              : "bg-slate-800/80 border border-slate-700/60 text-slate-200"
          }`}
        >
          {isUrgent ? (
            <Flame className="w-4 h-4 text-rose-400 animate-bounce" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="font-mono text-base font-extrabold tracking-wider">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Anti-Sniping Alert Banner (When urgent) */}
      {isUrgent && (
        <div className="mt-2 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-rose-950/60 border border-rose-600/50 text-[11px] font-bold text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Detik Kritis: Tawaran baru akan menambah +15 detik!</span>
        </div>
      )}
    </div>
  );
}
