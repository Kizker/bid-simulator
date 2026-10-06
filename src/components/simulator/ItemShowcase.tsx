"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Crown, AlertCircle, ArrowUpRight, Sparkles } from "lucide-react";
import type { AuctionRoom } from "@/db/schema";

interface ItemShowcaseProps {
  room: AuctionRoom;
  userName: string;
}

export function ItemShowcase({ room, userName }: ItemShowcaseProps) {
  const [isPriceChanged, setIsPriceChanged] = useState(false);

  useEffect(() => {
    setIsPriceChanged(true);
    const timer = setTimeout(() => setIsPriceChanged(false), 800);
    return () => clearTimeout(timer);
  }, [room.currentPrice]);

  const isUserWinning = room.highestBidderName === userName;
  const isUserOutbid = !isUserWinning && room.highestBidderName !== null && room.totalBids > 0;

  return (
    <div className="relative flex flex-col bg-[#0F1422] border-b border-slate-800/80">
      {/* Product Image Frame */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-950">
        <img
          src={room.imageUrl}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {/* Soft bottom vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1422] via-transparent to-black/30" />

        {/* Floating Top Left Category Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Lot Premium</span>
        </div>

        {/* Floating Top Right Bid Counter Tag */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/60">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>{room.totalBids} Penawaran</span>
        </div>
      </div>

      {/* Pricing & High Bidder Banner */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Penawaran Tertinggi Saat Ini
          </span>
          <span className="text-[11px] text-slate-400">
            Kelipatan: <strong className="text-slate-300">Rp {room.bidIncrement.toLocaleString("id-ID")}</strong>
          </span>
        </div>

        {/* Main Price Highlight */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-amber-400">Rp</span>
          <span
            className={`font-mono text-3xl font-extrabold tracking-tight transition-all duration-300 ${
              isPriceChanged
                ? "text-emerald-400 scale-105"
                : "text-white scale-100"
            }`}
          >
            {room.currentPrice.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Dynamic User Status Banner */}
        {room.totalBids === 0 ? (
          <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Belum ada penawaran. Jadilah penawar pertama!</span>
          </div>
        ) : isUserWinning ? (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs font-bold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-pulse">
            <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex-1 truncate">
              <span>Posisi Kamu: </span>
              <span className="text-white underline">PENAWAR TERTINGGI!</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs font-semibold text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="flex-1 truncate">
              <span>Tertinggi: </span>
              <strong className="text-white">{room.highestBidderName}</strong>
              <span className="text-slate-400 text-[10px] ml-1">
                ({room.highestBidderType === "BOT" ? "Peserta AI" : "User"})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
