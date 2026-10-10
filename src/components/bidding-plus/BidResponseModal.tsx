"use client";

import React from "react";

export interface BidModalState {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  code?: string;
}

interface BidResponseModalProps {
  isOpen: boolean;
  type: "success" | "error";
  title?: string;
  message?: string;
  onClose: () => void;
}

export function BidResponseModal({
  isOpen,
  type,
  title,
  message,
  onClose,
}: BidResponseModalProps) {
  if (!isOpen) return null;

  const defaultTitle = type === "success" ? "Berhasil" : "Gagal";
  const defaultMessage =
    type === "success"
      ? "Berhasil Menawar Produk #01"
      : "Terjadi Kesalahan";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      {/* Modal Card (1:1 with Screenshots 1, 2, 3) */}
      <div className="w-full max-w-[310px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
        {/* 1. Icon */}
        {type === "success" ? (
          // Blue Standalone Checkmark from Screenshot 3
          <div className="w-14 h-14 flex items-center justify-center mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-11 h-11 stroke-[#0066D6]"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        ) : (
          // Red Circle with White Exclamation from Screenshot 1 & 2
          <div className="w-14 h-14 rounded-full bg-[#FF3B30] flex items-center justify-center text-white mb-2 shadow-xs">
            <span className="font-bold text-2xl font-sans leading-none -mt-0.5">!</span>
          </div>
        )}

        {/* 2. Title */}
        <h3 className="font-bold text-base text-slate-900 mb-2">
          {title || defaultTitle}
        </h3>

        {/* 3. Description Message */}
        <p className="text-sm text-slate-700 leading-snug px-1 mb-5">
          {message || defaultMessage}
        </p>

        {/* 4. Action Button "Tutup" */}
        {type === "success" ? (
          // Solid Blue Button from Screenshot 3
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#0066D6] hover:bg-[#0055B8] active:scale-[0.98] text-white font-medium text-xs transition cursor-pointer shadow-xs"
          >
            Tutup
          </button>
        ) : (
          // White Button with Red Outline from Screenshot 1 & 2
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-white hover:bg-red-50/50 active:scale-[0.98] border border-[#FF3B30] text-[#FF3B30] font-medium text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        )}
      </div>
    </div>
  );
}
