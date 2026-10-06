"use client";

import React, { useEffect, useState } from "react";
import { getSocketClient } from "@/lib/socket-client";
import type { AuctionRoom, Bid, SimulationConfig } from "@/db/schema";
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Plus,
  Bot,
  Zap,
  TrendingUp,
  Layers,
  Shield,
  Activity,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const [rooms, setRooms] = useState<AuctionRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<AuctionRoom | null>(null);
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Room Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Luxury");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newStartingPrice, setNewStartingPrice] = useState(10000000);
  const [newBidIncrement, setNewBidIncrement] = useState(500000);
  const [newDuration, setNewDuration] = useState(180);
  const [newReservePrice, setNewReservePrice] = useState(15000000);

  // Fetch initial room list
  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data?.rooms) && data.rooms.length > 0) {
        setRooms(data.rooms);
        if (!selectedRoomId) {
          setSelectedRoomId(data.rooms[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Sync selected room details
  useEffect(() => {
    if (!selectedRoomId) return;

    const socket = getSocketClient();
    socket.emit("join_room", selectedRoomId);

    fetch(`/api/rooms/${selectedRoomId}`)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setSelectedRoom(data.room);
          setConfig(data.config);
          setRecentBids(data.bids || []);
          setTimeRemaining(data.room.timeRemaining);
        }
      })
      .catch(console.error);

    // Socket real-time listeners for CMS
    socket.on("timer_tick", (data: { roomId: string; timeRemaining: number }) => {
      if (data.roomId === selectedRoomId) {
        setTimeRemaining(data.timeRemaining);
      }
    });

    socket.on("bid_placed", (data: { bid: Bid; room: AuctionRoom; antiSnipingTriggered: boolean }) => {
      if (data.room.id === selectedRoomId) {
        setSelectedRoom(data.room);
        setTimeRemaining(data.room.timeRemaining);
        setRecentBids((prev) => [data.bid, ...prev.filter((b) => b.id !== data.bid.id)]);
      }
      // Update price in rooms list
      setRooms((prev) =>
        prev.map((r) => (r.id === data.room.id ? { ...r, currentPrice: data.room.currentPrice, totalBids: data.room.totalBids } : r))
      );
    });

    socket.on("room_updated", (updated: AuctionRoom) => {
      if (updated.id === selectedRoomId) {
        setSelectedRoom(updated);
        setTimeRemaining(updated.timeRemaining);
      }
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    });

    socket.on("bids_cleared", (data: { roomId: string }) => {
      if (data.roomId === selectedRoomId) {
        setRecentBids([]);
        showNotice("Simulasi room telah di-reset.");
      }
    });

    socket.on("time_extended", (data: { roomId: string; timeRemaining: number; added: number }) => {
      if (data.roomId === selectedRoomId) {
        setTimeRemaining(data.timeRemaining);
        showNotice(`Waktu diperpanjang +${data.added} detik.`);
      }
    });

    return () => {
      socket.off("timer_tick");
      socket.off("bid_placed");
      socket.off("room_updated");
      socket.off("bids_cleared");
      socket.off("time_extended");
    };
  }, [selectedRoomId]);

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const sendAdminCommand = (action: string, payload?: any) => {
    if (!selectedRoomId) return;
    const socket = getSocketClient();
    socket.emit("admin_command", {
      action,
      roomId: selectedRoomId,
      payload,
    });
    showNotice(`Perintah ${action} dikirim.`);
  };

  const handleUpdateBotAggressiveness = (level: "LOW" | "MEDIUM" | "HIGH" | "CHAOS") => {
    if (!selectedRoomId) return;
    const socket = getSocketClient();
    socket.emit("admin_command", {
      action: "UPDATE_CONFIG",
      roomId: selectedRoomId,
      payload: { botAggressiveness: level },
    });
    if (config) {
      setConfig({ ...config, botAggressiveness: level });
    }
    showNotice(`Agresivitas bot diubah ke ${level}.`);
  };

  const handleToggleBot = () => {
    if (!selectedRoomId || !config) return;
    const nextVal = config.botEnabled === 1 ? 0 : 1;
    const socket = getSocketClient();
    socket.emit("admin_command", {
      action: "UPDATE_CONFIG",
      roomId: selectedRoomId,
      payload: { botEnabled: nextVal },
    });
    setConfig({ ...config, botEnabled: nextVal });
    showNotice(`Bot Otomatis ${nextVal ? "Diaktifkan" : "Dinonaktifkan"}.`);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle || "Lelang Koleksi Mewah",
          category: newCategory,
          imageUrl:
            newImageUrl ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
          startingPrice: Number(newStartingPrice),
          bidIncrement: Number(newBidIncrement),
          totalDurationSeconds: Number(newDuration),
          reservePrice: Number(newReservePrice),
          botEnabled: 1,
          botAggressiveness: "MEDIUM",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        await fetchRooms();
        setSelectedRoomId(data.room.id);
        showNotice("Lot lelang baru berhasil dibuat!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics
  const totalGMV = rooms.reduce((acc, r) => acc + r.currentPrice, 0);
  const totalBidsAll = rooms.reduce((acc, r) => acc + r.totalBids, 0);
  const activeCount = rooms.filter((r) => r.status === "ACTIVE").length;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Status Notice Toast */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900 border border-blue-500/60 text-blue-300 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800">
          <span className="text-xs text-slate-400">Total Lot Lelang</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-white font-mono">{rooms.length}</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800">
          <span className="text-xs text-slate-400">Lelang Aktif</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">{activeCount}</span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800">
          <span className="text-xs text-slate-400">Total Penawaran Masuk</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{totalBidsAll}</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D121F] border border-slate-800">
          <span className="text-xs text-slate-400">Total Nilai Lelang</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-lg font-extrabold text-emerald-400 font-mono truncate">
              Rp {totalGMV.toLocaleString("id-ID")}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Rooms Selector, Right = Live Controller & Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Rooms List & Add Button (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Daftar Skenario Lelang
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Lot</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {rooms.map((r) => {
              const isSelected = r.id === selectedRoomId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoomId(r.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-800/90 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                      : "bg-[#0D121F] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={r.imageUrl}
                      alt={r.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700/80 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{r.title}</h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            r.status === "ACTIVE"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : r.status === "PAUSED"
                              ? "bg-amber-500/20 text-amber-400"
                              : r.status === "ENDED"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="font-mono text-amber-400 font-bold">
                          Rp {r.currentPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {r.totalBids} bid
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Live Control Dashboard (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedRoom ? (
            <>
              {/* Room Header & Quick Action Command Bar */}
              <div className="p-5 rounded-3xl bg-[#0D121F] border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {selectedRoom.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-white mt-1">
                      {selectedRoom.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Live Timer Display */}
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-lg font-extrabold text-white">
                        {formatSeconds(timeRemaining)}
                      </span>
                    </div>

                    <a
                      href={`/simulator?room=${selectedRoom.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Simulator</span>
                    </a>
                  </div>
                </div>

                {/* Simulation Control Buttons */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Panel Eksekusi Simulasi
                  </span>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Start / Resume */}
                    <button
                      onClick={() => sendAdminCommand("START")}
                      disabled={selectedRoom.status === "ACTIVE"}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Mulai / Lanjutkan</span>
                    </button>

                    {/* Pause */}
                    <button
                      onClick={() => sendAdminCommand("PAUSE")}
                      disabled={selectedRoom.status !== "ACTIVE"}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-white shadow-md shadow-amber-600/20 transition active:scale-95"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Jeda</span>
                    </button>

                    {/* Reset */}
                    <button
                      onClick={() => sendAdminCommand("RESET")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Ulang</span>
                    </button>

                    {/* Add Time +30s */}
                    <button
                      onClick={() => sendAdminCommand("ADD_TIME", { seconds: 30 })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition active:scale-95"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>+30 Detik</span>
                    </button>

                    {/* Force Bot Bid */}
                    <button
                      onClick={() => sendAdminCommand("FORCE_BOT_BID")}
                      disabled={selectedRoom.status !== "ACTIVE"}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white shadow-md shadow-purple-600/20 transition active:scale-95"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Inject Bot Bid</span>
                    </button>
                  </div>
                </div>

                {/* Bot Configuration Card */}
                {config && (
                  <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bot Toggle & Speed */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span>Bot Simulasi Otomatis</span>
                        </span>
                        <button
                          onClick={handleToggleBot}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                            config.botEnabled
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {config.botEnabled ? "AKTIF" : "NONAKTIF"}
                        </button>
                      </div>

                      <div className="pt-1">
                        <span className="text-[11px] text-slate-400">Level Agresivitas Bot:</span>
                        <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                          {(["LOW", "MEDIUM", "HIGH", "CHAOS"] as const).map((lvl) => {
                            const isCurrent = config.botAggressiveness === lvl;
                            return (
                              <button
                                key={lvl}
                                onClick={() => handleUpdateBotAggressiveness(lvl)}
                                className={`text-[10px] font-bold py-1.5 rounded-lg border transition ${
                                  isCurrent
                                    ? "bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-600/30"
                                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white"
                                }`}
                              >
                                {lvl}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Anti-Sniping & Rule Settings */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <span>Anti-Sniping Protection</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          +{selectedRoom.antiSnipingSeconds}s jika bid &lt;10s
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                        Mencegah penawar merebut lot di detik terakhir tanpa kesempatan tawar ulang bagi peserta lain.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Bids Audit Table */}
              <div className="p-5 rounded-3xl bg-[#0D121F] border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Audit Stream Penawaran Real-Time
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {recentBids.length} Catatan Masuk
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {recentBids.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      Belum ada penawaran tercatat untuk lot ini.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                          <th className="pb-2">Waktu</th>
                          <th className="pb-2">Penawar</th>
                          <th className="pb-2">Tipe</th>
                          <th className="pb-2 text-right">Nilai Tawaran</th>
                          <th className="pb-2 text-right">Kenaikan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {recentBids.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 text-slate-400 text-[11px]">
                              {new Date(b.createdAt).toLocaleTimeString("id-ID")}
                            </td>
                            <td className="py-2.5 font-bold text-white font-sans">
                              {b.bidderName}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  b.bidderType === "BOT"
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-emerald-500/20 text-emerald-300"
                                }`}
                              >
                                {b.bidderType}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-extrabold text-amber-400">
                              Rp {b.amount.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 text-right text-emerald-400 text-[11px]">
                              +{ (b.amount - b.previousAmount).toLocaleString("id-ID") }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-[#0D121F] border border-slate-800 text-slate-500 text-xs">
              Pilih salah satu lot di sebelah kiri untuk membuka panel kendali.
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah Lot Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101626] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white">Buat Lot Skenario Lelang Baru</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 mt-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Judul Lot / Item</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Patek Philippe Nautilus 5711"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Kategori</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Durasi Timer (Detik)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">URL Gambar (Unsplash / Direct)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Open Bid (Rp)</label>
                  <input
                    type="number"
                    value={newStartingPrice}
                    onChange={(e) => setNewStartingPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Kelipatan Bid (Rp)</label>
                  <input
                    type="number"
                    value={newBidIncrement}
                    onChange={(e) => setNewBidIncrement(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
                >
                  Simpan & Buat Skenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
