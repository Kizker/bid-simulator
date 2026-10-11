"use client";

import React, { useState } from "react";
import { ChevronLeft, Info, Menu, X } from "lucide-react";
import type { AuctionRoom } from "@/db/schema";

interface CatalogScreenProps {
  rooms: AuctionRoom[];
  onBack: () => void;
  onSelectLot: (room: AuctionRoom) => void;
}

const TYPE_OPTIONS = ["Semua", "Fullset", "Product Only", "Promo"];

const GRADE_OPTIONS = [
  "Semua",
  "(AA) MINT",
  "(AB) EXCELLENT",
  "(AC) VERY GOOD",
  "(AD) GOOD",
  "(AE) FAIR",
  "(AF) ACCEPTABLE",
  "(AG) POOR",
  "(AH) SUBSTANDARD",
  "(AI) SCRAPT",
  "(AJ) LOT SCRAPT",
];

const SORT_OPTIONS = [
  "Terbaru",
  "Terbanyak Dilihat",
  "Harga Terendah",
  "Harga Tertinggi",
  "Produk A-Z",
  "Produk Z-A",
  "Terlama",
];

export function CatalogScreen({ rooms, onBack, onSelectLot }: CatalogScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter & Sort active state
  const [selectedType, setSelectedType] = useState("Semua");
  const [selectedGrade, setSelectedGrade] = useState("Semua");
  const [selectedSort, setSelectedSort] = useState("Terbaru");

  // Bottom Sheet Filter Modal state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempType, setTempType] = useState("Semua");
  const [tempGrade, setTempGrade] = useState("Semua");
  const [tempSort, setTempSort] = useState("Terbaru");

  // Info Modal state
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Tangani tombol kembali HP saat modal info atau bottom sheet filter sedang terbuka
  React.useEffect(() => {
    if (!isFilterOpen && !isInfoOpen) return;

    const onPop = () => {
      setIsFilterOpen(false);
      setIsInfoOpen(false);
    };

    if (typeof window !== "undefined") {
      window.history.pushState({ modalOpen: true }, "", window.location.pathname);
      window.addEventListener("popstate", onPop);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("popstate", onPop);
      }
    };
  }, [isFilterOpen, isInfoOpen]);

  const handleOpenFilter = () => {
    setTempType(selectedType);
    setTempGrade(selectedGrade);
    setTempSort(selectedSort);
    setIsFilterOpen(true);
  };

  const handleApplyFilter = () => {
    setSelectedType(tempType);
    setSelectedGrade(tempGrade);
    setSelectedSort(tempSort);
    setIsFilterOpen(false);
  };

  // Filter & Sort calculation
  let filteredRooms = rooms.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      (r.subtitle && r.subtitle.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q));

    if (!matchQuery) return false;

    // Filter Type Produk
    if (selectedType !== "Semua") {
      if (selectedType === "Fullset") {
        if (!r.condition || !r.condition.toLowerCase().includes("fullset")) {
          return false;
        }
      } else if (selectedType === "Product Only") {
        if (
          !r.condition ||
          (!r.condition.toLowerCase().includes("product only") &&
            !r.condition.toLowerCase().includes("produk only"))
        ) {
          return false;
        }
      } else if (selectedType === "Promo") {
        if (
          !r.subtitle?.toLowerCase().includes("promo") &&
          !r.lotBadge?.toLowerCase().includes("promo")
        ) {
          return false;
        }
      }
    }

    // Filter Grade
    if (selectedGrade !== "Semua") {
      const match = selectedGrade.match(/\((.*?)\)/);
      const gradeCode = match ? match[1].toUpperCase() : selectedGrade.toUpperCase();
      const badge = (r.lotBadge || "").toUpperCase();
      const title = (r.title || "").toUpperCase();
      const specs = (r.specs || "").toUpperCase();
      if (!badge.includes(gradeCode) && !title.includes(gradeCode) && !specs.includes(gradeCode)) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filteredRooms.sort((a, b) => {
    if (selectedSort === "Harga Terendah") {
      return a.startingPrice - b.startingPrice;
    }
    if (selectedSort === "Harga Tertinggi") {
      return b.startingPrice - a.startingPrice;
    }
    if (selectedSort === "Produk A-Z") {
      return a.title.localeCompare(b.title);
    }
    if (selectedSort === "Produk Z-A") {
      return b.title.localeCompare(a.title);
    }
    if (selectedSort === "Terbanyak Dilihat") {
      return (b.totalBids || 0) - (a.totalBids || 0);
    }
    if (selectedSort === "Terlama") {
      return (a.createdAt || 0) - (b.createdAt || 0);
    }
    return (b.createdAt || 0) - (a.createdAt || 0); // "Terbaru"
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-800 select-none overflow-hidden relative">
      {/* 1. Solid Blue Header (1:1 with Screenshot) */}
      <header className="bg-[#0055B8] px-4 py-2.5 flex items-center justify-between text-white shadow-xs shrink-0 z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali ke halaman sesi lelang"
          className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
        </button>

        <h1 className="text-base font-bold tracking-tight text-white flex-1 text-center">
          Bidding Reguler
        </h1>

        <button
          type="button"
          onClick={() => setIsInfoOpen(true)}
          className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          aria-label="Informasi panduan Bidding Reguler"
          title="Informasi Bidding Reguler"
        >
          <Info className="w-5 h-5" aria-hidden="true" />
        </button>
      </header>

      {/* 2. Search & Filter Bar Row (1:1 with Screenshot) */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 shrink-0 z-10">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Produk"
            aria-label="Cari Produk Lelang"
            className="w-full pl-3.5 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder:text-slate-500 outline-none focus:border-[#0055B8]"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenFilter}
          aria-label="Buka opsi filter dan pengurutan produk"
          className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
          title="Filter & Urutkan"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
        </button>
      </div>

      {/* 3. Product Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredRooms.map((lot) => (
          <div
            key={lot.id}
            onClick={() => onSelectLot(lot)}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#0055B8] hover:shadow-xs transition-all active:scale-[0.99] cursor-pointer flex flex-col gap-3"
          >
            {/* Top Row: Thumbnail + Product Info */}
            <div className="flex items-start gap-4">
              {/* Product Thumbnail */}
              <div className="w-16 h-24 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={lot.imageUrl}
                  alt={`${lot.title || "Smartphone"} - Unit Lelang Bidding Reguler`}
                  width="64"
                  height="96"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0 space-y-1">
                <h2 className="text-xs font-bold text-slate-900 leading-tight">
                  {lot.title}
                </h2>
                <p className="text-xs text-slate-700 font-medium">
                  {lot.subtitle || "SoftCase Red"}
                </p>

                {/* Badge Pills Row (1:1 Screenshot: AD & Terdaftar) */}
                <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-[#0055B8] border border-[#0055B8] bg-blue-50/50">
                    {lot.lotBadge || "AD"}
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-[#BE123C] border border-[#BE123C] bg-rose-50/50">
                    (Terdaftar)
                  </span>
                </div>

                <div className="pt-0.5 flex flex-col text-[11px] text-slate-700">
                  <span className="text-[#166534] font-bold">
                    {lot.condition || "Fullset"}
                  </span>
                  <span>Stok : {lot.stock || 1}</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Harga Mulai */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-800 font-medium">
                Harga Mulai
              </span>
              <span className="font-bold text-sm text-[#0055B8] font-sans">
                IDR {lot.startingPrice.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Tidak ada produk yang sesuai dengan filter atau pencarian Anda.
          </div>
        )}
      </div>

      {/* 4. Bottom Sheet Filter & Sort (1:1 Matching Screenshot) */}
      {isFilterOpen && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150"
          />

          {/* Bottom Sheet Card */}
          <div className="relative bg-white rounded-t-3xl p-5 shadow-2xl z-10 flex flex-col max-h-[85%] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            {/* Close Button X (Top Right 1:1) */}
            <div className="flex justify-end -mt-1 -mr-1 mb-2">
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Tutup filter"
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 transition rounded-full cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.2]" aria-hidden="true" />
              </button>
            </div>

            {/* Section 1: Type Produk */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Type Produk</h4>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((type) => {
                  const isSelected = tempType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTempType(type)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#0066D6] text-white border border-[#0066D6]"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Grade */}
            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Grade</h4>
              <div className="flex flex-wrap gap-2">
                {GRADE_OPTIONS.map((grade) => {
                  const isSelected = tempGrade === grade;
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setTempGrade(grade)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#0066D6] text-white border border-[#0066D6]"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {grade}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Urutkan Berdasarkan */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Urutkan Berdasarkan</h4>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((sort) => {
                  const isSelected = tempSort === sort;
                  return (
                    <button
                      key={sort}
                      type="button"
                      onClick={() => setTempSort(sort)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer select-none ${
                        isSelected
                          ? "bg-[#0066D6] text-white border border-[#0066D6]"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {sort}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button: Terapkan */}
            <button
              type="button"
              onClick={handleApplyFilter}
              className="w-full min-h-[44px] py-3 bg-[#0055B8] hover:bg-[#004494] active:scale-[0.99] text-white font-semibold rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}

      {/* 5. Info Modal: Aturan Bidding Reguler */}
      {isInfoOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-full max-w-[310px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col text-left animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Aturan Bidding Reguler</h2>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                aria-label="Tutup informasi aturan"
                className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="py-3 space-y-2.5 text-xs text-slate-700">
              <p>
                • <strong>Kelipatan Bid:</strong> Semua penawaran adalah kelipatan Rp 20.000 (maksimal selisih Rp 420.000).
              </p>
              <p>
                • <strong>Penawar Tertinggi:</strong> Pengguna yang berada di puncak penawaran harus menunggu penawar lain sebelum dapat menawar kembali.
              </p>
              <p>
                • <strong>Anti-Sniping:</strong> Penawaran pada 10 detik terakhir otomatis memperpanjang durasi lelang 15 detik.
              </p>
              <p>
                • <strong>Status & Unit:</strong> Unit lelang terdaftar resmi sesuai grade dan kondisi produk.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInfoOpen(false)}
              className="w-full min-h-[44px] mt-2 py-2.5 bg-[#0055B8] hover:bg-[#004494] text-white font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
