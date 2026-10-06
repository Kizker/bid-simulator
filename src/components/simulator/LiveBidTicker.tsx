"use client";

import React from "react";
import { Bot, User, ArrowUp, Activity, CheckCircle2 } from "lucide-react";
import type { Bid } from "@/db/schema";

interface LiveBidTickerProps {
  bids: Bid[];
  currentUserName: string;
}

export function LiveBidTicker({ bids, currentUserName }: LiveBidTickerProps) {
  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 3) return "Baru saja";
    if (diff < 60) return `${diff}d lalu`;
    const mins = Math.floor(diff / 60);
    return `${mins}m lalu`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0D16]">
      {/* Feed Section Title */}
      <div className="px-4 py-2 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400 bg-[#0E1320]/60">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Aktivitas Penawaran Live</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {bids.length} Riwayat
        </span>
      </div>

      {/* Scrolling List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 select-text">
        {bids.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
            <Activity className="w-8 h-8 text-slate-700 mb-2 animate-bounce" />
            <p className="font-semibold text-slate-400">Belum Ada Penawaran</p>
            <p className="text-[11px] mt-1 text-slate-500">
              Tekan tombol bid di bawah untuk mengawali lelang ini!
            </p>
          </div>
        ) : (
          bids.map((bid, index) => {
            const isUser = bid.bidderName === currentUserName;
            const isLatest = index === 0;
            const delta = bid.amount - bid.previousAmount;

            return (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 border ${
                  isLatest
                    ? isUser
                      ? "bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/50"
                      : "bg-amber-950/30 border-amber-500/40 shadow-sm"
                    : isUser
                    ? "bg-slate-900/90 border-slate-700/80"
                    : "bg-slate-900/50 border-slate-800/60"
                }`}
              >
                {/* Left: Avatar & Bidder Info */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : bid.bidderType === "BOT"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    }`}
                  >
                    {bid.bidderType === "BOT" ? (
                      <Bot className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold truncate max-w-[120px] ${
                          isUser ? "text-emerald-300" : "text-slate-200"
                        }`}
                      >
                        {bid.bidderName} {isUser && "(Kamu)"}
                      </span>
                      {isLatest && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Memimpin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {formatTime(bid.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right: Amount & Delta */}
                <div className="flex flex-col items-end">
                  <span
                    className={`font-mono text-xs font-extrabold ${
                      isLatest ? "text-amber-300" : "text-slate-300"
                    }`}
                  >
                    Rp {bid.amount.toLocaleString("id-ID")}
                  </span>
                  {delta > 0 && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center">
                      <ArrowUp className="w-2.5 h-2.5 inline mr-0.5" />
                      +{delta.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
