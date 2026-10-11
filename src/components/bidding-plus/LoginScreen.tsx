"use client";

import React, { useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import type { User } from "@/db/schema";

interface LoginScreenProps {
  onSuccess: (user: User) => void;
  onGoToRegister: () => void;
}

export function LoginScreen({ onSuccess, onGoToRegister }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notRegistered, setNotRegistered] = useState(false);

  const isFormValid = phoneNumber.trim().length >= 8 && agreed && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setErrorMessage(null);
    setNotRegistered(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 404 || !data.isRegistered) {
          setNotRegistered(true);
          setErrorMessage("Nomor handphone belum terdaftar! Anda belum bisa masuk sebelum mendaftar akun terlebih dahulu.");
        } else {
          setErrorMessage(data.error || "Gagal masuk ke sistem. Silakan periksa koneksi.");
        }
        setIsLoading(false);
        return;
      }

      // Success login
      onSuccess(data.user);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Terjadi kendala jaringan saat menghubungi server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-800 select-none overflow-y-auto">
      {/* Top Brand Logo & Title */}
      <div className="flex flex-col items-center pt-8">
        <BrandLogo variant="megaphone" size="lg" className="mb-6" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Masuk</h1>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="w-full my-auto space-y-4 max-w-sm mx-auto">
        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <p className="flex-1 leading-snug">{errorMessage}</p>
            </div>

            {/* Quick button to register if phone not found */}
            {notRegistered && (
              <button
                type="button"
                onClick={onGoToRegister}
                aria-label="Buka formulir pendaftaran akun baru"
                className="self-start mt-1 px-3 py-1.5 rounded-lg bg-[#0055B8] hover:bg-[#004494] text-white font-bold text-[11px] flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <span>Daftar Aku Baru Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Phone Input Row */}
        <div>
          <label htmlFor="phone-number-input" className="block text-[11px] font-bold text-slate-800 mb-1">
            Nomor Handphone
          </label>
          <div className="flex items-center gap-2">
            {/* Country Code Pill */}
            <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-slate-300 bg-white shadow-xs shrink-0" aria-hidden="true">
              {/* Indonesian Flag SVG */}
              <div className="w-5 h-3.5 rounded-xs overflow-hidden border border-slate-200 flex flex-col shrink-0">
                <div className="h-1/2 bg-[#FF0000]" />
                <div className="h-1/2 bg-[#FFFFFF]" />
              </div>
              <span className="text-xs font-bold text-slate-800">+62</span>
            </div>

            {/* Number Input */}
            <input
              id="phone-number-input"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              aria-label="Nomor Handphone"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""));
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="81373827173"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-[#0055B8] focus:ring-1 focus:ring-[#0055B8] transition shadow-xs"
            />
          </div>

          {/* Quick Demo Helper Hint */}
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 font-medium">Belum terdaftar tidak bisa masuk</span>
            <button
              type="button"
              onClick={() => {
                setPhoneNumber("81373827173");
                if (errorMessage) setErrorMessage(null);
              }}
              className="text-[#0055B8] font-bold hover:underline cursor-pointer"
              aria-label="Isi otomatis dengan Akun Demo"
            >
              Gunakan Akun Demo
            </button>
          </div>
        </div>

        {/* Agreement Disclaimer Box */}
        <div
          role="checkbox"
          aria-checked={agreed}
          aria-required="true"
          tabIndex={0}
          aria-label="Setujui Syarat dan Ketentuan Bidding Plus serta Kebijakan Privasi PT ENB Mobile Care"
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setAgreed(!agreed);
            }
          }}
          onClick={() => setAgreed(!agreed)}
          className="p-3.5 rounded-2xl bg-[#EDF5FD] border border-[#DCEBFC] flex items-start gap-3 cursor-pointer hover:bg-[#E4F0FC] focus:outline-none focus:ring-2 focus:ring-[#0055B8] transition"
        >
          {/* Custom Radio Button */}
          <div className="mt-0.5 shrink-0" aria-hidden="true">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                agreed ? "border-[#0055B8] bg-white" : "border-slate-500 bg-white"
              }`}
            >
              {agreed && <div className="w-2 h-2 rounded-full bg-[#0055B8]" />}
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-800">
            Dengan masuk ke aplikasi Bidding Plus, saya menyatakan telah membaca dan menyetujui{" "}
            <span className="text-[#0055B8] font-bold hover:underline">
              Syarat dan Ketentuan Bidding Plus
            </span>{" "}
            serta{" "}
            <span className="text-[#0055B8] font-bold hover:underline">
              Kebijakan Privasi PT ENB Mobile Care
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isFormValid}
            aria-label="Masuk ke aplikasi Bidding Plus"
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
              isFormValid
                ? "bg-[#0055B8] hover:bg-[#004494] text-white active:scale-[0.99] cursor-pointer"
                : "bg-slate-300 text-slate-600 cursor-not-allowed"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />}
            <span>{isLoading ? "Memeriksa Akun..." : "Masuk"}</span>
          </button>
        </div>
      </form>

      {/* Footer Register Link */}
      <div className="text-center pb-4 text-xs text-slate-800">
        <span>Belum Punya Akun ? </span>
        <button
          type="button"
          onClick={onGoToRegister}
          aria-label="Buka halaman pendaftaran akun baru"
          className="text-[#0055B8] font-bold hover:underline cursor-pointer"
        >
          Daftar Sekarang
        </button>
      </div>
    </div>
  );
}
