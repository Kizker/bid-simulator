"use client";

import React, { useState, useEffect } from "react";
import {
  LogOut,
  ChevronRight,
  User as UserIcon,
  FileText,
  Shield,
  RotateCcw,
  Award,
  Headphones,
  Users,
  LayoutGrid,
  ArrowUpCircle,
  X,
  CreditCard,
  Info,
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import type { User as UserType } from "@/db/schema";

interface HomeScreenProps {
  user?: UserType | null;
  onSelectCategory: (category: string) => void;
  onLogout?: () => void;
}

export function HomeScreen({ user, onSelectCategory, onLogout }: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<"beranda" | "transaksi" | "pesan" | "profil">(() => {
    if (typeof window !== "undefined") {
      try {
        const savedTab = localStorage.getItem("bidding_home_tab") as any;
        if (["beranda", "transaksi", "pesan", "profil"].includes(savedTab)) {
          return savedTab;
        }
      } catch {}
    }
    return "beranda";
  });

  const handleTabChange = (tab: "beranda" | "transaksi" | "pesan" | "profil") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("bidding_home_tab", tab);
      } catch {}
    }
  };

  // State for sub-modals (Detail Data Akun, S&K, etc.)
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Tangani tombol kembali HP saat modal profil atau info di HomeScreen sedang terbuka
  useEffect(() => {
    if (!activeModal) return;

    const onPop = () => {
      setActiveModal(null);
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
  }, [activeModal]);

  // Dynamic schedule displayed to public (hours and minutes only)
  const [publicSchedule, setPublicSchedule] = useState<string>("17.00 s/d 08.00 wib");

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.schedule?.publicDisplay) {
          setPublicSchedule(data.schedule.publicDisplay);
        }
      })
      .catch(console.error);

    try {
      // Dynamic import or require socket client safely in browser
      const { getSocketClient } = require("@/lib/socket-client");
      const socket = getSocketClient();
      const onSchedule = (payload: any) => {
        if (payload?.publicDisplay) {
          setPublicSchedule(payload.publicDisplay);
        }
      };
      socket.on("schedule_updated", onSchedule);
      return () => {
        socket.off("schedule_updated", onSchedule);
      };
    } catch {}
  }, []);

  // Fallback user matching screenshot 2 if user not yet defined
  const displayName = user?.name || "Menik Sri Rejeki";
  const displayPhone = user?.phone || "81373827173";
  const displayEmail = user?.email || "menikbda@gmail.com";
  const initialLetter = displayName.charAt(0).toUpperCase();

  // Messages list matching screenshot 1
  const messages = [
    {
      id: "m-1",
      title: "🔔 REMINDER - Pembaruan S&K 🔔",
      body: "Yuk, perbarui data diri dan menyetujui S&K terbaru secara online melalui aplikasi Bidding Plus, sekarang juga 🔔",
      isGray: false,
    },
    {
      id: "m-2",
      title: "Hai bidders, jangan lupa untuk menandatangani S&K",
      body: "Hai bidders, jangan lupa untuk menandatangani S&K ter-update secara online melalui aplikasi Bidding Plus agar",
      isGray: false,
    },
    {
      id: "m-3",
      title: "📢 Reminder - Pembaruan Syarat & Ketentuan",
      body: "Yuk, perbarui data diri dan menyetujui Syarat & Ketentuan terbaru secara online melalui aplikasi Bidding Plus, agar",
      isGray: true,
    },
    {
      id: "m-4",
      title: "Hari ini Bidding buka",
      body: "Hari ini Bidding buka",
      isGray: false,
    },
    {
      id: "m-5",
      title: "Besok Bidding Buka",
      body: "yuk bid sekarang !",
      isGray: false,
    },
    {
      id: "m-6",
      title: "Hari ini libur yaa~",
      body: "Selamat Memperingati Hari Maulid Nabi Muhammad SAW 1448H",
      isGray: false,
    },
    {
      id: "m-7",
      title: "⛔ Besok libur ya⛔",
      body: "Operational Kantor PT. ENB Libur.",
      isGray: false,
    },
    {
      id: "m-8",
      title: "Hari ini Bidding buka",
      body: "Hari ini Bidding buka",
      isGray: true,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-800 select-none overflow-hidden justify-between relative">
      {/* ========================================================== */}
      {/* 1. TAB BERANDA (MATCHING SCREENSHOT 4) */}
      {/* ========================================================== */}
      {activeTab === "beranda" && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden justify-between">
          {/* Top Brand Megaphone Logo Header */}
          <div className="pt-6 pb-2 px-4 flex items-center justify-center bg-white shrink-0">
            <BrandLogo variant="megaphone" size="md" />
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-5">
            {/* Promo Banner Card Matching Screenshot 4 */}
            <div className="w-full rounded-2xl bg-white border border-slate-100 shadow-md p-3 relative overflow-hidden flex flex-col min-h-[175px]">
              {/* Background Blue Swirls & Sparkles */}
              <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-amber-50/20 pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-start justify-between">
                {/* Banner Text */}
                <div className="space-y-1 pt-1 pl-1">
                  <h3 className="font-black text-xl tracking-tight text-[#0066D6] leading-none">
                    BIDDING PLUS
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-700">
                    Buka setiap hari
                  </p>
                  <p className="text-[11px] font-bold text-amber-500">
                    {publicSchedule}
                  </p>

                  <div className="pt-4">
                    <span className="inline-block text-[9px] font-mono bg-slate-900 text-white px-2 py-0.5 rounded font-bold shadow-xs">
                      GET IT ON Google Play
                    </span>
                  </div>
                </div>

                {/* Gadget Showcase Image Composition */}
                <div className="relative -mr-2 -mt-1 w-44 h-32 flex items-center justify-end">
                  <img
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=400&q=80"
                    alt="Bidding Plus Gadgets"
                    width="144"
                    height="128"
                    loading="lazy"
                    decoding="async"
                    className="w-36 h-32 object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Decorative Blue Wave Ribbon */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-[#0066D6] via-blue-400 to-[#0066D6] opacity-80" />
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
                  className="p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-[#0066D6] hover:shadow-md transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-3.5 group text-center cursor-pointer shadow-xs min-h-[160px]"
                >
                  <div className="w-16 h-16 flex items-center justify-center text-[#0066D6] group-hover:scale-105 transition">
                    <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 stroke-[#0066D6]" strokeWidth="2.4">
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
                  className="p-6 rounded-2xl border border-slate-200/90 bg-white hover:border-[#0066D6] hover:shadow-md transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-3.5 group text-center cursor-pointer shadow-xs min-h-[160px]"
                >
                  <div className="w-16 h-16 flex items-center justify-center text-[#0066D6] group-hover:scale-105 transition">
                    <svg viewBox="0 0 54 48" fill="none" className="w-14 h-14 stroke-[#0066D6]" strokeWidth="2.2">
                      <rect x="10" y="8" width="30" height="20" rx="2" />
                      <line x1="6" y1="28" x2="44" y2="28" strokeLinecap="round" strokeWidth="2.5" />
                      <rect x="4" y="16" width="10" height="14" rx="3" />
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
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. TAB TRANSAKSI (MATCHING SCREENSHOT 3) */}
      {/* ========================================================== */}
      {activeTab === "transaksi" && (
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden justify-between">
          {/* Solid Blue Header */}
          <div className="bg-[#0066D6] px-4 py-3.5 flex items-center justify-center text-white shadow-xs shrink-0">
            <h2 className="text-base font-bold tracking-tight text-white text-center">
              Transaksi
            </h2>
          </div>

          {/* Scrollable Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Card 1: Transaksi Bulan Ini */}
            <button
              onClick={() => setActiveModal("transaksi-bulan-ini")}
              className="w-full p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0066D6] hover:shadow-xs flex items-center gap-4 transition active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#0066D6] shrink-0">
                <LayoutGrid className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">
                Transaksi Bulan Ini
              </span>
            </button>

            {/* Card 2: Penawaran Saya Reguler */}
            <button
              onClick={() => onSelectCategory("Handphone")}
              className="w-full p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0066D6] hover:shadow-xs flex items-center gap-4 transition active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#0066D6] shrink-0">
                <ArrowUpCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">
                Penawaran Saya Reguler
              </span>
            </button>

            {/* Card 3: Penawaran Saya LDU */}
            <button
              onClick={() => onSelectCategory("Handphone")}
              className="w-full p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0066D6] hover:shadow-xs flex items-center gap-4 transition active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#0066D6] shrink-0">
                <ArrowUpCircle className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">
                Penawaran Saya LDU
              </span>
            </button>

            {/* Section Header: History */}
            <div className="pt-2 pb-0.5 px-1">
              <h4 className="text-xs font-semibold text-slate-800">History</h4>
            </div>

            {/* Card 4: Transaksi Regular */}
            <button
              onClick={() => setActiveModal("history-regular")}
              className="w-full p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0066D6] hover:shadow-xs flex items-center gap-4 transition active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#0066D6] shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[2.3]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">
                Transaksi Regular
              </span>
            </button>

            {/* Card 5: Transaksi Bundling */}
            <button
              onClick={() => setActiveModal("history-bundling")}
              className="w-full p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0066D6] hover:shadow-xs flex items-center gap-4 transition active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#0066D6] shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[2.3]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">
                Transaksi Bundling
              </span>
            </button>

            {/* Card 6: Transaksi Live Demo Unit */}
            <button
              onClick={() => setActiveModal("history-ldu")}
              className="w-full p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-[#0066D6] hover:shadow-xs flex items-center gap-4 transition active:scale-[0.99] text-left cursor-pointer"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#0066D6] shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[2.3]" />
              </div>
              <span className="text-xs font-semibold text-slate-800">
                Transaksi Live Demo Unit
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. TAB PESAN (MATCHING SCREENSHOT 1) */}
      {/* ========================================================== */}
      {activeTab === "pesan" && (
        <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden justify-between">
          {/* Solid Blue Header */}
          <div className="bg-[#0066D6] px-4 py-3.5 flex items-center justify-center text-white shadow-xs shrink-0">
            <h2 className="text-base font-bold tracking-tight text-white text-center">
              Pesan
            </h2>
          </div>

          {/* Scrollable Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => alert(`${msg.title}\n\n${msg.body}`)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] ${
                  msg.isGray
                    ? "bg-[#ECEEF2] border-slate-300/80 text-slate-800 hover:bg-[#E3E6EB]"
                    : "bg-white border-slate-200/80 text-slate-800 shadow-2xs hover:border-[#0066D6]"
                }`}
              >
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {msg.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-normal">
                  {msg.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. TAB PROFIL / AKUN SAYA (MATCHING SCREENSHOT 2) */}
      {/* ========================================================== */}
      {activeTab === "profil" && (
        <div className="flex-1 flex flex-col bg-white overflow-hidden justify-between">
          <div className="flex-1 overflow-y-auto">
            {/* Curved Blue Header with User Info */}
            <div className="bg-[#0066D6] text-white pt-6 pb-9 px-6 rounded-b-[42px] shadow-sm relative shrink-0">
              {/* Top Row: Title & Log out */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Akun Saya
                </h2>

                <button
                  onClick={() => {
                    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
                      if (onLogout) onLogout();
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-white/95 hover:text-white transition active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 stroke-[2]" />
                  <span>Log out</span>
                </button>
              </div>

              {/* Second Row: White Avatar Circle & User Details */}
              <div className="flex items-center gap-4">
                {/* Avatar Initial Circle */}
                <div className="w-16 h-16 rounded-full bg-white text-[#0066D6] font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
                  {initialLetter}
                </div>

                {/* Name, Phone, Email */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="font-bold text-base text-white tracking-tight leading-tight truncate">
                    {displayName}
                  </h3>
                  <p className="text-xs text-white/90 font-medium">
                    (62) {displayPhone}
                  </p>
                  <p className="text-xs text-white/85 font-normal truncate">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items List with Circular Icons */}
            <div className="px-5 py-2 divide-y divide-slate-100">
              {/* 1. Data Akun */}
              <button
                onClick={() => setActiveModal("data-akun")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FE] text-[#0066D6] flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      Data Akun
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                      Kelola data akun anda disini
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </button>

              {/* 2. Syarat & Ketentuan */}
              <button
                onClick={() => setActiveModal("syarat-ketentuan")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FE] text-[#0066D6] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      Syarat & Ketentuan
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                      Ketentuan penggunaan layanan
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </button>

              {/* 3. Kebijakan Privasi */}
              <button
                onClick={() => setActiveModal("kebijakan-privasi")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FE] text-[#0066D6] flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      Kebijakan Privasi
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                      Perlindungan data pribadi
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </button>

              {/* 4. Refund */}
              <button
                onClick={() => setActiveModal("refund")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FE] text-[#0066D6] flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      Refund
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                      Kelola metode pembayaran
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </button>

              {/* 5. Informasi Grade */}
              <button
                onClick={() => setActiveModal("informasi-grade")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FE] text-[#0066D6] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      Informasi Grade
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                      Pelajari standar grade produk
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </button>

              {/* 6. Pusat Bantuan */}
              <button
                onClick={() => setActiveModal("pusat-bantuan")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FE] text-[#0066D6] flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      Pusat Bantuan
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                      Pertanyaan yang sering diajukan
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </button>

              {/* 7. Tentang Kami */}
              <button
                onClick={() => setActiveModal("tentang-kami")}
                className="w-full py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF4FE] text-[#0066D6] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                      Tentang Kami
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-normal">
                      Kenali Bidding Plus lebih dekat
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-800 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT 1, 2, 3, 4) */}
      {/* ========================================================== */}
      <nav
        aria-label="Navigasi Menu Utama"
        className="border-t border-slate-100 bg-white px-6 py-1 flex items-center justify-between shadow-lg shrink-0 z-20"
        style={{
          paddingBottom: "max(4px, env(safe-area-inset-bottom, 4px))",
        }}
      >
        {/* Tab 1: Beranda */}
        <button
          type="button"
          onClick={() => handleTabChange("beranda")}
          aria-label="Menu Beranda"
          aria-current={activeTab === "beranda" ? "page" : undefined}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === "beranda" ? "text-[#0055B8]" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2" aria-hidden="true">
              <path
                d="M4 10.5L12 3.5L20 10.5V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V10.5Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M9 15C10 16.5 14 16.5 15 15" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold">Beranda</span>
        </button>

        {/* Tab 2: Transaksi */}
        <button
          type="button"
          onClick={() => handleTabChange("transaksi")}
          aria-label="Menu Transaksi"
          aria-current={activeTab === "transaksi" ? "page" : undefined}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === "transaksi" ? "text-[#0055B8]" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7V17M14.5 9.5C14.5 8.39543 13.3807 7.5 12 7.5C10.6193 7.5 9.5 8.39543 9.5 9.5C9.5 10.6046 10.6193 11.5 12 11.5C13.3807 11.5 14.5 12.3954 14.5 13.5C14.5 14.6046 13.3807 15.5 12 15.5C10.6193 15.5 9.5 14.6046 9.5 13.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold">Transaksi</span>
        </button>

        {/* Tab 3: Pesan */}
        <button
          type="button"
          onClick={() => handleTabChange("pesan")}
          aria-label="Menu Pesan"
          aria-current={activeTab === "pesan" ? "page" : undefined}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition cursor-pointer relative ${
            activeTab === "pesan" ? "text-[#0055B8]" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2" aria-hidden="true">
              <path d="M21 11.5C21 15.5 17.5 18.5 12 18.5C10.5 18.5 9 18.2 7.8 17.6L3 19L4.4 15.2C3.5 14.1 3 12.8 3 11.5C3 7.5 7 4.5 12 4.5C17 4.5 21 7.5 21 11.5Z" />
            </svg>
            {/* Green Notification Dot on top right */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#16A34A] absolute -top-0.5 -right-0.5 ring-2 ring-white" />
          </div>
          <span className="text-[10px] font-semibold">Pesan</span>
        </button>

        {/* Tab 4: Profil */}
        <button
          type="button"
          onClick={() => handleTabChange("profil")}
          aria-label="Menu Profil"
          aria-current={activeTab === "profil" ? "page" : undefined}
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition cursor-pointer ${
            activeTab === "profil" ? "text-[#0055B8]" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 stroke-current" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-semibold">Profil</span>
        </button>
      </nav>

      {/* ========================================================== */}
      {/* MODAL DETAIL INFORMATION */}
      {/* ========================================================== */}
      {activeModal && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900 capitalize">
                {activeModal.replace("-", " ")}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Content */}
            {activeModal === "data-akun" && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Lengkap</span>
                    <span className="font-bold text-slate-800">{displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Handphone</span>
                    <span className="font-bold text-slate-800">+62 {displayPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email</span>
                    <span className="font-bold text-slate-800">{displayEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kota Domisili</span>
                    <span className="font-bold text-slate-800">{user?.city || "Jakarta"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status Akun</span>
                    <span className="font-bold text-emerald-600">Aktif & Terverifikasi</span>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "syarat-ketentuan" && (
              <div className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
                <p className="font-semibold text-slate-800">Ketentuan Penggunaan Layanan Bidding Plus:</p>
                <p>1. Setiap penawar wajib mendaftarkan nomor telepon yang valid dan aktif.</p>
                <p>2. Penawaran lelang yang telah diajukan bersifat mengikat dan tidak dapat dibatalkan.</p>
                <p>3. Pemenang lelang wajib menyelesaikan administrasi pelunasan dalam waktu 1x24 jam.</p>
                <p>4. PT ENB Mobile Care berhak membatalkan keikutsertaan akun yang melanggar ketentuan.</p>
              </div>
            )}

            {activeModal === "kebijakan-privasi" && (
              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>PT ENB Mobile Care menjaga kerahasiaan data pribadi seluruh peserta lelang Bidding Plus sesuai dengan ketentuan hukum yang berlaku di Republik Indonesia.</p>
              </div>
            )}

            {activeModal === "informasi-grade" && (
              <div className="text-xs text-slate-700 space-y-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <span className="font-bold text-[#0066D6]">(AD) STANDART:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Unit lelang kondisi mulus 90-95%, fungsi normal 100%, kelengkapan fullset box dan charger.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="font-bold text-amber-700">(AI / AJ) SCRAPT:</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">Unit lelang siap pakai dengan tanda pemakaian wajar, fungsi tested normal, harga lelang ekonomis.</p>
                </div>
              </div>
            )}

            {activeModal === "refund" && (
              <div className="text-xs text-slate-600 space-y-2">
                <p>Pengembalian deposit / refund dana lelang diproses otomatis ke rekening terdaftar maksimal 1x24 jam hari kerja tanpa potongan biaya admin.</p>
              </div>
            )}

            {activeModal === "pusat-bantuan" && (
              <div className="text-xs text-slate-600 space-y-2">
                <p>Hubungi Customer Care Bidding Plus via WhatsApp resmi di nomor <strong>+62 813-7382-7173</strong> pada jam kerja operasional 09.00 - 18.00 WIB.</p>
              </div>
            )}

            {activeModal === "tentang-kami" && (
              <div className="text-xs text-slate-600 space-y-2">
                <p><strong>Bidding Plus</strong> adalah platform lelang gadget, smartphone, dan perangkat elektronik terpercaya dari PT ENB Mobile Care.</p>
              </div>
            )}

            {activeModal.startsWith("history-") && (
              <div className="text-center py-6 text-xs text-slate-400 space-y-2">
                <Info className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Riwayat transaksi lelang Anda telah tercatat dengan aman di sistem.</p>
              </div>
            )}

            {activeModal === "transaksi-bulan-ini" && (
              <div className="text-center py-6 text-xs text-slate-400 space-y-2">
                <Info className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Total 0 transaksi selesai pada periode bulan ini.</p>
              </div>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#0066D6] text-white font-bold text-xs hover:bg-[#0055B8] transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
