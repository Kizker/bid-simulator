"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MobileFrame } from "@/components/simulator/MobileFrame";
import { LoginScreen } from "@/components/bidding-plus/LoginScreen";
import { OtpScreen } from "@/components/bidding-plus/OtpScreen";
import { HomeScreen } from "@/components/bidding-plus/HomeScreen";
import { SessionsScreen } from "@/components/bidding-plus/SessionsScreen";
import { CatalogScreen } from "@/components/bidding-plus/CatalogScreen";
import { LiveDetailScreen } from "@/components/bidding-plus/LiveDetailScreen";
import { WinningModal } from "@/components/simulator/WinningModal";
import { getSocketClient } from "@/lib/socket-client";
import { soundFX } from "@/lib/audio";
import type { AuctionRoom, Bid, SimulationConfig } from "@/db/schema";

type ScreenType = "login" | "otp" | "home" | "sessions" | "catalog" | "detail";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const initialScreenParam = (searchParams?.get("screen") as ScreenType) || "login";
  const initialLotParam = searchParams?.get("lot") || "lot-1";

  // App navigation state
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(initialScreenParam);
  const [historyStack, setHistoryStack] = useState<ScreenType[]>(["login"]);
  const [phoneNumber, setPhoneNumber] = useState<string>("81373827173");

  // Auction data state
  const [rooms, setRooms] = useState<AuctionRoom[]>([]);
  const [selectedLot, setSelectedLot] = useState<AuctionRoom | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(45240); // 12h 34m
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWinningModal, setShowWinningModal] = useState(false);

  // Fetch all rooms from API
  const fetchAllRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      const data = await res.json();
      if (data.success && data.rooms) {
        setRooms(data.rooms);
        const current = data.rooms.find((r: AuctionRoom) => r.id === initialLotParam) || data.rooms[0];
        if (current) {
          setSelectedLot(current);
          setTimeRemaining(current.timeRemaining);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAllRooms();
  }, []);

  // Connect to Socket.io for live updates
  useEffect(() => {
    if (!selectedLot) return;
    const socket = getSocketClient();

    socket.emit("join_room", selectedLot.id);

    socket.on("initial_state", (data: { room: AuctionRoom; config: SimulationConfig; recentBids: Bid[] }) => {
      setSelectedLot(data.room);
      setBids(data.recentBids);
      setTimeRemaining(data.room.timeRemaining);
      if (data.room.status === "ENDED") {
        setShowWinningModal(true);
      }
    });

    socket.on("timer_tick", (data: { roomId: string; timeRemaining: number }) => {
      if (data.roomId === selectedLot?.id) {
        setTimeRemaining(data.timeRemaining);
        if (data.timeRemaining <= 5 && data.timeRemaining > 0) {
          soundFX.playTick();
        }
      }
    });

    socket.on("bid_placed", (data: { bid: Bid; room: AuctionRoom; antiSnipingTriggered: boolean }) => {
      // Update selected room if active
      if (data.room.id === selectedLot?.id) {
        setSelectedLot(data.room);
        setTimeRemaining(data.room.timeRemaining);
        setBids((prev) => [data.bid, ...prev.filter((b) => b.id !== data.bid.id)]);

        if (data.bid.bidderName !== "Kamu") {
          soundFX.playOutbidWarning();
        }
      }

      // Update room in catalog list as well!
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.room.id
            ? { ...r, currentPrice: data.room.currentPrice, totalBids: data.room.totalBids }
            : r
        )
      );
    });

    socket.on("room_updated", (updated: AuctionRoom) => {
      if (updated.id === selectedLot?.id) {
        setSelectedLot(updated);
        setTimeRemaining(updated.timeRemaining);
        if (updated.status === "ENDED") {
          setShowWinningModal(true);
        }
      }
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    });

    socket.on("bids_cleared", (data: { roomId: string }) => {
      if (data.roomId === selectedLot?.id) {
        setBids([]);
        setShowWinningModal(false);
      }
    });

    socket.on("auction_ended", (data: { roomId: string }) => {
      if (data.roomId === selectedLot?.id) {
        setShowWinningModal(true);
      }
    });

    socket.on("bid_success", () => {
      setIsSubmitting(false);
    });

    socket.on("bid_error", (err: { message: string }) => {
      setIsSubmitting(false);
      alert(err.message || "Tawaran gagal.");
    });

    return () => {
      socket.emit("leave_room", selectedLot.id);
      socket.off("initial_state");
      socket.off("timer_tick");
      socket.off("bid_placed");
      socket.off("room_updated");
      socket.off("bids_cleared");
      socket.off("auction_ended");
      socket.off("bid_success");
      socket.off("bid_error");
    };
  }, [selectedLot?.id]);

  // Navigation handlers
  const navigateTo = (next: ScreenType) => {
    setHistoryStack((prev) => [...prev, next]);
    setCurrentScreen(next);
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // remove current
      const prev = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      setCurrentScreen(prev);
    } else {
      // Default fallback
      if (currentScreen === "detail") setCurrentScreen("catalog");
      else if (currentScreen === "catalog") setCurrentScreen("sessions");
      else if (currentScreen === "sessions") setCurrentScreen("home");
      else if (currentScreen === "home") setCurrentScreen("login");
      else if (currentScreen === "otp") setCurrentScreen("login");
    }
  };

  const handlePlaceBid = (amount: number) => {
    if (!selectedLot) return;
    setIsSubmitting(true);
    const socket = getSocketClient();
    socket.emit("place_bid", {
      roomId: selectedLot.id,
      bidderName: "Kamu",
      amount,
    });
  };

  const handleSelectLot = (lot: AuctionRoom) => {
    setSelectedLot(lot);
    navigateTo("detail");
  };

  return (
    <MobileFrame
      activeScreen={currentScreen}
      onNavigateScreen={(screen: ScreenType) => {
        setHistoryStack((prev) => [...prev, screen]);
        setCurrentScreen(screen);
      }}
      onAndroidBack={handleBack}
      onAndroidHome={() => {
        setHistoryStack(["home"]);
        setCurrentScreen("home");
      }}
    >
      {/* 1. Layar Masuk */}
      {currentScreen === "login" && (
        <LoginScreen
          onSuccess={(phone) => {
            setPhoneNumber(phone);
            navigateTo("otp");
          }}
        />
      )}

      {/* 2. Layar OTP */}
      {currentScreen === "otp" && (
        <OtpScreen
          phoneNumber={phoneNumber}
          onBack={handleBack}
          onSuccess={() => navigateTo("home")}
        />
      )}

      {/* 3. Layar Beranda */}
      {currentScreen === "home" && (
        <HomeScreen
          onSelectCategory={(category) => {
            if (category === "Handphone") {
              navigateTo("sessions");
            } else {
              alert(`Kategori ${category} akan segera hadir.`);
            }
          }}
        />
      )}

      {/* 4. Layar Pilihan Sesi Handphone */}
      {currentScreen === "sessions" && (
        <SessionsScreen
          categoryTitle="Handphone"
          onBack={handleBack}
          onSelectSession={(sessionType) => {
            if (sessionType === "reguler") {
              navigateTo("catalog");
            } else {
              alert(`Sesi ${sessionType} dibuka pukul 17:00.`);
            }
          }}
        />
      )}

      {/* 5. Layar Katalog Bidding Reguler */}
      {currentScreen === "catalog" && (
        <CatalogScreen
          rooms={rooms}
          onBack={handleBack}
          onSelectLot={handleSelectLot}
        />
      )}

      {/* 6. Layar Live Bidding Room & Detail Lot */}
      {currentScreen === "detail" && selectedLot && (
        <LiveDetailScreen
          room={selectedLot}
          bids={bids}
          timeRemaining={timeRemaining}
          onBack={handleBack}
          onPlaceBid={handlePlaceBid}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Winning Celebration Modal */}
      {showWinningModal && selectedLot && (
        <WinningModal
          room={selectedLot}
          userName="Kamu"
          onReset={() => {
            const socket = getSocketClient();
            socket.emit("admin_command", { action: "RESET", roomId: selectedLot.id });
            setShowWinningModal(false);
          }}
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
        <div className="min-h-screen bg-white flex items-center justify-center text-slate-500 text-xs font-mono">
          Memuat Bidding Plus Mobile...
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
