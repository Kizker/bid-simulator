"use client";

import React, { useState } from "react";
import { BrandLogo } from "./BrandLogo";

interface HomeScreenProps {
  onSelectCategory: (category: string) => void;
}

export function HomeScreen({ onSelectCategory }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<"beranda" | "transaksi" | "pesan" | "profil">("beranda");

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-800 select-none overflow-hidden justify-between">
      {/* Top Header with Brand Logo */}
      <div className="pt-4 pb-2 px-4 flex items-center justify-center border-b border-slate-100 bg-white">
        <BrandLogo variant="megaphone" size="sm" />
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Promo Hero Banner Card */}
        <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-tr from-[#1E5799] via-[#207cca] to-[#7db9e8] text-white p-4 shadow-sm relative flex flex-col justify-between min-h-[160px]">
          {/* Subtle background waves */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] pointer-events-none" />

          {/* Banner Content */}
          <div className="relative z-10 flex flex-col">
            <span className="font-black text-xl tracking-tight text-white drop-shadow-sm">
              BIDDING PLUS
            </span>
            <span className="text-xs text-white/90 font-medium mt-0.5">
              Buka setiap hari
            </span>
            <span className="text-xs font-bold text-amber-300">
              17.00 s/d 08.00 wib
            </span>
          </div>

          {/* Gadget Image Composition */}
          <div className="relative z-10 flex items-end justify-end mt-2">
            <img
              src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80"
              alt="Promo Gadget"
              className="w-24 h-24 object-contain drop-shadow-xl -mr-2 -mb-2"
            />
          </div>

          {/* Dots Indicator */}
          <div className="relative z-10 flex items-center gap-1.5 mt-2 justify-center">
            <div className="w-4 h-1.5 rounded-full bg-white" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Section: Kategori */}
        <div>
          <h3 className="text-center font-bold text-sm text-slate-900 mb-3">
            Kategori
          </h3>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Kategori 1: Handphone */}
            <button
              onClick={() => onSelectCategory("Handphone")}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#0066D6] hover:shadow-md transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-3 group text-center cursor-pointer shadow-xs"
            >
              {/* Blue Smartphone Line Art Icon */}
              <div className="w-14 h-14 flex items-center justify-center text-[#0066D6] group-hover:scale-105 transition">
                <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 stroke-[#0066D6]" strokeWidth="2.5">
                  <rect x="14" y="6" width="20" height="36" rx="4" />
                  <line x1="21" y1="11" x2="27" y2="11" strokeLinecap="round" />
                  <circle cx="24" cy="37" r="1.5" fill="#0066D6" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0066D6]">
                Handphone
              </span>
            </button>

            {/* Kategori 2: Elektronik */}
            <button
              onClick={() => onSelectCategory("Elektronik")}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#0066D6] hover:shadow-md transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-3 group text-center cursor-pointer shadow-xs"
            >
              {/* Blue Multi Gadget Line Art Icon */}
              <div className="w-14 h-14 flex items-center justify-center text-[#0066D6] group-hover:scale-105 transition">
                <svg viewBox="0 0 54 48" fill="none" className="w-13 h-13 stroke-[#0066D6]" strokeWidth="2.2">
                  {/* Laptop / Monitor */}
                  <rect x="10" y="8" width="30" height="20" rx="2" />
                  <line x1="6" y1="28" x2="44" y2="28" strokeLinecap="round" strokeWidth="2.5" />
                  {/* Smartwatch left */}
                  <rect x="4" y="16" width="10" height="14" rx="3" />
                  {/* Phone right */}
                  <rect x="36" y="15" width="12" height="22" rx="2" fill="white" />
                  <circle cx="42" cy="33" r="1" fill="#0066D6" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-800 group-hover:text-[#0066D6]">
                Elektronik
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (Fixed 1:1 with Screenshot 5) */}
      <div className="border-t border-slate-100 bg-white px-6 py-2.5 flex items-center justify-between shadow-lg">
        {/* Beranda (Active) */}
        <button
          onClick={() => setActiveTab("beranda")}
          className="flex flex-col items-center gap-1 text-[#0066D6]"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-[#0066D6]" strokeWidth="2">
              <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" />
              <path d="M9 14C10.5 15.5 13.5 15.5 15 14" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-bold">Beranda</span>
        </button>

        {/* Transaksi */}
        <button
          onClick={() => setActiveTab("transaksi")}
          className="flex flex-col items-center gap-1 text-slate-400 relative"
        >
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 6V18M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" />
            </svg>
            <div className="w-2 h-2 rounded-full bg-[#16A34A] absolute -top-0.5 -right-0.5 ring-2 ring-white" />
          </div>
          <span className="text-[10px] font-medium">Transaksi</span>
        </button>

        {/* Pesan */}
        <button
          onClick={() => setActiveTab("pesan")}
          className="flex flex-col items-center gap-1 text-slate-400 relative"
        >
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2">
              <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" />
            </svg>
            <div className="w-2 h-2 rounded-full bg-[#16A34A] absolute -top-0.5 -right-0.5 ring-2 ring-white" />
          </div>
          <span className="text-[10px] font-medium">Pesan</span>
        </button>

        {/* Profil */}
        <button
          onClick={() => setActiveTab("profil")}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2">
              <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="text-[10px] font-medium">Profil</span>
        </button>
      </div>
    </div>
  );
}
