"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MobileFrame } from "@/components/simulator/MobileFrame";
import dynamic from "next/dynamic";
import { LoginScreen } from "@/components/bidding-plus/LoginScreen";

const RegisterScreen = dynamic(
  () => import("@/components/bidding-plus/RegisterScreen").then((m) => m.RegisterScreen)
);
const HomeScreen = dynamic(
  () => import("@/components/bidding-plus/HomeScreen").then((m) => m.HomeScreen)
);
const SessionsScreen = dynamic(
  () => import("@/components/bidding-plus/SessionsScreen").then((m) => m.SessionsScreen)
);
const CatalogScreen = dynamic(
  () => import("@/components/bidding-plus/CatalogScreen").then((m) => m.CatalogScreen)
);
const LiveDetailScreen = dynamic(
  () => import("@/components/bidding-plus/LiveDetailScreen").then((m) => m.LiveDetailScreen)
);
const WinningModal = dynamic(
  () => import("@/components/simulator/WinningModal").then((m) => m.WinningModal)
);

import { getSocketClient } from "@/lib/socket-client";
import type { AuctionRoom, Bid, SimulationConfig, User } from "@/db/schema";
import type { BidModalState } from "@/components/bidding-plus/BidResponseModal";

type ScreenType = "login" | "register" | "home" | "sessions" | "catalog" | "detail";

function getDefaultStack(screen: ScreenType): ScreenType[] {
  switch (screen) {
    case "detail":
      return ["home", "sessions", "catalog", "detail"];
    case "catalog":
      return ["home", "sessions", "catalog"];
    case "sessions":
      return ["home", "sessions"];
    case "home":
      return ["home"];
    case "register":
      return ["login", "register"];
    case "login":
    default:
      return ["login"];
  }
}

