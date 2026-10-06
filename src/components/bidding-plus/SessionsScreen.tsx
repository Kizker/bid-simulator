"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

interface SessionsScreenProps {
  categoryTitle?: string;
  onBack: () => void;
  onSelectSession: (sessionType: string) => void;
}

export function SessionsScreen({
  categoryTitle = "Handphone",
  onBack,
  onSelectSession,
}: SessionsScreenProps) {
  const sessions = [
    {
      id: "reguler",
      title: "Bidding Reguler",
      status: "BUKA",
      openTime: "Rabu,Pukul 17:00",
      closeTime: "Kamis, Pukul 08:00",
    },
    {
      id: "demo",
      title: "Live Demo Unit",
      status: "BUKA",
      openTime: "Rabu,Pukul 17:00",
      closeTime: "Kamis, Pukul 08:00",
    },
    {
      id: "bundling",
      title: "Bidding Bundling",
      status: "BUKA",
      openTime: "Rabu,Pukul 17:00",
      closeTime: "Kamis, Pukul 08:00",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-800 select-none overflow-hidden">
      {/* Solid Blue Header (Matching Screenshot 2) */}
      <div className="bg-[#0066D6] px-4 py-3.5 flex items-center justify-between text-white shadow-sm shrink-0">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h2 className="text-base font-bold tracking-tight text-white flex-1 text-center pr-6">
          {categoryTitle}
        </h2>
      </div>

      {/* Main Sessions Card List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-3"
          >
            {/* Title & BUKA Badge */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {session.title}
              </h3>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold text-[#16A34A] border border-[#16A34A] bg-[#16A34A]/5">
                {session.status}
              </span>
            </div>

            {/* Schedule Times */}
            <div className="text-xs text-slate-600 space-y-0.5 font-normal">
              <p>Buka : {session.openTime}</p>
              <p>Tutup : {session.closeTime}</p>
            </div>

            {/* Masuk CTA Button */}
            <button
              onClick={() => onSelectSession(session.id)}
              className="w-full py-2.5 rounded-xl bg-[#0066D6] hover:bg-[#0055B8] active:scale-[0.99] text-white font-bold text-xs shadow-xs transition cursor-pointer text-center"
            >
              Masuk
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
