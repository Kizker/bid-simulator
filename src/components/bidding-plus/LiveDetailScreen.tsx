"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Clock } from "lucide-react";
import type { AuctionRoom, Bid } from "@/db/schema";
import { BidResponseModal, type BidModalState } from "./BidResponseModal";
import { getSocketClient } from "@/lib/socket-client";

interface LiveDetailScreenProps {
  room: AuctionRoom;
  bids: Bid[];
  timeRemaining: number;
  onBack: () => void;
  onPlaceBid: (amount: number, clientPrice?: number) => void;
  isSubmitting?: boolean;
  bidModal?: BidModalState | null;
  onCloseBidModal?: () => void;
}

export function LiveDetailScreen({
  room,
  bids,
  timeRemaining,
  onBack,
  onPlaceBid,
  isSubmitting = false,
  bidModal,
  onCloseBidModal,
}: LiveDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<"deskripsi" | "spesifikasi" | null>(null);

  // Step slider multiplier (1 = +1 increment, 2 = +2 increments, etc.)
  const [stepCount, setStepCount] = useState<number>(1);

  // KETENTUAN USER: Semua selisih adalah kelipatan 20 ribu, hingga 420 ribu (21 step)
  const increment = 20000;
  // Maximum selisih up to IDR 420,000 (21 steps of 20,000)
  const maxSelisih = 420000;
  const maxSteps = Math.max(1, Math.floor(maxSelisih / increment)); // 21 langkah

  const targetBidPrice = room.currentPrice + increment * stepCount;
  const selisihTotal = increment * stepCount;

  // Format currency with comma separator matching screenshot (e.g. IDR 8,718,000)
  const formatIDR = (val: number) => {
    return `IDR ${val.toLocaleString("en-US")}`;
  };

  // Format timer (e.g. "23 Jam 52 Menit" matching screenshot)
  const formatTimer = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} Jam ${minutes} Menit`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} Menit ${secs} Detik`;
  };

  const handleDecrement = () => {
    if (stepCount > 1) {
      setStepCount((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (stepCount < maxSteps) {
      setStepCount((prev) => prev + 1);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStepCount(Number(e.target.value));
  };

  const [localModal, setLocalModal] = useState<BidModalState | null>(null);
  const activeModal = localModal || bidModal;

  // Check if current user is already at the top (highest bidder)
  const isUserHighest =
    room.highestBidderName === "Kamu" ||
    room.highestBidderType === "USER" ||
    (bids.length > 0 && (bids[0].bidderName === "Kamu" || bids[0].bidderType === "USER"));

  // Track spam click count when user is already leading
  const [spamClickCount, setSpamClickCount] = useState<number>(0);

  // 1-Minute penalty ban timestamp
  const [bannedUntil, setBannedUntil] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("bidding_banned_until");
        if (saved) {
          const val = Number(saved);
          if (val > Date.now()) return val;
        }
      } catch {}
    }
    return 0;
  });
  const [banSecondsRemaining, setBanSecondsRemaining] = useState<number>(0);
  const isCurrentlyBanned = banSecondsRemaining > 0;

  // Countdown timer for 1-minute ban
  useEffect(() => {
    if (bannedUntil <= Date.now()) {
      setBanSecondsRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((bannedUntil - Date.now()) / 1000));
      setBanSecondsRemaining(remaining);
      if (remaining <= 0) {
        setBannedUntil(0);
        setSpamClickCount(0);
        try {
          localStorage.removeItem("bidding_banned_until");
        } catch {}
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [bannedUntil]);

  // Reset spam clicks whenever another user/bot bids (user is no longer highest)
  useEffect(() => {
    if (!isUserHighest) {
      setSpamClickCount(0);
    }
  }, [isUserHighest]);

  // Handle server bid response modal changes & spam count tracking
  useEffect(() => {
    if (!bidModal || !bidModal.isOpen) return;

    if (bidModal.code === "ALREADY_HIGHEST") {
      setSpamClickCount((prev) => {
        const next = prev + 1;
        if (next >= 10) {
          const banExpiresAt = Date.now() + 60 * 1000;
          setBannedUntil(banExpiresAt);
          setBanSecondsRemaining(60);
          try {
            localStorage.setItem("bidding_banned_until", String(banExpiresAt));
          } catch {}
          setLocalModal({
            isOpen: true,
            type: "error",
            title: "Akun Ditangguhkan 1 Menit",
            message:
              "Anda telah menekan penawaran sebanyak 10 kali tanpa ada penawar lain. Akun Anda terkena penalti (banned) selama 1 menit.",
          });
        }
        return next;
      });
    } else if (bidModal.code === "PRICE_TOO_LOW" || bidModal.type === "success") {
      setSpamClickCount(0);
    }
  }, [bidModal]);

  const handleTawar = () => {
    if (isSubmitting) return;

    // 0. Validasi jika sedang terkena penalti ban 1 menit
    if (isCurrentlyBanned) {
      setLocalModal({
        isOpen: true,
        type: "error",
        title: "Akun Ditangguhkan",
        message: `Anda sedang terkena penalti (banned) selama 1 menit karena melakukan penawaran berulang. Harap tunggu ${banSecondsRemaining} detik.`,
      });
      return;
    }

    // Kirim tawaran ke server bersama room.currentPrice yang dilihat user saat ini.
    onPlaceBid(targetBidPrice, room.currentPrice);
  };

  const handleCloseModal = () => {
    setLocalModal(null);
    if (onCloseBidModal) {
      onCloseBidModal();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-800 select-none overflow-hidden justify-between relative">
      {/* Top Header (1:1 with Screenshot) */}
      <div className="bg-[#0066D6] px-4 py-3 flex items-center justify-between text-white shadow-xs shrink-0 z-10">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h2 className="text-base font-bold tracking-tight text-white flex-1 text-center">
          Bidding Reguler
        </h2>

        {/* Download / Tray Icon on Top Right */}
        <button
          type="button"
          onClick={() => alert("Mengunduh katalog unit lelang...")}
          className="p-1 -mr-1 text-white hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
          title="Unduh Brosur"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 stroke-current"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 17V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V17" />
            <path d="M12 4V14M12 14L8 10M12 14L16 10" />
          </svg>
        </button>
      </div>

      {/* Banner Penalti 1 Menit jika Banned */}
      {isCurrentlyBanned && (
        <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-md shrink-0 z-30 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
            <span className="leading-tight">
              Terkena Penalti 1 Menit: Tunggu <strong>{banSecondsRemaining} detik</strong>
            </span>
          </div>
          <span className="font-mono text-white bg-black/30 px-2 py-0.5 rounded text-[11px] shrink-0 font-bold tracking-wider">
            00:{banSecondsRemaining.toString().padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
        {/* Product Image Showcase */}
        <div className="w-full h-44 flex items-center justify-center bg-white p-2">
          <img
            src={room.imageUrl}
            alt={room.title}
            className="h-full object-contain drop-shadow-sm"
          />
        </div>

        {/* Pricing Info & Badges Row (Matching Screenshot) */}
        <div className="flex items-start justify-between gap-3 pt-1">
          {/* Left: Starting Price & Stock */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#0284C7] leading-tight">
              Harga Mulai : {formatIDR(room.startingPrice)}
            </p>
            <p className="text-xs text-slate-800 font-normal">
              Stok : {room.stock || 1}
            </p>
          </div>

          {/* Right: Badges (AE) FAIR & (Terdaftar) */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-[#0284C7] border border-[#0284C7] bg-white leading-tight">
              {room.lotBadge || "(AE) FAIR"}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-[#0284C7] border border-[#0284C7] bg-white leading-tight">
              (Terdaftar)
            </span>
          </div>
        </div>

        {/* Tabs: Deskripsi vs Spesifikasi (Outlined in Blue & Green) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "deskripsi" ? null : "deskripsi")}
            className={`py-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
              activeTab === "deskripsi"
                ? "border-[#0066D6] text-[#0066D6] bg-blue-50/20 shadow-2xs"
                : "border-[#0066D6] text-[#0066D6] bg-white hover:bg-blue-50/10"
            }`}
          >
            Deskripsi
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "spesifikasi" ? null : "spesifikasi")}
            className={`py-2 rounded-lg text-xs font-semibold border transition text-center cursor-pointer ${
              activeTab === "spesifikasi"
                ? "border-[#22C55E] text-[#22C55E] bg-emerald-50/20 shadow-2xs"
                : "border-[#22C55E] text-[#22C55E] bg-white hover:bg-emerald-50/10"
            }`}
          >
            Spesifikasi
          </button>
        </div>

        {/* Tab Detail Preview (Expandable if tapped) */}
        {activeTab && (
          <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100 animate-in fade-in duration-150">
            {activeTab === "deskripsi" ? (
              <p>{room.description || "Unit lelang kondisi fisik mulus, fungsi tested normal 100%, siap pakai harian."}</p>
            ) : (
              <p>{room.specs || "Kapasitas 128GB, All Operator, Kamera Jernih, iCloud Clean siap reset."}</p>
            )}
          </div>
        )}

        {/* Section: Penawaran & Countdown Timer */}
        <div className="pt-1 space-y-2.5">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-sm text-slate-900">Penawaran</h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-slate-400 stroke-[1.8]" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>
          </div>

          {/* Live Stream Bids Rows (1:1 with Screenshot) */}
          <div className="space-y-1 pb-2">
            {bids.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada penawaran. Jadilah penawar pertama!
              </div>
            ) : (
              bids.map((b, idx) => {
                const isKamu = b.bidderName === "Kamu" || b.bidderType === "USER";
                return (
                  <div
                    key={b.id || idx}
                    className="flex items-center justify-between py-2"
                  >
                    <span
                      className={
                        isKamu
                          ? "font-bold text-[16px] text-[#0066D6] tracking-tight"
                          : "font-normal text-[14px] text-slate-800"
                      }
                    >
                      {isKamu ? "Kamu" : b.bidderName}
                    </span>
                    <span
                      className={
                        isKamu
                          ? "font-bold text-[16px] text-[#0066D6] tracking-tight"
                          : "font-normal text-[14px] text-slate-800"
                      }
                    >
                      {formatIDR(b.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Bidding Control Panel (1:1 with Screenshot) */}
      <div className="border-t border-slate-200/90 bg-white p-4 pt-3 flex flex-col items-center gap-2 shadow-xl shrink-0 z-20">
        {/* Main Target Price & Selisih Display */}
        <div className="text-center">
          <p className="text-base font-bold text-slate-900 leading-tight">
            {formatIDR(targetBidPrice)}
          </p>
          <p className="text-xs font-semibold text-[#0284C7] mt-0.5">
            Selisih {formatIDR(selisihTotal)}
          </p>
        </div>

        {/* Step Slider with [-] and [+] Buttons */}
        <div className="w-full flex items-center gap-3 px-1 py-1">
          {/* Minus Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isCurrentlyBanned || stepCount <= 1}
            className="w-10 h-10 rounded-lg border border-[#0284C7] flex items-center justify-center text-slate-800 disabled:border-slate-300 disabled:text-slate-300 hover:bg-sky-50 transition active:scale-95 cursor-pointer shrink-0 font-bold text-xl select-none"
          >
            -
          </button>

          {/* Range Slider with Purple Thumb */}
          <div className="flex-1 relative flex items-center px-1">
            <input
              type="range"
              min="1"
              max={maxSteps}
              step="1"
              value={stepCount}
              disabled={isCurrentlyBanned}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5B4DB2] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Plus Button */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={isCurrentlyBanned || stepCount >= maxSteps}
            className="w-10 h-10 rounded-lg border border-[#0284C7] flex items-center justify-center text-slate-800 disabled:border-slate-300 disabled:text-slate-300 hover:bg-sky-50 transition active:scale-95 cursor-pointer shrink-0 font-bold text-xl select-none"
          >
            +
          </button>
        </div>

        {/* CTA Button "Tawar" */}
        <button
          type="button"
          onClick={handleTawar}
          disabled={isSubmitting || isCurrentlyBanned}
          className={`w-full py-3.5 rounded-xl font-medium text-sm transition cursor-pointer text-center mt-1 ${
            isCurrentlyBanned
              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              : "bg-[#0066D6] hover:bg-[#0055B8] active:scale-[0.99] text-white shadow-md shadow-blue-500/20"
          }`}
        >
          {isCurrentlyBanned
            ? `Dibekukan (${banSecondsRemaining}s)`
            : isSubmitting
            ? "Mengirimkan Tawaran..."
            : "Tawar"}
        </button>
      </div>

      {/* Modal Respon Tawar (Berhasil / Gagal - 1:1 Screenshots) */}
      <BidResponseModal
        isOpen={Boolean(activeModal?.isOpen)}
        type={activeModal?.type || "error"}
        title={activeModal?.title}
        message={activeModal?.message}
        onClose={handleCloseModal}
      />
    </div>
  );
}
