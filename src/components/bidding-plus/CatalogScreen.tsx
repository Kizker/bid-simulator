"use client";

import React, { useState } from "react";
import { ChevronLeft, Info, Menu, Search } from "lucide-react";
import type { AuctionRoom } from "@/db/schema";

interface CatalogScreenProps {
  rooms: AuctionRoom[];
  onBack: () => void;
  onSelectLot: (room: AuctionRoom) => void;
}

export function CatalogScreen({ rooms, onBack, onSelectLot }: CatalogScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = rooms.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.subtitle && r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-800 select-none overflow-hidden">
      {/* Solid Blue Header (Matching Screenshot 1) */}
      <div className="bg-[#0066D6] px-4 py-3.5 flex items-center justify-between text-white shadow-sm shrink-0">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h2 className="text-base font-bold tracking-tight text-white flex-1 text-center">
          Bidding Reguler
        </h2>

        <button
          onClick={() => alert("Informasi aturan lelang reguler Bidding Plus.")}
          className="p-1 -mr-1 text-white hover:bg-white/10 rounded-full transition cursor-pointer"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Search & Filter Bar Row */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Produk"
            className="w-full pl-3.5 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#0066D6]"
          />
        </div>

        <button
          type="button"
          onClick={() => alert("Filter kategori & grade")}
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="Filter"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* Product Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredRooms.map((lot) => (
          <div
            key={lot.id}
            onClick={() => onSelectLot(lot)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#0066D6] hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-3"
          >
            {/* Top Row: Thumbnail + Product Info */}
            <div className="flex items-start gap-4">
              {/* Product Thumbnail */}
              <div className="w-16 h-24 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={lot.imageUrl}
                  alt={lot.title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="text-xs font-bold text-slate-900 leading-tight">
                  {lot.title}
                </h3>
                <p className="text-xs text-slate-700 font-medium">
                  {lot.subtitle || "SoftCase Red"}
                </p>

                {/* Badge Pill */}
                <div className="pt-0.5">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold text-[#0284C7] border border-[#0284C7] bg-[#0284C7]/5">
                    {lot.lotBadge || "(AI) SCRAPT"}
                  </span>
                </div>

                <div className="pt-0.5 flex flex-col text-[11px] text-slate-600">
                  <span className="text-[#16A34A] font-semibold">
                    {lot.condition || "Fullset"}
                  </span>
                  <span>Stok : {lot.stock || 1}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Harga Lelang */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-700 font-normal">
                Harga Lelang
              </span>
              <span className="font-bold text-sm text-[#0066D6] font-sans">
                IDR {lot.currentPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada produk yang sesuai dengan pencarian Anda.
          </div>
        )}
      </div>
    </div>
  );
}