function MainAppContent() {
  const searchParams = useSearchParams();

  // Persistent Auth & Navigation state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("login");
  const [historyStack, setHistoryStack] = useState<ScreenType[]>(["login"]);

  // Auction data state
  const [rooms, setRooms] = useState<AuctionRoom[]>([]);
  const [selectedLot, setSelectedLot] = useState<AuctionRoom | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(45240); // 12h 34m
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWinningModal, setShowWinningModal] = useState(false);
  const [bidModal, setBidModal] = useState<BidModalState | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<string>("17:00");

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.schedule?.publicStartTime) {
          setSessionStartTime(data.schedule.publicStartTime);
        }
      })
      .catch(console.error);
  }, []);

  // Restore session and last opened screen on reload
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("bidding_user");
      const savedScreen = localStorage.getItem("bidding_last_screen") as ScreenType | null;
      const savedHistoryStr = localStorage.getItem("bidding_history_stack");
      const urlScreen = searchParams?.get("screen") as ScreenType | null;

      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr) as User;
        if (parsed?.name && parsed?.phone) {
          setCurrentUser(parsed);

          // Restore exact screen for logged in user
          let targetScreen: ScreenType = urlScreen || savedScreen || "home";
          if (targetScreen === "login" || targetScreen === "register") {
            targetScreen = "home";
          }

          setCurrentScreen(targetScreen);

          // Restore history stack so back button works smoothly
          if (savedHistoryStr) {
            try {
              const parsedStack = JSON.parse(savedHistoryStr);
              if (Array.isArray(parsedStack) && parsedStack.length > 0) {
                setHistoryStack(parsedStack);
              } else {
                setHistoryStack(getDefaultStack(targetScreen));
              }
            } catch {
              setHistoryStack(getDefaultStack(targetScreen));
            }
          } else {
            setHistoryStack(getDefaultStack(targetScreen));
          }

          try {
            localStorage.setItem("bidding_last_screen", targetScreen);
          } catch {}
        } else {
          // Corrupted data, require login
          localStorage.removeItem("bidding_user");
          const targetScreen = savedScreen === "register" || urlScreen === "register" ? "register" : "login";
          setCurrentScreen(targetScreen);
          setHistoryStack([targetScreen]);
        }
      } else {
        // Not logged in: remember if user was on register or login
        const targetScreen = savedScreen === "register" || urlScreen === "register" ? "register" : "login";
        setCurrentScreen(targetScreen);
        setHistoryStack([targetScreen]);
      }
    } catch (e) {
      console.warn("Failed to restore saved user/screen state:", e);
      setCurrentScreen("login");
    } finally {
      setIsAuthLoaded(true);
    }
  }, [searchParams]);

  // Safe fetch all rooms from API
  const fetchAllRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (!res.ok) {
        console.warn("API /api/rooms returned non-200 status:", res.status);
        return;
      }
      const data = await res.json();
      if (data?.success && Array.isArray(data?.rooms)) {
        setRooms(data.rooms);

        if (data.rooms.length > 0) {
          // Determine which lot was opened
          const lotFromUrl = searchParams?.get("lot");
          const lotFromStorage = typeof window !== "undefined" ? localStorage.getItem("bidding_last_lot_id") : null;
          const targetLotId = lotFromUrl || lotFromStorage || data.rooms[0].id;

          const matched = data.rooms.find((r: AuctionRoom) => r.id === targetLotId) || data.rooms[0];
          if (matched) {
            setSelectedLot(matched);
            setTimeRemaining(matched.timeRemaining);
          }
        } else {
          setSelectedLot(null);
        }
      }
    } catch (e) {
      console.error("Gagal mengambil data rooms:", e);
    }
  };

  useEffect(() => {
    // Optimasi LCP/FCP: Jangan unduh 336 lot room di layar login sebelum user masuk
    if (currentUser || (currentScreen !== "login" && currentScreen !== "register")) {
      fetchAllRooms();
    }
  }, [currentUser, currentScreen]);

  // Connect to Socket.io for live updates
  useEffect(() => {
    if (!selectedLot || currentScreen !== "detail") return;
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
      }
    });

    socket.on("bid_placed", (data: { bid: Bid; room: AuctionRoom; antiSnipingTriggered: boolean }) => {
      // Selalu perbarui daftar katalog di background
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.room.id
            ? { ...r, currentPrice: data.room.currentPrice, totalBids: data.room.totalBids }
            : r
        )
      );

      // KETENTUAN USER: sistem refresh tidak bisa langsung masuk setiap ada yang baru menawar.
      // Hanya perbarui room aktif jika penawaran berasal dari USER sendiri.
      // Jika penawaran berasal dari BOT / penawar lain, JANGAN update room view yang sedang terbuka secara otomatis!
      if (data.room.id === selectedLot?.id && data.bid.bidderType === "USER") {
        setSelectedLot(data.room);
        setTimeRemaining(data.room.timeRemaining);
        setBids((prev) => [data.bid, ...prev.filter((b) => b.id !== data.bid.id)]);
      }
    });

    socket.on("room_updated", (updated: AuctionRoom) => {
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

      if (updated.id === selectedLot?.id) {
        if (updated.status === "ENDED") {
          setSelectedLot((prev) => (prev ? { ...prev, status: "ENDED" } : updated));
          setShowWinningModal(true);
          return;
        }

        // Jangan auto-update harga/penawar tertinggi di dalam room jika bukan penawaran user sendiri
        // Hanya update jika user sendiri atau jika room status diubah (PAUSED / UPCOMING / RESET / totalBids === 0)
        if (
          updated.highestBidderType === "USER" ||
          updated.status !== "ACTIVE" ||
          updated.totalBids === 0
        ) {
          setSelectedLot(updated);
          setTimeRemaining(updated.timeRemaining);
        }
      }
    });

    socket.on("bids_cleared", (data: { roomId: string }) => {
      if (data.roomId === selectedLot?.id) {
        setBids([]);
        setShowWinningModal(false);
        setSelectedLot((prev) =>
          prev
            ? {
                ...prev,
                currentPrice: prev.startingPrice,
                totalBids: 0,
                highestBidderName: null,
                highestBidderType: null,
              }
            : null
        );
      }
    });

    socket.on("all_rooms_reset", () => {
      setBids([]);
      setShowWinningModal(false);
      fetchAllRooms();
    });

    socket.on("auction_ended", (data: { roomId: string }) => {
      if (data.roomId === selectedLot?.id) {
        setShowWinningModal(true);
      }
    });

    socket.on("bid_success", () => {
      setIsSubmitting(false);
      const numMatch = selectedLot?.id.match(/\d+/);
      const lotNum = numMatch ? numMatch[0].padStart(2, "0") : "01";
      setBidModal({
        isOpen: true,
        type: "success",
        title: "Berhasil",
        message: `Berhasil Menawar Produk #${lotNum}`,
      });
    });

    socket.on(
      "bid_error",
      (err: {
        message: string;
        code?: string;
        latestRoom?: AuctionRoom;
        latestBids?: Bid[];
      }) => {
        setIsSubmitting(false);

        // KETENTUAN USER: klik tawar untuk merefresh
        // Ketika klik tawar dan mendapat respon penolakan (misal PRICE_TOO_LOW),
        // update data room dan recentBids dengan data server terkini!
        if (err.latestRoom && err.latestRoom.id === selectedLot?.id) {
          setSelectedLot(err.latestRoom);
          setTimeRemaining(err.latestRoom.timeRemaining);
        }
        if (err.latestBids) {
          setBids(err.latestBids);
        }

        if (err.code === "PRICE_TOO_LOW") {
          setBidModal({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: "Harga tidak boleh sama atau kurang dari tawaran sebelumnya",
            code: "PRICE_TOO_LOW",
          });
        } else if (err.code === "ALREADY_HIGHEST") {
          setBidModal({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: err.message || "Harap menunggu user lain untuk menawar",
            code: "ALREADY_HIGHEST",
          });
        } else {
          setBidModal({
            isOpen: true,
            type: "error",
            title: "Gagal",
            message: err.message || "Terjadi Kesalahan",
            code: err.code,
          });
        }
      }
    );

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
  }, [selectedLot?.id, currentScreen]);

  // Navigation handlers with persistence
  const navigateTo = (next: ScreenType) => {
    setHistoryStack((prev) => {
      const updated = [...prev, next];
      try {
        localStorage.setItem("bidding_history_stack", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setCurrentScreen(next);
    try {
      localStorage.setItem("bidding_last_screen", next);
    } catch {}
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop();
      const prev = newStack[newStack.length - 1];

      // If user is logged in, going back should never trap into login/register
      if (currentUser && (prev === "login" || prev === "register")) {
        setHistoryStack(["home"]);
        setCurrentScreen("home");
        try {
          localStorage.setItem("bidding_last_screen", "home");
          localStorage.setItem("bidding_history_stack", JSON.stringify(["home"]));
        } catch {}
        return;
      }

      setHistoryStack(newStack);
      setCurrentScreen(prev);
      try {
        localStorage.setItem("bidding_last_screen", prev);
        localStorage.setItem("bidding_history_stack", JSON.stringify(newStack));
      } catch {}
    } else {
      let prev: ScreenType = "home";
      if (currentScreen === "detail") prev = "catalog";
      else if (currentScreen === "catalog") prev = "sessions";
      else if (currentScreen === "sessions") prev = "home";
      else if (currentScreen === "home") {
        return;
      } else if (currentScreen === "register") {
        prev = "login";
      }

      setCurrentScreen(prev);
      try {
        localStorage.setItem("bidding_last_screen", prev);
      } catch {}
    }
  };

  const handlePlaceBid = (amount: number, clientPrice?: number) => {
    if (!selectedLot) return;
    setIsSubmitting(true);
    const socket = getSocketClient();
    socket.emit("place_bid", {
      roomId: selectedLot.id,
      bidderName: "Kamu",
      amount,
      clientPrice: clientPrice ?? selectedLot.currentPrice,
    });
  };

  const handleSelectLot = (lot: AuctionRoom) => {
    setSelectedLot(lot);
    try {
      localStorage.setItem("bidding_last_lot_id", lot.id);
    } catch {}

    // KETENTUAN USER: keluar ke katalog dulu baru masuk ke room bid barang lagi
    // agar mendapatkan data penawaran paling atas
    const socket = getSocketClient();
    socket.emit("join_room", lot.id);

    navigateTo("detail");
  };

  // Pastikan saat masuk kembali ke screen detail, room data selalu disinkronkan dengan data terbaru server
  useEffect(() => {
    if (currentScreen === "detail" && selectedLot) {
      const socket = getSocketClient();
      socket.emit("join_room", selectedLot.id);
    }
  }, [currentScreen]);

  // Explicit Logout: user only exits session if this function is triggered
  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("bidding_user");
      localStorage.removeItem("bidding_last_lot_id");
      localStorage.removeItem("bidding_home_tab");
      localStorage.setItem("bidding_last_screen", "login");
      localStorage.setItem("bidding_history_stack", JSON.stringify(["login"]));
    } catch {}
    setHistoryStack(["login"]);
    setCurrentScreen("login");
  };

  // Successful Login / Register handler: save persistent session
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("bidding_user", JSON.stringify(user));
      localStorage.setItem("bidding_last_screen", "home");
      localStorage.setItem("bidding_history_stack", JSON.stringify(["home"]));
    } catch {}
    setHistoryStack(["home"]);
    setCurrentScreen("home");
  };

  // Hanya tampilkan loading jika sedang membuka detail room tetapi data rooms belum selesai diambil
  if (currentScreen === "detail" && !selectedLot && rooms.length === 0) {
    return (
      <MobileFrame>
        <div className="flex-1 flex flex-col items-center justify-center bg-white text-slate-500 text-xs font-mono">
          <div className="w-8 h-8 rounded-full border-2 border-[#0055B8] border-t-transparent animate-spin mb-3" />
          <span>Memuat Bidding Plus...</span>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame
      activeScreen={currentScreen}
      onNavigateScreen={(screen: ScreenType) => {
        navigateTo(screen);
      }}
      onAndroidBack={handleBack}
      onAndroidHome={() => {
        if (currentUser) {
          setHistoryStack(["home"]);
          setCurrentScreen("home");
          try {
            localStorage.setItem("bidding_last_screen", "home");
            localStorage.setItem("bidding_history_stack", JSON.stringify(["home"]));
          } catch {}
        } else {
          setCurrentScreen("login");
        }
      }}
    >
      {/* 1. Layar Masuk (Login) */}
      {currentScreen === "login" && (
        <LoginScreen
          onSuccess={handleAuthSuccess}
          onGoToRegister={() => navigateTo("register")}
        />
      )}

      {/* 2. Layar Pendaftaran Akun Baru (Register) */}
      {currentScreen === "register" && (
        <RegisterScreen
          onBackToLogin={() => navigateTo("login")}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. Layar Beranda */}
      {currentScreen === "home" && (
        <HomeScreen
          user={currentUser}
          onLogout={handleLogout}
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
          rooms={rooms}
          onBack={handleBack}
          onSelectSession={(sessionType) => {
            if (sessionType === "reguler") {
              navigateTo("catalog");
            } else {
              alert(`Sesi ${sessionType} dibuka pukul ${sessionStartTime}.`);
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
          bidModal={bidModal}
          onCloseBidModal={() => setBidModal(null)}
        />
      )}

      {/* Winning Celebration Modal */}
      {showWinningModal && selectedLot && (
        <WinningModal
          room={selectedLot}
          userName={currentUser?.name || "Kamu"}
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

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <MobileFrame>
          <div className="flex-1 flex flex-col justify-between p-6 bg-white" />
        </MobileFrame>
      }
    >
      <MainAppContent />
    </Suspense>
  );
}
