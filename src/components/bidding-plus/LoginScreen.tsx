"use client";

import React, { useState } from "react";
import { BrandLogo } from "./BrandLogo";

interface LoginScreenProps {
  onSuccess: (phone: string) => void;
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState("81373827173");
  const [agreed, setAgreed] = useState(true);

  const isFormValid = phoneNumber.trim().length >= 8 && agreed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSuccess(phoneNumber);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-white text-slate-800 select-none overflow-y-auto">
      {/* Top Brand Logo & Title */}
      <div className="flex flex-col items-center pt-8">
        <BrandLogo variant="megaphone" size="lg" className="mb-6" />
        <h2 className="text-xl font-bold text-black tracking-tight">Masuk</h2>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="w-full my-auto space-y-4 max-w-sm mx-auto">
        {/* Phone Input Row */}
        <div className="flex items-center gap-2">
          {/* Country Code Pill */}
          <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl border border-slate-300 bg-white shadow-xs shrink-0">
            {/* Indonesian Flag SVG */}
            <div className="w-5 h-3.5 rounded-xs overflow-hidden border border-slate-200 flex flex-col shrink-0">
              <div className="h-1/2 bg-[#FF0000]" />
              <div className="h-1/2 bg-[#FFFFFF]" />
            </div>
            <span className="text-xs font-bold text-slate-800">+62</span>
          </div>

          {/* Number Input */}
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="No. Handphone"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0066D6] transition shadow-xs"
          />
        </div>

        {/* Agreement Disclaimer Box */}
        <div
          onClick={() => setAgreed(!agreed)}
          className="p-3.5 rounded-2xl bg-[#EDF5FD] border border-[#DCEBFC] flex items-start gap-3 cursor-pointer hover:bg-[#E4F0FC] transition"
        >
          {/* Custom Radio Button */}
          <div className="mt-0.5 shrink-0">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                agreed ? "border-[#0066D6] bg-white" : "border-slate-400 bg-white"
              }`}
            >
              {agreed && <div className="w-2 h-2 rounded-full bg-[#0066D6]" />}
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-600">
            Dengan masuk ke aplikasi Bidding Plus, saya menyatakan telah membaca dan menyetujui{" "}
            <span className="text-[#0066D6] font-semibold hover:underline">
              Syarat dan Ketentuan Bidding Plus
            </span>{" "}
            serta{" "}
            <span className="text-[#0066D6] font-semibold hover:underline">
              Kebijakan Privasi PT ENB Mobile Care
            </span>
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-8">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              isFormValid
                ? "bg-[#0066D6] hover:bg-[#0055B8] text-white active:scale-[0.99] cursor-pointer"
                : "bg-[#D1D5DB] text-slate-400 cursor-not-allowed"
            }`}
          >
            Masuk
          </button>
        </div>
      </form>

      {/* Footer Register Link */}
      <div className="text-center pb-4 text-xs text-slate-600">
        <span>Belum Punya Akun ? </span>
        <button
          type="button"
          onClick={() => alert("Fitur pendaftaran akun baru Bidding Plus.")}
          className="text-[#0066D6] font-bold hover:underline"
        >
          Daftar Sekarang
        </button>
      </div>
    </div>
  );
}
