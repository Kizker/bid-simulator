"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MobileFrame } from "@/components/simulator/MobileFrame";
import { AuctionHeader } from "@/components/simulator/AuctionHeader";
import { ItemShowcase } from "@/components/simulator/ItemShowcase";
import { LiveBidTicker } from "@/components/simulator/LiveBidTicker";
import { StickyBidControls } from "@/components/simulator/StickyBidControls";
import { WinningModal } from "@/components/simulator/WinningModal";
import { getSocketClient } from "@/lib/socket-client";
import { soundFX } from "@/lib/audio";
import type { AuctionRoom, Bid, SimulationConfig } from "@/db/schema";
import { Layers, AlertCircle, Sparkles } from "lucide-react";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const requestedRoomId = searchParams?.get("room") || "room-1";

  const [currentRoomId, setCurrentRoomId] = useState<string>(requestedRoomId);
  const [room, setRoom] = useState<AuctionRoom | null>(null);
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);
  const [userName, setUserName] = useState<string>("Sultan_Muda");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<AuctionRoom[]>([]);
  const [isRoomPickerOpen, setIsRoomPickerOpen] = useState(false);

  const prevHighestBidderRef = useRef<string | null>(null);

  // Fetch all rooms for quick lot switching
  useEffect(() => {
    fetch("/api/rooms")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rooms) {
          setAvailableRooms(data.rooms);
        }
      })
      .catch(console.error);
  }, []);

  // Connect to Socket.io and Room Channel
  useEffect(() => {
    const socket = getSocketClient();

    socket.emit("join_room", currentRoomId);

    socket.on("initial_state", (data: { room: AuctionRoom; config: SimulationConfig; recentBids: Bid[] }) => {
      setRoom(data.room);
      setConfig(data.config);
      setBids(data.recentBids);
      setTimeRemaining(data.room.timeRemaining);
      prevHighestBidderRef.current = data.room.highestBidderName;
      if (data.room.status === "ENDED") {
        setShowWinningModal(true);
      }
    });

    socket.on("timer_tick", (data: { roomId: string; timeRemaining: number }) => {
      if (data.roomId === currentRoomId) {
        setTimeRemaining(data.timeRemaining);
        if (data.timeRemaining <= 5 && data.timeRemaining > 0) {
          soundFX.playTick();
        }
      }
    });

    socket.on("bid_placed", (data: { bid: Bid; room: AuctionRoom; antiSnipingTriggered: boolean; extendedSeconds: number }) => {
      if (data.room.id === currentRoomId) {
        setRoom(data.room);
        setBids((prev) => [data.bid, ...prev.filter((b) => b.id !== data.bid.id)]);
        setTimeRemaining(data.room.timeRemaining);

        // Check if user was just outbid
        if (
          prevHighestBidderRef.current === userName &&
          data.bid.bidderName !== userName
        ) {
          soundFX.playOutbidWarning();
          showToast(`⚠️ Kamu terlewati oleh ${data.bid.bidderName}!`);
        }

        prevHighestBidderRef.current = data.room.highestBidderName;

        if (data.antiSnipingTriggered) {
          soundFX.playAntiSnipingAlert();
          showToast(`⏱️ Anti-Sniping Aktif! Durasi lelang bertambah +${data.extendedSeconds} detik!`);
        }
      }
    });

    socket.on("room_updated", (updatedRoom: AuctionRoom) => {
      if (updatedRoom.id === currentRoomId) {
        setRoom(updatedRoom);
        setTimeRemaining(updatedRoom.timeRemaining);
        prevHighestBidderRef.current = updatedRoom.highestBidderName;
        if (updatedRoom.status === "ENDED") {
          setShowWinningModal(true);
        }
      }
    });

    socket.on("time_extended", (data: { roomId: string; timeRemaining: number; added: number }) => {
      if (data.roomId === currentRoomId) {
        setTimeRemaining(data.timeRemaining);
        soundFX.playAntiSnipingAlert();
        showToast(`⏱️ Waktu ditambah +${data.added} detik oleh Admin!`);
      }
    });

    socket.on("bids_cleared", (data: { roomId: string }) => {
      if (data.roomId === currentRoomId) {
        setBids([]);
        setShowWinningModal(false);
        showToast("🔄 Simulasi telah di-reset.");
      }
    });

    socket.on("auction_ended", (data: { roomId: string }) => {
      if (data.roomId === currentRoomId) {
        setShowWinningModal(true);
      }
    });

    socket.on("bid_error", (err: { message: string }) => {
      setIsSubmitting(false);
      showToast(err.message || "Tawaran gagal.");
    });

    socket.on("bid_success", () => {
      setIsSubmitting(false);
    });

    return () => {
      socket.emit("leave_room", currentRoomId);
      socket.off("initial_state");
      socket.off("timer_tick");
      socket.off("bid_placed");
      socket.off("room_updated");
      socket.off("time_extended");
      socket.off("bids_cleared");
      socket.off("auction_ended");
      socket.off("bid_error");
      socket.off("bid_success");
    };
  }, [currentRoomId, userName]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  const handlePlaceBid = (amount: number) => {
    setIsSubmitting(true);
    const socket = getSocketClient();
    socket.emit("place_bid", {
      roomId: currentRoomId,
      bidderName: userName,
      amount,
    });
  };

  const handleResetSimulation = () => {
    const socket = getSocketClient();
    socket.emit("admin_command", {
      action: "RESET",
      roomId: currentRoomId,
    });
    setShowWinningModal(false);
  };

  const handleSelectRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setIsRoomPickerOpen(false);
    setShowWinningModal(false);
  };

  if (!room) {
    return (
      <MobileFrame>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm">Menghubungkan ke Ruang Lelang...</h3>
          <p className="text-xs text-slate-400 mt-1">Menginisialisasi channel Socket.io</p>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame roomTitle={room.title}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-14 inset-x-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900/95 border border-amber-500/60 text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl shadow-xl backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Lot / Room Switcher Floating Trigger */}
      <button
        onClick={() => setIsRoomPickerOpen(!isRoomPickerOpen)}
        className="absolute top-3 right-4 z-40 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 flex items-center gap-1 text-[10px] font-semibold transition"
        title="Ganti Lot Lelang"
      >
        <Layers className="w-3.5 h-3.5 text-amber-400" />
        <span>Pilih Lot</span>
      </button>

      {/* Lot Switcher Drawer */}
      {isRoomPickerOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-[#111827] rounded-3xl p-4 border border-slate-700 max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Pilih Skenario Lelang
              </h3>
              <button
                onClick={() => setIsRoomPickerOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Tutup ✕
              </button>
            </div>
            <div className="py-2 space-y-2 overflow-y-auto flex-1">
              {availableRooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectRoom(r.id)}
                  className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition ${
                    r.id === currentRoomId
                      ? "bg-amber-500/15 border-amber-500/60 text-white"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate">{r.title}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Open: Rp {r.startingPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      r.status === "ACTIVE"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {r.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Mobile Screen Flow */}
      <AuctionHeader room={room} timeRemaining={timeRemaining} />
      <ItemShowcase room={room} userName={userName} />
      <LiveBidTicker bids={bids} currentUserName={userName} />
      <StickyBidControls
        room={room}
        userName={userName}
        onUpdateUserName={setUserName}
        onPlaceBid={handlePlaceBid}
        isSubmitting={isSubmitting}
      />

      {/* Winning / Finished Overlay Modal */}
      {showWinningModal && (
        <WinningModal
          room={room}
          userName={userName}
          onReset={handleResetSimulation}
          onClose={() => setShowWinningModal(false)}
        />
      )}
    </MobileFrame>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0D15] flex items-center justify-center text-slate-400 text-xs font-mono">
          Memuat Simulator Bid...
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
