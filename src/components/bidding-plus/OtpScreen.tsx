"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface OtpScreenProps {
  phoneNumber: string;
  userName?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function OtpScreen({ phoneNumber, userName, onBack, onSuccess }: OtpScreenProps) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(58);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Countdown timer
  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [secondsLeft]);

  // Auto focus first input
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 filled
    if (digit && index === 3 && newOtp.every((d) => d !== "")) {
      setTimeout(() => {
        onSuccess();
      }, 300);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
    if (pasted.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      if (pasted.length === 4) {
        setTimeout(onSuccess, 300);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white text-slate-800 select-none overflow-y-auto">
      {/* Header with Blue Back Arrow */}
      <div className="px-4 py-3 flex items-center">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-[#0066D6] hover:bg-slate-100 rounded-full transition active:scale-95"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 text-center max-w-sm mx-auto w-full">
        {/* Brand Gavel Logo */}
        <BrandLogo variant="gavel" size="md" className="mb-6" />

        <h2 className="text-lg font-bold text-black tracking-tight mb-1">
          Masukkan Kode OTP
        </h2>
        {userName && (
          <p className="text-xs font-semibold text-[#0066D6] mb-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Halo, {userName} 👋
          </p>
        )}
        <p className="text-xs text-slate-500 leading-relaxed mb-1">
          Kami telah mengirim kode OTP untuk verifikasi nomor handphone anda
        </p>
        <p className="text-xs font-semibold text-slate-700 mb-8">
          Dikirim ke (+62) {phoneNumber || "81373827173"}
        </p>

        {/* 4 OTP Digit Boxes */}
        <div className="flex items-center justify-center gap-3.5 mb-8" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-14 rounded-2xl text-center text-xl font-bold transition-all outline-none ${
                digit
                  ? "bg-slate-100 border-2 border-[#0066D6] text-black shadow-xs"
                  : "bg-[#E2E8F0]/80 border-2 border-transparent text-slate-800 focus:bg-white focus:border-[#0066D6]"
              }`}
            />
          ))}
        </div>

        {/* Resend OTP Timer */}
        <div className="text-xs text-slate-500">
          <p>Kirim ulang OTP tersedia dalam</p>
          {secondsLeft > 0 ? (
            <p className="font-semibold text-slate-700 mt-1">{secondsLeft} Detik</p>
          ) : (
            <button
              onClick={() => setSecondsLeft(60)}
              className="font-bold text-[#0066D6] mt-1 hover:underline cursor-pointer"
            >
              Kirim Ulang Sekarang
            </button>
          )}
        </div>

        {/* Demo Auto-Fill Button */}
        <button
          type="button"
          onClick={() => {
            setOtp(["1", "2", "3", "4"]);
            setTimeout(onSuccess, 300);
          }}
          className="mt-10 text-[11px] font-semibold text-[#0066D6] px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
        >
          Isi Otomatis Kode Demo (1234)
        </button>
      </div>
    </div>
  );
}
