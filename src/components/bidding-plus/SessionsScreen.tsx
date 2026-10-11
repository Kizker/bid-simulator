"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import type { AuctionRoom } from "@/db/schema";

interface SessionsScreenProps {
  categoryTitle?: string;
  rooms?: AuctionRoom[];
  totalUnits?: number;
  onBack: () => void;
  onSelectSession: (sessionType: string) => void;
}

export function SessionsScreen({
  categoryTitle = "Handphone",
  rooms = [],
  totalUnits,
  onBack,
  onSelectSession,
}: SessionsScreenProps) {
  const [internalRooms, setInternalRooms] = useState<AuctionRoom[]>(rooms);

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setInternalRooms(rooms);
    } else {
      fetch("/api/rooms")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && Array.isArray(data.rooms)) {
            setInternalRooms(data.rooms);
          }
        })
        .catch(console.error);
    }
  }, [rooms]);

  // Calculate units dynamically based on available rooms
  const regularUnits =
    totalUnits !== undefined
      ? totalUnits
      : internalRooms.reduce((sum, r) => sum + (r.stock || 1), 0) || internalRooms.length;

  const demoUnits = internalRooms
    .filter(
      (r) =>
        r.title.toLowerCase().includes("demo") ||
        r.title.toLowerCase().includes("ldu")
    )
    .reduce((sum, r) => sum + (r.stock || 1), 0);

  const bundlingUnits = internalRooms
    .filter((r) => r.title.toLowerCase().includes("bundling"))
    .reduce((sum, r) => sum + (r.stock || 1), 0);

  const [schedule, setSchedule] = useState({
    publicStartTime: "17:00",
    publicEndTime: "08:00",
  });

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.schedule) {
          setSchedule({
            publicStartTime: data.schedule.publicStartTime || "17:00",
            publicEndTime: data.schedule.publicEndTime || "08:00",
          });
        }
      })
      .catch(console.error);
  }, []);

  const sessions = [
    {
      id: "reguler",
      title: "Bidding Reguler",
      status: "BUKA",
      openTime: `Rabu,Pukul ${schedule.publicStartTime}`,
      closeTime: `Kamis, Pukul ${schedule.publicEndTime}`,
      totalUnits: regularUnits,
    },
    {
      id: "demo",
      title: "Live Demo Unit",
      status: "BUKA",
      openTime: `Rabu,Pukul ${schedule.publicStartTime}`,
      closeTime: `Kamis, Pukul ${schedule.publicEndTime}`,
      totalUnits: demoUnits,
    },
    {
      id: "bundling",
      title: "Bidding Bundling",
      status: "BUKA",
      openTime: `Rabu,Pukul ${schedule.publicStartTime}`,
      closeTime: `Kamis, Pukul ${schedule.publicEndTime}`,
      totalUnits: bundlingUnits,
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-slate-800 select-none overflow-hidden">
      {/* Solid Blue Header (Matching Screenshot 2) */}
      <div className="bg-[#0055B8] px-4 py-3.5 flex items-center justify-between text-white shadow-sm shrink-0">
        <button
          onClick={onBack}
          aria-label="Kembali ke halaman beranda"
          className="p-1 -ml-1 text-white hover:bg-white/10 rounded-full transition active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" aria-hidden="true" />
        </button>

        <h1 className="text-base font-bold tracking-tight text-white flex-1 text-center pr-6">
          {categoryTitle}
        </h1>
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
              <h2 className="font-bold text-sm text-slate-900">
                {session.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold text-[#15803D] border border-[#15803D] bg-emerald-50">
                {session.status}
              </span>
            </div>

            {/* Schedule Times & Total Unit */}
            <div className="text-xs text-slate-700 space-y-0.5 font-medium">
              <p>Buka : {session.openTime}</p>
              <p>Tutup : {session.closeTime}</p>
              <p>Total Unit : {session.totalUnits}</p>
            </div>

            {/* Masuk CTA Button */}
            <button
              onClick={() => onSelectSession(session.id)}
              aria-label={`Masuk ke sesi lelang ${session.title}`}
              className="w-full py-2.5 rounded-xl bg-[#0055B8] hover:bg-[#004494] active:scale-[0.99] text-white font-bold text-xs shadow-xs transition cursor-pointer text-center"
            >
              Masuk
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
