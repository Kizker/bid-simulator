"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Clock, Minus, Plus } from "lucide-react";
import type { AuctionRoom, Bid } from "@/db/schema";
import { soundFX } from "@/lib/audio";

interface LiveDetailScreenProps {
  room: AuctionRoom;
  bids: Bid[];
  timeRemaining: number;
  onBack: () => void;
  onPlaceBid: (amount: number) => void;
  isSubmitting?: boolean;
}

export function LiveDetailScreen({
  room,
  bids,
  timeRemaining,
  onBack,
  onPlaceBid,
  isSubmitting = false,
}: LiveDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<"deskripsi" | "spesifikasi">("deskripsi");

  // Step slider multiplier (1 = +1 increment, 2 = +2 increments, etc.)
  const [stepCount, setStepCount] = useState<number>(1);

  // Minimum bid is currentPrice + bidIncrement
  const increment = room.bidIncrement || 50000;
  const targetBidPrice = room.currentPrice + increment * stepCount;
  const selisihTotal = increment * stepCount;

  // Format time (e.g., "12 Jam 34 Menit" or "00:45")
  const formatTimer = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} Jam ${minutes} Menit`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const handleDecrement = () => {
    if (stepCount > 1) {
      setStepCount((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (stepCount < 10) {
      setStepCount((prev) => prev + 1);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStepCount(Number(e.target.value));
  };

  const handleTawar = () => {
    if (isSubmitting) return;
    soundFX.playBidSuccess();
    onPlaceBid(targetBidPrice);
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-800 select-none overflow-hidden justify-between">
      {/* Top Header (Matching Screenshot 6) */}
      <div className="bg-[#0066D6] px-4 py-3.5 flex items-center justify-between text-white shadow-sm shrink-0">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h2 className="text-base font-bold tracking-tight text-white flex-1 text-center pr-6">
          Bidding Reguler
        </h2>
      </div>

      {/* Scrollable Product Details & Live Stream */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
        {/* Product Image Showcase */}
        <div className="w-full h-52 flex items-center justify-center bg-white p-2">
          <img
            src={room.imageUrl}
            alt={room.title}
            className="h-full object-contain drop-shadow-md"
          />
        </div>

        {/* Product Title & Starting Price Info */}
        <div className="space-y-1">
          <h1 className="text-sm font-bold text-slate-900 leading-snug">
            {room.title} {room.subtitle || "SoftCase Red"}
          </h1>

          <div className="flex items-start justify-between pt-1">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#0284C7]">
                Harga Mulai : IDR {room.startingPrice.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-slate-600">Stok : {room.stock || 1}</p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-semibold text-[#16A34A]">
                {room.condition || "Fullset"}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#0284C7] border border-[#0284C7] bg-[#0284C7]/5">
                {lotBadgeLabel(room.lotBadge)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs: Deskripsi vs Spesifikasi */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setActiveTab("deskripsi")}
            className={`py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
              activeTab === "deskripsi"
                ? "border-[#0066D6] text-[#0066D6] bg-blue-50/50 shadow-xs"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Deskripsi
          </button>

          <button
            onClick={() => setActiveTab("spesifikasi")}
            className={`py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
              activeTab === "spesifikasi"
                ? "border-[#16A34A] text-[#16A34A] bg-emerald-50/50 shadow-xs"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Spesifikasi
          </button>
        </div>

        {/* Tab Content Preview */}
        {activeTab === "deskripsi" ? (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {room.description ||
              "Unit iPhone SE 2020 kondisi fisik mulus sesuai grade Scrapt/Standart, kelengkapan fullset box dan charger. Garansi fungsi 7 hari."}
          </p>
        ) : (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {room.specs ||
              "Kapasitas 128GB, Battery Health 85%, All Operator, Kamera Jernih, iCloud Clean siap reset."}
          </p>
        )}

        {/* Section: Penawaran (Bidding History / Live Feed) */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Penawaran</h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          </div>

          {/* Live Stream Bids Rows */}
          <div className="space-y-2">
            {bids.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Belum ada penawaran. Masukkan tawaran awal Anda!
              </div>
            ) : (
              bids.map((b, idx) => {
                const isKamu = b.bidderName === "Kamu";
                return (
                  <div
                    key={b.id || idx}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <span
                      className={`font-bold ${
                        isKamu ? "text-[#0066D6]" : "text-[#16A34A]"
                      }`}
                    >
                      {b.bidderName}
                    </span>
                    <span
                      className={`font-bold ${
                        isKamu ? "text-[#0066D6]" : "text-[#16A34A]"
                      }`}
                    >
                      IDR {b.amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Bidding Control Panel (1:1 with Screenshot 6) */}
      <div className="border-t border-slate-200 bg-white p-4 pt-3 flex flex-col items-center gap-2 shadow-2xl shrink-0">
        {/* Main Target Price Display */}
        <div className="text-center">
          <p className="text-base font-bold text-slate-900">
            IDR {targetBidPrice.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] font-semibold text-[#0066D6]">
            Selisih IDR {selisihTotal.toLocaleString("id-ID")}
          </p>
        </div>

        {/* Step Slider with [-] and [+] Buttons */}
        <div className="w-full flex items-center gap-3 px-2 py-1">
          {/* Minus Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={stepCount <= 1}
            className="w-8 h-8 rounded-lg border-2 border-[#0066D6] flex items-center justify-center text-[#0066D6] disabled:border-slate-300 disabled:text-slate-300 hover:bg-blue-50 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Range Slider */}
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={stepCount}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-[#0066D6]"
            />
          </div>

          {/* Plus Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={stepCount >= 10}
            className="w-8 h-8 rounded-lg border-2 border-[#0066D6] flex items-center justify-center text-[#0066D6] disabled:border-slate-300 disabled:text-slate-300 hover:bg-blue-50 transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* CTA Button "Tawar" */}
        <button
          type="button"
          onClick={handleTawar}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-[#0066D6] hover:bg-[#0055B8] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer text-center mt-1"
        >
          {isSubmitting ? "Mengirimkan Tawaran..." : "Tawar"}
        </button>
      </div>
    </div>
  );
}

function lotBadgeLabel(badge?: string) {
  if (!badge) return "(AI) SCRAPT";
  return badge;
}
