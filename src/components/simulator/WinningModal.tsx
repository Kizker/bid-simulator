"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Award, RotateCcw, ArrowRight, X } from "lucide-react";
import type { AuctionRoom } from "@/db/schema";

interface WinningModalProps {
  room: AuctionRoom;
  userName: string;
  onReset: () => void;
  onClose: () => void;
}

export function WinningModal({ room, userName, onReset, onClose }: WinningModalProps) {
  const isUserWinner = room.highestBidderName === userName;

  useEffect(() => {
    // Trigger confetti if user is winner
    if (isUserWinner) {
      const end = Date.now() + 2.5 * 1000;
      const colors = ["#f59e0b", "#10b981", "#ffffff"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [isUserWinner]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-[#101626] border border-slate-700/80 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isUserWinner ? "bg-amber-500/20" : "bg-purple-500/20"
          }`}
        />

        {/* Trophy / Gavel Icon */}
        <div
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 shadow-xl border ${
            isUserWinner
              ? "bg-gradient-to-tr from-amber-500 to-amber-300 text-black border-amber-300 shadow-amber-500/30 animate-bounce"
              : "bg-slate-800 text-slate-300 border-slate-700 shadow-slate-900"
          }`}
        >
          {isUserWinner ? (
            <Trophy className="w-10 h-10" />
          ) : (
            <Award className="w-10 h-10 text-slate-400" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-white mb-1">
          {isUserWinner ? "SELAMAT! KAMU MENANG!" : "Lelang Telah Berakhir"}
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          {isUserWinner
            ? "Tawaranmu menjadi penawaran tertinggi saat palu diketuk."
            : `Pemenang lot ini adalah ${room.highestBidderName || "Tidak ada penawar"}.`}
        </p>

        {/* Item Summary Card */}
        <div className="bg-[#161F33] p-3 rounded-2xl border border-slate-700/60 mb-5 text-left">
          <div className="flex items-center gap-3">
            <img
              src={room.imageUrl}
              alt={room.title}
              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-200 truncate">{room.title}</h4>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400">Harga Final:</span>
                <span className="font-mono text-sm font-extrabold text-amber-400">
                  Rp {room.currentPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {isUserWinner ? (
            <button
              onClick={() => alert("Simulasi Selesai! Selamat atas kemenangan lot lelang ini.")}
              className="w-full py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-95 text-xs"
            >
              <span>Lanjut ke Pembayaran (Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={onReset}
            className="w-full py-2.5 px-4 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition active:scale-95 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ulangi Simulasi Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
}
