"use client";

import React, { useState } from "react";
import { ChevronLeft, User as UserIcon, Mail, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import type { User } from "@/db/schema";

interface RegisterScreenProps {
  onBackToLogin: () => void;
  onSuccess: (user: User) => void;
}

export function RegisterScreen({ onBackToLogin, onSuccess }: RegisterScreenProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Jakarta");
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid =
    name.trim().length >= 2 &&
    phoneNumber.trim().length >= 8 &&
    agreed &&
    !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneNumber.trim(),
          email: email.trim() || undefined,
          city: city.trim() || "Jakarta",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Gagal melakukan pendaftaran. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      // Registration successful!
      onSuccess(data.user);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Terjadi kendala jaringan saat mendaftar. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-800 select-none overflow-y-auto">
      {/* Top Header with Back Button */}
      <header className="px-4 py-2 flex items-center shrink-0 border-b border-slate-50">
        <button
          onClick={onBackToLogin}
          type="button"
          aria-label="Kembali ke halaman masuk"
          className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center text-[#0055B8] hover:bg-slate-100 rounded-full transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
        </button>
        <span className="text-xs font-semibold text-slate-600 ml-1">Kembali ke Masuk</span>
      </header>

      <div className="flex-1 p-6 flex flex-col justify-between max-w-sm mx-auto w-full">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center pt-2 mb-4">
          <BrandLogo variant="megaphone" size="md" className="mb-3" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Akun Baru</h1>
          <p className="text-xs text-slate-600 text-center mt-1">
            Lengkapi data diri Anda untuk mengikuti simulasi lelang Bidding Plus
          </p>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" aria-hidden="true" />
            <div className="flex-1 leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 my-auto">
          {/* 1. Nama Lengkap Input */}
          <div>
            <label htmlFor="reg-name-input" className="block text-[11px] font-bold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="reg-name-input"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0055B8] transition shadow-xs"
              />
            </div>
          </div>

          {/* 2. Nomor Handphone Input */}
          <div>
            <label htmlFor="reg-phone-input" className="block text-[11px] font-bold text-slate-700 mb-1">
              Nomor Handphone (WhatsApp) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 bg-white shadow-xs shrink-0" aria-hidden="true">
                <div className="w-5 h-3.5 rounded-xs overflow-hidden border border-slate-200 flex flex-col shrink-0">
                  <div className="h-1/2 bg-[#FF0000]" />
                  <div className="h-1/2 bg-[#FFFFFF]" />
                </div>
                <span className="text-xs font-bold text-slate-800">+62</span>
              </div>
              <input
                id="reg-phone-input"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="81234567890"
                required
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0055B8] transition shadow-xs"
              />
            </div>
          </div>

          {/* 3. Email Input (Opsional) */}
          <div>
            <label htmlFor="reg-email-input" className="block text-[11px] font-bold text-slate-700 mb-1">
              Alamat Email <span className="text-slate-500 font-normal">(Opsional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="reg-email-input"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0055B8] transition shadow-xs"
              />
            </div>
          </div>

          {/* 4. Kota Domisili */}
          <div>
            <label htmlFor="reg-city-input" className="block text-[11px] font-bold text-slate-700 mb-1">
              Kota Domisili
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="reg-city-input"
                name="city"
                type="text"
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Jakarta / Surabaya / Bandung"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0055B8] transition shadow-xs"
              />
            </div>
          </div>

          {/* Agreement Checkbox */}
          <label
            htmlFor="reg-agreement-checkbox"
            className="p-3 rounded-xl bg-[#EDF5FD] border border-[#DCEBFC] flex items-start gap-2.5 cursor-pointer hover:bg-[#E4F0FC] focus-within:ring-2 focus-within:ring-[#0055B8] transition"
          >
            <input
              id="reg-agreement-checkbox"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div className="mt-0.5 shrink-0" aria-hidden="true">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                  agreed ? "border-[#0055B8] bg-white" : "border-slate-500 bg-white"
                }`}
              >
                {agreed && <div className="w-2 h-2 rounded-full bg-[#0055B8]" />}
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-700 select-none">
              Saya menyetujui{" "}
              <span className="text-[#0055B8] font-bold hover:underline">Syarat & Ketentuan Bidding Plus</span>{" "}
              serta <span className="text-[#0055B8] font-bold hover:underline">Kebijakan Privasi</span>.
            </p>
          </label>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full min-h-[48px] py-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                isFormValid
                  ? "bg-[#0055B8] hover:bg-[#004494] text-white active:scale-[0.99] cursor-pointer"
                  : "bg-[#D1D5DB] text-slate-600 cursor-not-allowed"
              }`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />}
              <span>{isLoading ? "Mendaftarkan Akun..." : "Daftar Sekarang"}</span>
            </button>
          </div>
        </form>

        {/* Footer Link to Login */}
        <div className="text-center pt-4 pb-2 text-xs text-slate-600 shrink-0">
          <span>Sudah Punya Akun? </span>
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-[#0055B8] font-bold hover:underline cursor-pointer"
          >
            Masuk Di Sini
          </button>
        </div>
      </div>
    </div>
  );
}
