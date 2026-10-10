"use client";

import React, { useState } from "react";
import { Gavel, Plus, Sparkles, User, AlertCircle } from "lucide-react";
import type { AuctionRoom } from "@/db/schema";

interface StickyBidControlsProps {
  room: AuctionRoom;
  userName: string;
  onUpdateUserName: (name: string) => void;
  onPlaceBid: (amount: number) => void;
  isSubmitting?: boolean;
}

export function StickyBidControls({
  room,
  userName,
  onUpdateUserName,
  onPlaceBid,
  isSubmitting = false,
}: StickyBidControlsProps) {
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const isUserHighest = room.highestBidderName === userName;
  const isAuctionActive = room.status === "ACTIVE";

  // Calculate target bid amount based on current multiplier
  const nextBidAmount = room.currentPrice + room.bidIncrement * selectedMultiplier;

  const handleBidClick = () => {
    if (!isAuctionActive || isUserHighest || isSubmitting) return;

    onPlaceBid(nextBidAmount);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateUserName(tempName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="bg-[#0B0F19] border-t border-slate-800/80 p-3 pt-2 flex flex-col gap-2 shadow-2xl relative z-40">
      {/* Top Bar: User Identity & Multipliers */}
      <div className="flex items-center justify-between gap-2">
        {/* User Identity Chip */}
        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center gap-1">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-slate-800 text-xs px-2 py-1 rounded border border-amber-500/50 text-white w-24 outline-none"
              autoFocus
              maxLength={15}
            />
            <button
              type="submit"
              className="text-[10px] bg-amber-500 text-black font-bold px-2 py-1 rounded"
            >
              Simpan
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[11px] text-slate-300 transition"
            title="Ganti nama penawar Anda"
          >
            <User className="w-3 h-3 text-amber-400" />
            <span className="font-medium truncate max-w-[90px]">{userName}</span>
            <span className="text-[10px] text-slate-500">✎</span>
          </button>
        )}

        {/* Quick Increment Multipliers */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
          {[1, 2, 5].map((multiplier) => {
            const isSelected = selectedMultiplier === multiplier;
            return (
              <button
                key={multiplier}
                type="button"
                onClick={() => setSelectedMultiplier(multiplier)}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md transition ${
                  isSelected
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                +{multiplier}x
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Big CTA Button */}
      <button
        type="button"
        id="btn-place-bid"
        onClick={handleBidClick}
        disabled={!isAuctionActive || isUserHighest || isSubmitting}
        className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-between transition-all duration-200 active:scale-[0.98] ${
          !isAuctionActive
            ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
            : isUserHighest
            ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black shadow-lg shadow-amber-500/25 border border-amber-300"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              !isAuctionActive
                ? "bg-slate-700/50 text-slate-400"
                : isUserHighest
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-black/15 text-black"
            }`}
          >
            <Gavel className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] uppercase tracking-wider font-extrabold leading-tight">
              {!isAuctionActive
                ? room.status === "ENDED"
                  ? "Lelang Selesai"
                  : "Menunggu Dimulai"
                : isUserHighest
                ? "Kamu Tertinggi!"
                : "Tawar Sekarang"}
            </span>
            <span className="text-[10px] opacity-80">
              {isUserHighest
                ? "Pertahankan posisimu"
                : `+Rp ${(room.bidIncrement * selectedMultiplier).toLocaleString("id-ID")}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-mono text-base font-extrabold tracking-tight">
            Rp {nextBidAmount.toLocaleString("id-ID")}
          </span>
        </div>
      </button>
    </div>
  );
}
