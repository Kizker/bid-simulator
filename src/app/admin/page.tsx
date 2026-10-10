"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSocketClient } from "@/lib/socket-client";
import { useAdminAuth } from "./layout";
import type { AuctionRoom, Bid, SimulationConfig, BotProfile, User } from "@/db/schema";
import {
  Package,
  SlidersHorizontal,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ExternalLink,
  LogOut,
  X,
  CheckCircle2,
  ChevronRight,
  Bot,
  FileJson,
  UploadCloud,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Check,
  FileText,
  Database,
  ArrowRight,
  Pencil,
  Trash2,
  Search,
  Zap,
  Activity,
  TrendingUp,
  Radio,
  Users,
  Target,
  Coffee,
  Shield,
  Sparkles,
} from "lucide-react";

type NavTab = "lots" | "control" | "users" | "bids" | "import";

export const PERSONALITY_META: Record<
  string,
  {
    label: string;
    icon: any;
    badgeClass: string;
    description: string;
    behaviorNote: string;
  }
> = {
  AGGRESSIVE: {
    label: "Agresif",
    icon: Zap,
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    description: "Cepat & Kompetitif",
    behaviorNote: "Merespon cepat (1-3 dtk), agresif menaikkan harga berulang kali untuk menekan penawar lain.",
  },
  SNIPER: {
    label: "Sniper",
    icon: Target,
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Pemburu Detik Akhir",
    behaviorNote: "Mengincar sisa detik kritis (< 30s) untuk mencuri kemenangan sebelum lelang ditutup.",
  },
  CASUAL: {
    label: "Santai",
    icon: Coffee,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Ritme Stabil & Tenang",
    behaviorNote: "Waktu respon sedang (3-6 dtk), menawar secara alami tanpa terburu-buru.",
  },
  CONSERVATIVE: {
    label: "Hemat",
    icon: Shield,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Batas Anggaran Ketat",
    behaviorNote: "Membatasi tawaran sesuai batas budget, otomatis berhenti jika harga terlalu mahal.",
  },
  ERRATIC: {
    label: "Spontan",
    icon: Sparkles,
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Pola Acak & Tak Terduga",
    behaviorNote: "Ritme tidak menentu, kecepatan respon berganti-ganti acak antara cepat dan lambat.",
  },
};

export default function AdminPage() {
  const { adminUsername, logout } = useAdminAuth();

  // Navigation tab in sidebar (Pusat Kontrol Live Bidding dijadikan utama)
  const [activeNav, setActiveNav] = useState<NavTab>("control");

  // Auction data state
  const [rooms, setRooms] = useState<AuctionRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<AuctionRoom | null>(null);
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Modals & notices
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Room Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Handphone");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newStartingPrice, setNewStartingPrice] = useState(10000000);
  const [newBidIncrement, setNewBidIncrement] = useState(20000);
  const [newDuration, setNewDuration] = useState(300);
  const [newReservePrice, setNewReservePrice] = useState(15000000);

  // JSON Import & Sync State
  const [jsonFileInfo, setJsonFileInfo] = useState<{
    available: boolean;
    fileName?: string;
    rawCount?: number;
    uniqueCount?: number;
    totalCount?: number;
    samples?: any[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isResettingUnits, setIsResettingUnits] = useState(false);
  const [importResult, setImportResult] = useState<{
    type: "success" | "error";
    message: string;
    importedUnits?: number;
  } | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadedJsonData, setUploadedJsonData] = useState<any[] | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Search in Unit List
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Unit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<AuctionRoom | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Handphone");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editLotBadge, setEditLotBadge] = useState("(AD) STANDART");
  const [editCondition, setEditCondition] = useState("Fullset");
  const [editStartingPrice, setEditStartingPrice] = useState(0);
  const [editCurrentPrice, setEditCurrentPrice] = useState(0);
  const [editBidIncrement, setEditBidIncrement] = useState(20000);
  const [editReservePrice, setEditReservePrice] = useState(0);
  const [editTimeRemaining, setEditTimeRemaining] = useState(300);
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "PAUSED" | "ENDED">("ACTIVE");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Reset confirmation modal & delete loading state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  // Centralized Live Bidding Command Center States
  const [globalBotEnabled, setGlobalBotEnabled] = useState<boolean>(true);
  const [globalBotAggressiveness, setGlobalBotAggressiveness] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CHAOS"
  >("MEDIUM");
  const [controlFilterStatus, setControlFilterStatus] = useState<
    "ALL" | "ACTIVE" | "PAUSED" | "UPCOMING" | "ENDED"
  >("ALL");
  const [controlSearch, setControlSearch] = useState<string>("");
  const [controlPage, setControlPage] = useState<number>(1);
  const controlPageSize = 15;
  const [liveBidsFeed, setLiveBidsFeed] = useState<any[]>([]);
  const [bidsFilterRoomId, setBidsFilterRoomId] = useState<string>("ALL");

  // Schedule Management State (Precision HH:mm:ss for Admin, HH:mm for Public)
  const [scheduleStartTime, setScheduleStartTime] = useState<string>("17:00:00");
  const [scheduleEndTime, setScheduleEndTime] = useState<string>("08:00:00");
  const [scheduleAutoSync, setScheduleAutoSync] = useState<boolean>(true);
  const [scheduleInfo, setScheduleInfo] = useState<{
    startTime: string;
    endTime: string;
    publicStartTime: string;
    publicEndTime: string;
    publicDisplay: string;
    autoSync: boolean;
    totalDurationSeconds: number;
    remainingSeconds: number;
    isLive: boolean;
    currentServerTime: string;
  } | null>(null);
  const [isSavingSchedule, setIsSavingSchedule] = useState<boolean>(false);
  const [scheduleFeedback, setScheduleFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Bot & User Management State
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [botSummary, setBotSummary] = useState<{
    totalBots: number;
    activeBots: number;
    inactiveBots: number;
    totalUsers: number;
    personalityCounts: Record<string, number>;
  } | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [isBotsLoading, setIsBotsLoading] = useState(false);
  const [botSubTab, setBotSubTab] = useState<"bots" | "registered_users">("bots");
  const [botSearchQuery, setBotSearchQuery] = useState("");
  const [botFilterPersonality, setBotFilterPersonality] = useState<string>("ALL");

  // Modal Add / Edit Bot
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<BotProfile | null>(null);
  const [botFormName, setBotFormName] = useState("");
  const [botFormPersonality, setBotFormPersonality] = useState<
    "AGGRESSIVE" | "SNIPER" | "CASUAL" | "CONSERVATIVE" | "ERRATIC"
  >("CASUAL");
  const [botFormMinDelay, setBotFormMinDelay] = useState(2);
  const [botFormMaxDelay, setBotFormMaxDelay] = useState(5);
  const [botFormMaxBudget, setBotFormMaxBudget] = useState(0);
  const [botFormIsActive, setBotFormIsActive] = useState(true);
  const [isSavingBot, setIsSavingBot] = useState(false);
  const [deletingBotId, setDeletingBotId] = useState<string | null>(null);

  // Live Server Clock with Milliseconds State (Pusat Kontrol Live Bidding)
  const [serverTimeDisplay, setServerTimeDisplay] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    milliseconds: string;
  }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
    milliseconds: "000",
  });
  const serverTimeOffsetRef = React.useRef<number>(0);

  // Fetch initial rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data?.rooms)) {
        setRooms(data.rooms);
        if (data.rooms.length > 0) {
          if (!selectedRoomId || !data.rooms.some((r: AuctionRoom) => r.id === selectedRoomId)) {
            setSelectedRoomId(data.rooms[0].id);
          }
        } else {
          setSelectedRoomId("");
          setSelectedRoom(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch operational schedule
  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/schedule");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && data?.schedule) {
        setScheduleInfo(data.schedule);
        setScheduleStartTime(data.schedule.startTime);
        setScheduleEndTime(data.schedule.endTime);
        setScheduleAutoSync(data.schedule.autoSync);
      }
    } catch (e) {
      console.error("Failed to fetch schedule:", e);
    }
  };

  // Save and apply schedule
  const handleSaveSchedule = async (applyNow = true) => {
    setIsSavingSchedule(true);
    setScheduleFeedback(null);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: scheduleStartTime,
          endTime: scheduleEndTime,
          autoSync: scheduleAutoSync,
          applyNow,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.schedule) {
        setScheduleInfo(data.schedule);
        setScheduleFeedback({
          type: "success",
          message: `Jadwal berhasil diterapkan! Tampilan publik: "${data.schedule.publicDisplay}". Durasi: ${formatDurationText(data.schedule.totalDurationSeconds)}.`,
        });
        await fetchRooms();
      } else {
        setScheduleFeedback({
          type: "error",
          message: data?.error || "Gagal menerapkan jadwal",
        });
      }
    } catch (err: any) {
      setScheduleFeedback({
        type: "error",
        message: err.message || "Terjadi kesalahan saat menyimpan jadwal",
      });
    } finally {
      setIsSavingSchedule(false);
      setTimeout(() => setScheduleFeedback(null), 6000);
    }
  };

  // Calculate duration helper for preview
  const calculatePreviewDuration = (startStr: string, endStr: string) => {
    const parseSec = (t: string) => {
      const parts = t.split(":").map((v) => parseInt(v, 10) || 0);
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    };
    const s = parseSec(startStr);
    const e = parseSec(endStr);
    if (e > s) return e - s;
    return 86400 - s + e;
  };

  // Format seconds to human text helper
  const formatDurationText = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const parts = [];
    if (h > 0) parts.push(`${h} Jam`);
    if (m > 0 || h > 0) parts.push(`${m} Menit`);
    parts.push(`${s} Detik`);
    return parts.join(" ");
  };

  // Fetch metadata of server's bidding-items.json
  const fetchJsonFileInfo = async () => {
    try {
      const res = await fetch("/api/rooms/import-json");
      if (res.ok) {
        const data = await res.json();
        setJsonFileInfo(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch latest global bids for feed
  const fetchGlobalBids = async () => {
    try {
      const res = await fetch("/api/bids?limit=50");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.bids)) {
          setLiveBidsFeed(data.bids);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Bot Profiles & Summary
  const fetchBots = async () => {
    setIsBotsLoading(true);
    try {
      const res = await fetch("/api/bots");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data?.bots)) {
        setBots(data.bots);
        if (data.summary) setBotSummary(data.summary);
      }
    } catch (e) {
      console.error("Failed to fetch bots:", e);
    } finally {
      setIsBotsLoading(false);
    }
  };

  // Fetch Registered Human Users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data?.users)) {
        setRegisteredUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
  };

  // Open modal for new bot
  const handleOpenAddBotModal = () => {
    setEditingBot(null);
    setBotFormName(`+628${Math.floor(10 + Math.random() * 89)}...`);
    setBotFormPersonality("CASUAL");
    setBotFormMinDelay(2);
    setBotFormMaxDelay(5);
    setBotFormMaxBudget(0);
    setBotFormIsActive(true);
    setIsBotModalOpen(true);
  };

  // Open modal for editing bot
  const handleOpenEditBotModal = (bot: BotProfile) => {
    setEditingBot(bot);
    setBotFormName(bot.name);
    setBotFormPersonality(bot.personality);
    setBotFormMinDelay(bot.minDelaySec);
    setBotFormMaxDelay(bot.maxDelaySec);
    setBotFormMaxBudget(bot.maxBudget);
    setBotFormIsActive(bot.isActive === 1);
    setIsBotModalOpen(true);
  };

  // Save bot (create or update)
  const handleSaveBot = async () => {
    if (!botFormName.trim()) {
      alert("Nama atau nomor bot wajib diisi!");
      return;
    }
    if (botFormMinDelay > botFormMaxDelay) {
      alert("Waktu respon minimal tidak boleh lebih besar dari waktu maksimal!");
      return;
    }

    setIsSavingBot(true);
    try {
      const isEdit = Boolean(editingBot);
      const url = "/api/bots";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...(isEdit ? { id: editingBot!.id } : {}),
        name: botFormName.trim(),
        personality: botFormPersonality,
        minDelaySec: botFormMinDelay,
        maxDelaySec: botFormMaxDelay,
        maxBudget: botFormMaxBudget,
        isActive: botFormIsActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data?.success) {
        showNotice(isEdit ? "Karakter bot berhasil diperbarui!" : "Bot pengguna baru berhasil ditambahkan!");
        setIsBotModalOpen(false);
        await fetchBots();
      } else {
        alert(data?.error || "Gagal menyimpan bot");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menyimpan bot");
    } finally {
      setIsSavingBot(false);
    }
  };

  // Quick toggle bot active/inactive
  const handleToggleBotActive = async (bot: BotProfile) => {
    try {
      const newStatus = bot.isActive === 1 ? 0 : 1;
      const res = await fetch("/api/bots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bot.id,
          isActive: newStatus === 1,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        showNotice(`Bot ${bot.name} sekarang ${newStatus === 1 ? "Aktif" : "Dinonaktifkan"}`);
        await fetchBots();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete bot
  const handleDeleteBot = async (bot: BotProfile) => {
    if (!confirm(`Konfirmasi: Hapus bot "${bot.name}" dari sistem?`)) return;
    setDeletingBotId(bot.id);
    try {
      const res = await fetch(`/api/bots?id=${bot.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        showNotice(`Bot "${bot.name}" berhasil dihapus.`);
        await fetchBots();
      } else {
        alert(data?.error || "Gagal menghapus bot");
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus bot");
    } finally {
      setDeletingBotId(null);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchSchedule();
    fetchJsonFileInfo();
    fetchGlobalBids();
    fetchBots();
    fetchUsers();
  }, []);

  // High-Precision Real-Time Clock Synchronizer (Jam, Menit, Detik, Milidetik)
  useEffect(() => {
    let isMounted = true;

    // 1. Sync offset from /api/server-time
    const syncTimeWithServer = async () => {
      try {
        const t0 = performance.now();
        const res = await fetch("/api/server-time");
        if (res.ok) {
          const data = await res.json();
          const t1 = performance.now();
          const rtt = t1 - t0;
          if (isMounted) {
            serverTimeOffsetRef.current = data.serverTime + rtt / 2 - t1;
          }
        }
      } catch (err) {
        console.warn("Time sync error:", err);
      }
    };

    syncTimeWithServer();
    const intervalSync = setInterval(syncTimeWithServer, 10000);

    // 2. Also listen for socket pong
    const socket = getSocketClient();
    const handleServerTimePong = (payload: { serverTime: number; clientSentTime?: number }) => {
      if (!isMounted) return;
      const rtt = payload.clientSentTime ? performance.now() - payload.clientSentTime : 0;
      serverTimeOffsetRef.current = payload.serverTime + rtt / 2 - performance.now();
    };
    socket.on("server_time", handleServerTimePong);
    socket.emit("get_server_time", performance.now());

    // 3. Smooth animation frame loop for milliseconds
    let rafId: number;
    const tickLiveClock = () => {
      const nowEst = performance.now() + serverTimeOffsetRef.current;
      const d = new Date(nowEst);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      const s = String(d.getSeconds()).padStart(2, "0");
      const ms = String(d.getMilliseconds()).padStart(3, "0");

      setServerTimeDisplay({
        hours: h,
        minutes: m,
        seconds: s,
        milliseconds: ms,
      });

      rafId = requestAnimationFrame(tickLiveClock);
    };

    rafId = requestAnimationFrame(tickLiveClock);

    return () => {
      isMounted = false;
      cancelAnimationFrame(rafId);
      clearInterval(intervalSync);
      socket.off("server_time", handleServerTimePong);
    };
  }, []);


  // Handler: Import from server's bidding-items.json
  const handleImportDefaultJson = async () => {
    if (
      !confirm(
        "Konfirmasi: Seluruh data unit lelang saat ini akan diganti secara keseluruhan dengan data dari file bidding-items.json. Lanjutkan?"
      )
    ) {
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/rooms/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: "bidding-items.json" }),
      });
      const data = await res.json();
      if (data.success) {
        setImportResult({
          type: "success",
          message: data.message || `Berhasil mengimpor ${data.totalItems} unit lelang!`,
          importedUnits: data.totalItems,
        });
        showNotice(`Berhasil menyinkronkan ${data.totalItems} unit lelang!`);
        await fetchRooms();
        await fetchJsonFileInfo();
      } else {
        setImportResult({
          type: "error",
          message: data.message || "Gagal mengimpor data JSON.",
        });
      }
    } catch (err: any) {
      setImportResult({
        type: "error",
        message: err?.message || "Terjadi kesalahan saat memproses import JSON.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Handler: Read uploaded .json file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    setImportResult(null);
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setUploadError("Hanya file berekstensi .json yang didukung.");
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          setUploadError("Format JSON harus berupa array of items/objects (contoh: [ { ... }, ... ]).");
          setUploadedJsonData(null);
          return;
        }
        if (parsed.length === 0) {
          setUploadError("File JSON tidak memiliki baris data (array kosong).");
          setUploadedJsonData(null);
          return;
        }
        setUploadedJsonData(parsed);
      } catch (err: any) {
        setUploadError("Format file tidak valid atau gagal dibaca sebagai JSON: " + err.message);
        setUploadedJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  // Handler: Apply uploaded custom JSON file
  const handleApplyUploadedJson = async () => {
    if (!uploadedJsonData || uploadedJsonData.length === 0) return;
    if (
      !confirm(
        `Konfirmasi: Seluruh unit lelang saat ini akan digantikan secara keseluruhan dengan ${uploadedJsonData.length} baris data dari file '${uploadedFileName}'. Lanjutkan?`
      )
    ) {
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/rooms/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: uploadedJsonData,
          fileName: uploadedFileName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportResult({
          type: "success",
          message: data.message || `Berhasil mengimpor ${data.totalItems} unit dari file '${uploadedFileName}'!`,
          importedUnits: data.totalItems,
        });
        showNotice(`Berhasil mengimpor ${data.totalItems} unit!`);
        await fetchRooms();
        await fetchJsonFileInfo();
      } else {
        setImportResult({
          type: "error",
          message: data.message || "Gagal mengimpor file JSON.",
        });
      }
    } catch (err: any) {
      setImportResult({
        type: "error",
        message: err?.message || "Terjadi kesalahan saat mengunggah file JSON.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Handler: Reset units (either wipe all or reset prices only)
  const handleResetUnits = async (mode: "delete_all" | "reset_prices") => {
    setIsResettingUnits(true);
    try {
      const res = await fetch("/api/rooms/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.success) {
        setIsResetModalOpen(false);
        if (mode === "delete_all") {
          setRooms([]);
          setSelectedRoomId("");
          setSelectedRoom(null);
          setRecentBids([]);
          showNotice("Seluruh daftar unit lelang berhasil dihapus dan dikosongkan.");
        } else {
          showNotice("Daftar unit lelang berhasil di-reset ke harga awal (open bid).");
          await fetchRooms();
          if (selectedRoomId) {
            fetch(`/api/rooms/${selectedRoomId}`)
              .then((r) => (r.ok ? r.json() : null))
              .then((d) => {
                if (d?.success) {
                  setSelectedRoom(d.room);
                  setRecentBids([]);
                }
              });
          }
        }
      } else {
        alert("Gagal mereset: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat mereset: " + err.message);
    } finally {
      setIsResettingUnits(false);
    }
  };

  // Handler: Open Edit Unit Modal
  const handleOpenEditModal = (room: AuctionRoom) => {
    setEditingRoom(room);
    setEditTitle(room.title);
    setEditCategory(room.category);
    setEditImageUrl(room.imageUrl);
    setEditLotBadge(room.lotBadge || "(AD) STANDART");
    setEditCondition(room.condition || "Fullset");
    setEditStartingPrice(room.startingPrice);
    setEditCurrentPrice(room.currentPrice);
    setEditBidIncrement(room.bidIncrement);
    setEditReservePrice(room.reservePrice);
    setEditTimeRemaining(room.timeRemaining);
    setEditStatus((room.status as "ACTIVE" | "PAUSED" | "ENDED") || "ACTIVE");
    setIsEditModalOpen(true);
  };

  // Handler: Save Edit Unit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/rooms/${editingRoom.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          category: editCategory,
          imageUrl: editImageUrl,
          lotBadge: editLotBadge,
          condition: editCondition,
          startingPrice: Number(editStartingPrice),
          currentPrice: Number(editCurrentPrice),
          bidIncrement: Number(editBidIncrement),
          reservePrice: Number(editReservePrice),
          timeRemaining: Number(editTimeRemaining),
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (data.success && data.room) {
        setRooms((prev) => prev.map((r) => (r.id === editingRoom.id ? data.room : r)));
        if (selectedRoomId === editingRoom.id) {
          setSelectedRoom(data.room);
          setTimeRemaining(data.room.timeRemaining);
        }
        setIsEditModalOpen(false);
        setEditingRoom(null);
        showNotice(`Unit "${data.room.title}" berhasil diperbarui!`);
      } else {
        alert("Gagal memperbarui unit: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handler: Delete single unit
  const handleDeleteUnit = async (room: AuctionRoom) => {
    if (!confirm(`Konfirmasi Hapus:\nApakah Anda yakin ingin menghapus unit lelang "${room.title}"?`)) {
      return;
    }

    setDeletingRoomId(room.id);
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => {
          const next = prev.filter((r) => r.id !== room.id);
          if (selectedRoomId === room.id) {
            if (next.length > 0) {
              setSelectedRoomId(next[0].id);
            } else {
              setSelectedRoomId("");
              setSelectedRoom(null);
            }
          }
          return next;
        });
        showNotice(`Unit "${room.title}" berhasil dihapus.`);
      } else {
        alert("Gagal menghapus unit: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      alert("Terjadi kesalahan saat menghapus: " + err.message);
    } finally {
      setDeletingRoomId(null);
    }
  };

  // Socket real-time listeners for CMS (Global Real-time Auction Sync)
  useEffect(() => {
    const socket = getSocketClient();

    // 1. Timer Tick (Updates countdown for any room in real-time)
    const handleTick = (data: { roomId: string; timeRemaining: number }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.roomId ? { ...r, timeRemaining: data.timeRemaining } : r
        )
      );
      if (data.roomId === selectedRoomId) {
        setTimeRemaining(data.timeRemaining);
      }
    };
    socket.on("timer_tick", handleTick);
    socket.on("admin_tick", handleTick);

    // 2. Bid Placed (Updates price, bid count, winner, and feeds live activity stream)
    const handleBidPlaced = (data: {
      bid: Bid;
      room: AuctionRoom;
      antiSnipingTriggered?: boolean;
    }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.room.id
            ? {
                ...r,
                currentPrice: data.room.currentPrice,
                totalBids: data.room.totalBids,
                highestBidderName: data.room.highestBidderName,
                highestBidderType: data.room.highestBidderType,
                timeRemaining: data.room.timeRemaining,
              }
            : r
        )
      );
      if (data.room.id === selectedRoomId) {
        setSelectedRoom(data.room);
        setTimeRemaining(data.room.timeRemaining);
        setRecentBids((prev) => [data.bid, ...prev.filter((b) => b.id !== data.bid.id)]);
      }
      setLiveBidsFeed((prev) => [
        { ...data.bid, roomTitle: data.room.title },
        ...prev.filter((b) => b.id !== data.bid.id).slice(0, 49),
      ]);
    };
    socket.on("bid_placed", handleBidPlaced);
    socket.on("admin_bid_placed", handleBidPlaced);

    // 3. Room Updated
    const handleRoomUpdated = (updated: AuctionRoom) => {
      setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      if (updated.id === selectedRoomId) {
        setSelectedRoom(updated);
        setTimeRemaining(updated.timeRemaining);
      }
    };
    socket.on("room_updated", handleRoomUpdated);
    socket.on("admin_room_updated", handleRoomUpdated);

    // 4. Time Extended
    const handleTimeExtended = (data: { roomId: string; timeRemaining: number; added: number }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === data.roomId ? { ...r, timeRemaining: data.timeRemaining } : r
        )
      );
      if (data.roomId === selectedRoomId) {
        setTimeRemaining(data.timeRemaining);
      }
    };
    // 5. Schedule Updated
    const handleScheduleUpdated = (payload: any) => {
      if (payload) {
        setScheduleInfo(payload);
        if (payload.startTime) setScheduleStartTime(payload.startTime);
        if (payload.endTime) setScheduleEndTime(payload.endTime);
        if (payload.autoSync !== undefined) setScheduleAutoSync(payload.autoSync);
      }
    };
    socket.on("schedule_updated", handleScheduleUpdated);
    const handleAllBotsPaused = () => {
      setGlobalBotEnabled(false);
    };
    const handleAllBotsStarted = () => {
      setGlobalBotEnabled(true);
    };
    socket.on("all_bots_paused", handleAllBotsPaused);
    socket.on("all_bots_started", handleAllBotsStarted);

    return () => {
      socket.off("timer_tick", handleTick);
      socket.off("admin_tick", handleTick);
      socket.off("bid_placed", handleBidPlaced);
      socket.off("admin_bid_placed", handleBidPlaced);
      socket.off("room_updated", handleRoomUpdated);
      socket.off("admin_room_updated", handleRoomUpdated);
      socket.off("time_extended", handleTimeExtended);
      socket.off("schedule_updated", handleScheduleUpdated);
      socket.off("schedule_applied", handleScheduleUpdated);
      socket.off("all_bots_paused", handleAllBotsPaused);
      socket.off("all_bots_started", handleAllBotsStarted);
    };
  }, [selectedRoomId]);

  const showNotice = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // GLOBAL COMMAND SENDER (Affects ALL auction rooms simultaneously)
  const sendGlobalCommand = (action: string, payload?: any) => {
    const socket = getSocketClient();
    socket.emit("admin_command", {
      action,
      roomId: "ALL",
      payload,
    });
    const actionLabels: Record<string, string> = {
      START_BOTS: "Mengaktifkan seluruh bot simulasi",
      PAUSE_BOTS: "Menjeda seluruh bot simulasi",
      START_ALL: "Mengaktifkan seluruh bot simulasi",
      PAUSE_ALL: "Menjeda seluruh bot simulasi",
      RESET_ALL: "Mereset tawaran seluruh unit lelang",
      ADD_TIME_ALL: `Menambah +${payload?.seconds || 30}s ke semua unit`,
      TRIGGER_RANDOM_BOT: "Memicu penawaran bot acak",
      UPDATE_ALL_CONFIG: "Memperbarui konfigurasi bot global",
    };
    showNotice(actionLabels[action] || `Perintah global ${action} berhasil dikirim.`);

    if (action === "START_BOTS" || action === "START_ALL") {
      setGlobalBotEnabled(true);
    } else if (action === "PAUSE_BOTS" || action === "PAUSE_ALL") {
      setGlobalBotEnabled(false);
    } else if (action === "RESET_ALL") {
      setRooms((prev) =>
        prev.map((r) => ({
          ...r,
          currentPrice: r.startingPrice,
          totalBids: 0,
          highestBidderName: null,
          highestBidderType: null,
          timeRemaining: r.totalDurationSeconds,
          status: scheduleInfo?.isLive ? "ACTIVE" : "UPCOMING",
        }))
      );
      setLiveBidsFeed([]);
    }
  };

  // INDIVIDUAL ROOM COMMAND SENDER (Quick actions from table)
  const sendRoomCommand = (roomId: string, action: string, payload?: any) => {
    const socket = getSocketClient();
    socket.emit("admin_command", {
      action,
      roomId,
      payload,
    });
    showNotice(`Perintah ${action} dikirim ke unit.`);
  };

  // Global Bot Toggle
  const handleToggleGlobalBot = () => {
    const nextVal = !globalBotEnabled;
    setGlobalBotEnabled(nextVal);
    sendGlobalCommand("UPDATE_ALL_CONFIG", { botEnabled: nextVal ? 1 : 0 });
    showNotice(`Bot simulasi ${nextVal ? "diaktifkan" : "dinonaktifkan"} untuk seluruh unit.`);
  };

  // Global Bot Aggressiveness
  const handleUpdateGlobalBotAggressiveness = (lvl: "LOW" | "MEDIUM" | "HIGH" | "CHAOS") => {
    setGlobalBotAggressiveness(lvl);
    sendGlobalCommand("UPDATE_ALL_CONFIG", { botAggressiveness: lvl });
    showNotice(`Agresivitas bot diubah ke ${lvl} untuk seluruh unit.`);
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
    showNotice(`Bot simulasi ${nextVal ? "diaktifkan" : "dinonaktifkan"}.`);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle || "Produk Bidding Plus Baru",
          category: newCategory,
          imageUrl:
            newImageUrl ||
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
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
        setNewTitle("");
        setNewImageUrl("");
        await fetchRooms();
        setSelectedRoomId(data.room.id);
        setActiveNav("control");
        showNotice("Unit lelang baru berhasil ditambahkan.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800">
      {/* Toast Notification */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0066D6]" />
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (CMS MODEL MATCHING PUBLIC UI/UX) */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0066D6] text-white font-black text-sm flex items-center justify-center shadow-xs">
              BP
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                BIDDING PLUS
              </h1>
              <span className="text-[10px] font-semibold text-[#0066D6] mt-0.5 inline-block">
                CMS Controller
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-3 space-y-1">
            {/* Tab 1: Kontrol Bidding (Pusat Kontrol Utama) */}
            <button
              onClick={() => setActiveNav("control")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeNav === "control"
                  ? "bg-[#EBF4FE] text-[#0066D6] font-bold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
                <span>Kontrol Live Bidding</span>
              </div>
              <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                activeNav === "control"
                  ? "bg-[#0066D6] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}>
                Pusat
              </span>
            </button>

            {/* Tab 2: Daftar Unit */}
            <button
              onClick={() => setActiveNav("lots")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeNav === "lots"
                  ? "bg-[#EBF4FE] text-[#0066D6] font-bold shadow-2xs"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Package className="w-4 h-4 stroke-[2]" />
              <span>Daftar Unit Lelang</span>
            </button>

            {/* Tab 3: Pengelola Pengguna */}
            <button
              onClick={() => {
                setActiveNav("users");
                fetchBots();
                fetchUsers();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeNav === "users"
                  ? "bg-[#EBF4FE] text-[#0066D6]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 stroke-[2]" />
                <span>Pengelola Pengguna</span>
              </div>
              {botSummary && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-[#0066D6]">
                  {botSummary.totalBots} Bot
                </span>
              )}
            </button>

            {/* Tab 4: Riwayat Penawaran */}
            <button
              onClick={() => setActiveNav("bids")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeNav === "bids"
                  ? "bg-[#EBF4FE] text-[#0066D6]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Clock className="w-4 h-4 stroke-[2]" />
              <span>Riwayat Penawaran</span>
            </button>

            {/* Tab 5: Import Data JSON */}
            <button
              onClick={() => {
                setActiveNav("import");
                fetchJsonFileInfo();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeNav === "import"
                  ? "bg-[#EBF4FE] text-[#0066D6]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileJson className="w-4 h-4 stroke-[2]" />
              <span>Import Data JSON</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer: User & Public Link */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* Admin Profile Info */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0066D6] text-white font-bold text-xs flex items-center justify-center shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">Administrator</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono truncate">{adminUsername}</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-1">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat Web Publik</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. RIGHT MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200/90 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {activeNav === "lots" && "Daftar Unit Lelang"}
              {activeNav === "control" && "Pusat Kontrol Live Bidding"}
              {activeNav === "users" && "Pengelola Pengguna & Simulasi Bot"}
              {activeNav === "bids" && "Riwayat Penawaran"}
              {activeNav === "import" && "Import & Sinkronisasi JSON"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeNav === "lots" && "Kelola semua unit dan produk yang dilelang"}
              {activeNav === "control" && "Kendali bot dan jadwal live bidding"}
              {activeNav === "users" && "Kelola bot penawar, atur karakter & kecepatan respon, dan pantau peserta terdaftar"}
              {activeNav === "bids" && "Catatan penawaran peserta dan bot secara real-time"}
              {activeNav === "import" && "Perbarui seluruh daftar unit sekaligus menggunakan file JSON"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Indicator for Control view */}
            {activeNav === "control" && (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  globalBotEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${globalBotEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                  <span>Bot: {globalBotEnabled ? "Aktif Menawar" : "Dijeda"}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-600 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{scheduleInfo?.publicDisplay || "10:00 - 16:00"}</span>
                </div>
              </div>
            )}

            {/* Actions for Users view */}
            {activeNav === "users" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    fetchBots();
                    fetchUsers();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition active:scale-95 shadow-2xs cursor-pointer"
                  title="Segarkan data bot & peserta"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isBotsLoading ? "animate-spin" : ""}`} />
                  <span>Segarkan</span>
                </button>
                <button
                  onClick={handleOpenAddBotModal}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0055B8] text-white transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah Bot</span>
                </button>
              </div>
            )}

            {/* Actions for Units view */}
            {activeNav === "lots" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  disabled={isResettingUnits}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 transition active:scale-95 shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Buka opsi reset daftar unit lelang"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isResettingUnits ? "animate-spin" : ""}`} />
                  <span>Reset Daftar Unit Lelang</span>
                </button>
                <button
                  onClick={() => {
                    setActiveNav("import");
                    fetchJsonFileInfo();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition active:scale-95 shadow-2xs cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5 text-[#0066D6]" />
                  <span>Import JSON</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0055B8] text-white transition active:scale-95 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah Unit</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 md:p-8 space-y-6 flex-1">
          {/* ===================================================== */}
          {/* TAB 1: DAFTAR UNIT LELANG */}
          {/* ===================================================== */}
          {activeNav === "lots" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-800">
                      Semua Unit Terdaftar ({rooms.length})
                    </span>
                    {searchQuery && (
                      <span className="text-[11px] font-semibold text-[#0066D6] bg-blue-50 px-2 py-0.5 rounded-full">
                        Ditemukan: {rooms.filter((r) => {
                          const query = searchQuery.toLowerCase();
                          return (
                            r.title.toLowerCase().includes(query) ||
                            (r.category && r.category.toLowerCase().includes(query)) ||
                            (r.lotBadge && r.lotBadge.toLowerCase().includes(query))
                          );
                        }).length}
                      </span>
                    )}
                  </div>

                  {rooms.length > 0 && (
                    <div className="relative max-w-xs w-full">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari nama unit lelang..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition placeholder:text-slate-400"
                      />
                    </div>
                  )}
                </div>

                {rooms.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0066D6] flex items-center justify-center mb-3">
                      <Package className="w-6 h-6 stroke-[1.75]" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Daftar Unit Masih Kosong</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Belum ada unit lelang yang terdaftar. Anda dapat menambahkan unit baru secara manual atau mengimpor data sekaligus dari file JSON.
                    </p>
                    <div className="flex items-center gap-2.5 mt-5">
                      <button
                        onClick={() => {
                          setActiveNav("import");
                          fetchJsonFileInfo();
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#EBF4FE] hover:bg-blue-100 text-[#0066D6] transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FileJson className="w-3.5 h-3.5" />
                        <span>Import Data JSON</span>
                      </button>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0055B8] text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Unit Baru</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  (() => {
                    const filtered = rooms.filter((r) => {
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      return (
                        r.title.toLowerCase().includes(query) ||
                        (r.category && r.category.toLowerCase().includes(query)) ||
                        (r.lotBadge && r.lotBadge.toLowerCase().includes(query))
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-10 text-center text-xs text-slate-400">
                          Tidak ditemukan unit lelang dengan kata kunci &quot;{searchQuery}&quot;.
                        </div>
                      );
                    }

                    return (
                      <div className="divide-y divide-slate-100">
                        {filtered.map((r) => (
                          <div
                            key={r.id}
                            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <img
                                src={r.imageUrl}
                                alt={r.title}
                                className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 truncate">
                                    {r.title}
                                  </h4>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      r.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : r.status === "PAUSED"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                    }`}
                                  >
                                    {r.status === "ACTIVE" ? "Berjalan" : r.status === "PAUSED" ? "Dijeda" : "Selesai"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Kategori: {r.category} {r.lotBadge ? `· ${r.lotBadge}` : ""} · Open Bid: Rp {r.startingPrice.toLocaleString("id-ID")}
                                </p>
                                <p className="text-xs font-extrabold text-[#0066D6] mt-1 font-mono">
                                  Rp {r.currentPrice.toLocaleString("id-ID")}{" "}
                                  <span className="text-[10px] font-normal text-slate-400 font-sans">
                                    ({r.totalBids} tawaran)
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleOpenEditModal(r)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                                title="Edit detail unit lelang"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteUnit(r)}
                                disabled={deletingRoomId === r.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer disabled:opacity-50"
                                title="Hapus unit lelang ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}          {/* ===================================================== */}
          {/* TAB 2: PUSAT KONTROL LIVE BIDDING (1 HALAMAN TERPUSAT) */}
          {/* ===================================================== */}
          {activeNav === "control" && (() => {
            const activeCount = rooms.filter((r) => r.status === "ACTIVE").length;
            const pausedCount = rooms.filter((r) => r.status === "PAUSED").length;
            const endedCount = rooms.filter((r) => r.status === "ENDED").length;
            const totalBidsCount = rooms.reduce((sum, r) => sum + (r.totalBids || 0), 0);

            const filteredControlRooms = rooms.filter((r) => {
              if (controlFilterStatus !== "ALL" && r.status !== controlFilterStatus) return false;
              if (controlSearch.trim()) {
                const q = controlSearch.toLowerCase();
                const matchTitle = r.title.toLowerCase().includes(q);
                const matchCategory = r.category.toLowerCase().includes(q);
                const matchLot = r.lotBadge?.toLowerCase().includes(q);
                if (!matchTitle && !matchCategory && !matchLot) return false;
              }
              return true;
            });

            const totalControlPages = Math.ceil(filteredControlRooms.length / controlPageSize) || 1;
            const currentControlRooms = filteredControlRooms.slice(
              (controlPage - 1) * controlPageSize,
              controlPage * controlPageSize
            );

            return (
              <div className="space-y-4">
                {/* ========================================================= */}
                {/* KARTU JAM SERVER REAL-TIME DENGAN MILIDETIK (UKURAN BESAR) */}
                {/* ========================================================= */}
                <div
                  className={`rounded-3xl border transition-all p-5 sm:p-6 shadow-xs relative overflow-hidden ${
                    scheduleInfo?.isLive
                      ? "bg-gradient-to-br from-white via-blue-50/30 to-emerald-50/20 border-[#0066D6]/40 ring-4 ring-[#0066D6]/10"
                      : "bg-white border-slate-200/90"
                  }`}
                >
                  {/* Decorative ambient background */}
                  <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Sisi Kiri: Label & Jam Raksasa */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700">
                          <Radio
                            className={`w-3 h-3 ${
                              scheduleInfo?.isLive ? "text-emerald-500 animate-pulse" : "text-slate-400"
                            }`}
                          />
                          <span>Waktu Server Presisi Tinggi</span>
                        </span>
                        {scheduleInfo?.isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3.5" />
                            <span>SESI SIMULASI LIVE BERLANGSUNG</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>STANDBY • DI LUAR JADWAL SIMULASI</span>
                          </span>
                        )}
                      </div>

                      {/* TAMPILAN JAM RAKSASA DENGAN MILIDETIK */}
                      <div className="pt-1 flex flex-wrap items-baseline gap-2 sm:gap-3">
                        {/* Jam : Menit : Detik */}
                        <div className="font-mono font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-slate-900 tabular-nums flex items-center">
                          <span className="px-2 sm:px-3 py-0.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                            {serverTimeDisplay.hours}
                          </span>
                          <span className="text-slate-300 font-light mx-1 sm:mx-1.5">:</span>
                          <span className="px-2 sm:px-3 py-0.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                            {serverTimeDisplay.minutes}
                          </span>
                          <span className="text-slate-300 font-light mx-1 sm:mx-1.5">:</span>
                          <span className="px-2 sm:px-3 py-0.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                            {serverTimeDisplay.seconds}
                          </span>
                        </div>

                        {/* Pemisah Titik & Milidetik */}
                        <div className="flex items-center gap-1.5 self-center sm:self-auto">
                          <span className="text-2xl sm:text-4xl md:text-5xl font-black text-[#0066D6] font-mono">
                            .
                          </span>
                          <div className="font-mono font-extrabold text-2xl sm:text-4xl md:text-5xl text-[#0066D6] bg-blue-50/90 px-3 py-1 sm:py-2 rounded-2xl border-2 border-blue-200/90 shadow-2xs tabular-nums">
                            {serverTimeDisplay.milliseconds}
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-400 font-sans ml-1">
                            WIB
                          </span>
                        </div>
                      </div>

                      {/* Catatan Sesi */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Jadwal Operasional:{" "}
                            <strong>{scheduleInfo?.publicDisplay || "10:00 - 16:00"}</strong>
                          </span>
                        </span>
                        {scheduleInfo?.isLive && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Sisa Sesi: {formatDurationText(scheduleInfo.remainingSeconds)}</span>
                          </span>
                        )}
                        <span className="text-slate-400">
                          (Sinkronisasi waktu server presisi milidetik)
                        </span>
                      </div>
                    </div>

                    {/* Sisi Kanan: Quick Summary Status & Mode */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-6 justify-center">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-[190px]">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                          Status Bot Simulasi
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                globalBotEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                              }`}
                            />
                            {globalBotEnabled ? "Bot Aktif Menawar" : "Bot Dijeda"}
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono">
                            {bots.filter((b) => b.isActive === 1).length} Bot
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 min-w-[190px]">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                          Penawaran Publik
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-emerald-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Selalu Terbuka
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {registeredUsers.length} Peserta
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KONTROL TERPADU: BOT & JADWAL OPERASIONAL */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Bagian Kiri: Tombol & Status Bot */}
                  <div className="flex items-center gap-3">
                    {globalBotEnabled ? (
                      <button
                        onClick={() => {
                          sendGlobalCommand("PAUSE_BOTS");
                          setGlobalBotEnabled(false);
                          showNotice("Seluruh bot berhasil dijeda");
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Jeda seluruh bot: bot berhenti menawar, countdown simulasi tetap mengikuti jadwal"
                      >
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Jeda Bot</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sendGlobalCommand("START_BOTS");
                          setGlobalBotEnabled(true);
                          showNotice("Seluruh bot berhasil diaktifkan kembali");
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Mulai seluruh bot: bot aktif menawar secara otomatis"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Mulai Bot</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 text-xs">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          globalBotEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                        }`}
                      />
                      <span className="font-bold text-slate-800">
                        {globalBotEnabled ? "Bot Aktif" : "Bot Dijeda"}
                      </span>
                    </div>
                  </div>

                  {/* Bagian Kanan: Jadwal Sesi Operasional */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-[#0066D6]" />
                      <span>Jadwal Sesi:</span>
                    </div>

                    {/* Jam Mulai */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                      <span className="text-slate-400 font-medium text-[11px]">Mulai:</span>
                      <input
                        type="time"
                        step="1"
                        value={scheduleStartTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setScheduleStartTime(val.length === 5 ? `${val}:00` : val);
                        }}
                        className="font-mono font-bold text-xs text-slate-800 bg-transparent outline-none cursor-pointer"
                      />
                    </div>

                    <span className="text-slate-400 font-medium">s/d</span>

                    {/* Jam Selesai */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                      <span className="text-slate-400 font-medium text-[11px]">Selesai:</span>
                      <input
                        type="time"
                        step="1"
                        value={scheduleEndTime}
                        onChange={(e) => {
                          const val = e.target.value;
                          setScheduleEndTime(val.length === 5 ? `${val}:00` : val);
                        }}
                        className="font-mono font-bold text-xs text-slate-800 bg-transparent outline-none cursor-pointer"
                      />
                    </div>

                    {/* Status Sesi Jadwal */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                        scheduleInfo?.isLive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          scheduleInfo?.isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      <span>{scheduleInfo?.isLive ? "Sesi Berjalan" : "Di Luar Jadwal"}</span>
                    </span>

                    {/* Tombol Terapkan */}
                    <button
                      onClick={() => handleSaveSchedule(true)}
                      disabled={isSavingSchedule}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0052B3] text-white transition active:scale-95 shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isSavingSchedule ? "Menyimpan..." : "Terapkan"}</span>
                    </button>
                  </div>
                </div>

                {/* ========================================================= */}
                {/* PANEL: BOT-BOT SIMULASI YANG SEDANG BERJALAN */}
                {/* ========================================================= */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066D6] flex items-center justify-center font-bold">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-900">
                            Bot-Bot Pengguna yang Sedang Berjalan
                          </h3>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {bots.filter((b) => b.isActive === 1).length} Bot Aktif
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Profil penawar otomatis yang sedang aktif berpartisipasi sesuai karakter masing-masing saat simulasi berjalan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => {
                          setActiveNav("users");
                          fetchBots();
                          fetchUsers();
                        }}
                        className="text-xs font-bold text-[#0066D6] hover:text-[#0052B3] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Kelola Semua Karakter Bot</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Grid Bot Cards */}
                  {bots.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Belum ada profil bot yang terdaftar. Buka tab Pengelola Pengguna untuk menambahkan bot.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {bots.map((b) => {
                        const meta = PERSONALITY_META[b.personality] || PERSONALITY_META.CASUAL;
                        const MetaIcon = meta.icon;
                        const isBotRunning = globalBotEnabled && scheduleInfo?.isLive && b.isActive === 1;
                        const lastBid = liveBidsFeed.find((bid) => bid.bidderName === b.name);

                        return (
                          <div
                            key={b.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              b.isActive === 1
                                ? isBotRunning
                                  ? "bg-slate-50/70 border-blue-200 hover:border-[#0066D6]/60 shadow-2xs"
                                  : "bg-white border-slate-200/90 hover:border-slate-300"
                                : "bg-slate-50/50 border-slate-200 opacity-60"
                            }`}
                          >
                            {/* Card Header: Avatar, Name & Edit Button */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    b.isActive === 1
                                      ? "bg-blue-50 text-[#0066D6]"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  <Bot className="w-3.5 h-3.5" />
                                </div>
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {b.name}
                                </span>
                              </div>

                              <button
                                onClick={() => handleOpenEditBotModal(b)}
                                className="p-1 rounded-md text-slate-400 hover:text-[#0066D6] hover:bg-blue-50 transition cursor-pointer"
                                title="Atur Karakter & Parameter Bot Ini"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Personality Badge & Status Tag */}
                            <div className="flex items-center justify-between gap-1 mb-2.5">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${meta.badgeClass}`}
                              >
                                <MetaIcon className="w-2.5 h-2.5" />
                                <span>{meta.label}</span>
                              </span>

                              {b.isActive === 1 ? (
                                isBotRunning ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Berjalan</span>
                                  </span>
                                ) : !globalBotEnabled ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    <span>Dijeda</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <span>Standby</span>
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                                  <span>Nonaktif</span>
                                </span>
                              )}
                            </div>

                            {/* Details: Respon delay & Budget */}
                            <div className="space-y-1 text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Respon:</span>
                                <span className="font-mono font-semibold text-slate-700">
                                  {b.minDelaySec}s – {b.maxDelaySec}s
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Budget:</span>
                                <span className="font-mono font-semibold text-slate-700">
                                  {b.maxBudget > 0
                                    ? `Rp ${b.maxBudget.toLocaleString("id-ID")}`
                                    : "Bebas"}
                                </span>
                              </div>

                              {/* Last Bid Activity if any */}
                              {lastBid && (
                                <div className="pt-1.5 mt-1 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>Tawaran terakhir:</span>
                                  <span className="font-mono font-bold text-emerald-600 truncate max-w-[100px]">
                                    Rp {lastBid.amount.toLocaleString("id-ID")}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* TABEL MONITORING UNIT (Full Width, Bersih & Luas) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
                  {/* Table Filter & Search Header */}
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Filter Status Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {(
                        [
                          { key: "ALL", label: `Semua (${rooms.length})` },
                          { key: "ACTIVE", label: `Berjalan (${activeCount})` },
                          { key: "UPCOMING", label: `Akan Datang (${rooms.filter((r) => r.status === "UPCOMING").length})` },
                          { key: "ENDED", label: `Selesai (${endedCount})` },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => {
                            setControlFilterStatus(tab.key);
                            setControlPage(1);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            controlFilterStatus === tab.key
                              ? "bg-white text-slate-900 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative min-w-[220px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={controlSearch}
                        onChange={(e) => {
                          setControlSearch(e.target.value);
                          setControlPage(1);
                        }}
                        placeholder="Cari unit atau lot..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-[#0066D6] focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Table Body */}
                  {filteredControlRooms.length === 0 ? (
                    <div className="py-14 text-center text-xs text-slate-400">
                      Tidak ada unit lelang yang sesuai dengan filter.
                    </div>
                  ) : (
                    <div className="overflow-x-auto flex-1">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-medium">
                            <th className="py-2.5 px-4">Unit Lelang</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Waktu Tersisa</th>
                            <th className="py-2.5 px-3 text-right">Harga Terkini</th>
                            <th className="py-2.5 px-4 text-center">Tawaran</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {currentControlRooms.map((r) => {
                            const isLowTime = r.timeRemaining < 30 && r.status === "ACTIVE";
                            return (
                              <tr key={r.id} className="hover:bg-slate-50/70 transition">
                                {/* Unit info */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={r.imageUrl}
                                      alt={r.title}
                                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                    />
                                    <div className="min-w-0 max-w-md">
                                      <span className="text-[10px] font-semibold text-slate-400 block truncate">
                                        {r.lotBadge || r.category}
                                      </span>
                                      <a
                                        href={`/rooms/${r.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs font-bold text-slate-900 hover:text-[#0066D6] truncate block transition"
                                        title={`${r.title} (Buka halaman publik)`}
                                      >
                                        {r.title}
                                      </a>
                                    </div>
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                      r.status === "ACTIVE"
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : r.status === "PAUSED"
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : r.status === "UPCOMING"
                                        ? "bg-blue-50 text-[#0066D6] border border-blue-200"
                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                    }`}
                                  >
                                    {r.status === "ACTIVE" && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    )}
                                    {r.status === "ACTIVE"
                                      ? "Live"
                                      : r.status === "PAUSED"
                                      ? "Dijeda"
                                      : r.status === "UPCOMING"
                                      ? "Akan Datang"
                                      : "Selesai"}
                                  </span>
                                </td>

                                {/* Timer Countdown */}
                                <td className="py-3 px-3 whitespace-nowrap">
                                  <span
                                    className={`font-mono font-bold text-xs ${
                                      isLowTime
                                        ? "text-rose-600 animate-pulse font-black"
                                        : r.status === "ACTIVE"
                                        ? "text-slate-900"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {formatSeconds(r.timeRemaining)}
                                  </span>
                                </td>

                                {/* Harga Terkini */}
                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  <span className="font-mono font-bold text-slate-900 text-xs">
                                    Rp {r.currentPrice.toLocaleString("id-ID")}
                                  </span>
                                </td>

                                {/* Total Tawaran & Penawar */}
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  <span className="font-mono font-semibold text-slate-700 text-xs">
                                    {r.totalBids || 0}x
                                  </span>
                                  {r.highestBidderName && (
                                    <span
                                      className={`block text-[9px] font-medium truncate max-w-[90px] mx-auto ${
                                        r.highestBidderType === "BOT"
                                          ? "text-[#0066D6]"
                                          : "text-emerald-600"
                                      }`}
                                      title={r.highestBidderName}
                                    >
                                      {r.highestBidderName}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Table Pagination */}
                  {totalControlPages > 1 && (
                    <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                      <span>
                        Menampilkan {(controlPage - 1) * controlPageSize + 1} -{" "}
                        {Math.min(controlPage * controlPageSize, filteredControlRooms.length)} dari{" "}
                        {filteredControlRooms.length} unit
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setControlPage((p) => Math.max(1, p - 1))}
                          disabled={controlPage === 1}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition font-semibold"
                        >
                          Sebelumnya
                        </button>
                        <span className="font-mono text-xs px-1.5">
                          {controlPage} / {totalControlPages}
                        </span>
                        <button
                          onClick={() => setControlPage((p) => Math.min(totalControlPages, p + 1))}
                          disabled={controlPage === totalControlPages}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition font-semibold"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ===================================================== */}
          {/* TAB: PENGELOLA PENGGUNA (BOT & PESERTA PUBLIK) */}
          {/* ===================================================== */}
          {activeNav === "users" && (() => {
            const filteredBots = bots.filter((b) => {
              const matchSearch =
                !botSearchQuery ||
                b.name.toLowerCase().includes(botSearchQuery.toLowerCase()) ||
                b.id.toLowerCase().includes(botSearchQuery.toLowerCase());
              const matchPers =
                botFilterPersonality === "ALL" || b.personality === botFilterPersonality;
              return matchSearch && matchPers;
            });

            const activeBotsCount = bots.filter((b) => b.isActive === 1).length;
            const inactiveBotsCount = bots.filter((b) => b.isActive === 0).length;
            const aggCount = botSummary?.personalityCounts?.AGGRESSIVE ?? bots.filter((b) => b.personality === "AGGRESSIVE").length;
            const sniperCount = botSummary?.personalityCounts?.SNIPER ?? bots.filter((b) => b.personality === "SNIPER").length;
            const casualCount = botSummary?.personalityCounts?.CASUAL ?? bots.filter((b) => b.personality === "CASUAL").length;
            const consCount = botSummary?.personalityCounts?.CONSERVATIVE ?? bots.filter((b) => b.personality === "CONSERVATIVE").length;

            return (
              <div className="space-y-6">
                {/* 4 RINGKASAN METRIK & STATISTIK */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Card 1: Total Bot Pengguna */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 relative overflow-hidden group hover:border-[#0066D6]/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Total Bot Pengguna
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066D6] flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {bots.length}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">bot profil</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {activeBotsCount} Aktif
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {inactiveBotsCount} Nonaktif
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Agresif & Sniper (Tipe Menekan & Cepat) */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 relative overflow-hidden group hover:border-orange-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Agresif &amp; Sniper
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {aggCount + sniperCount}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">kompetitif</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-orange-700 font-semibold">
                        ⚡ {aggCount} Agresif
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                        🎯 {sniperCount} Sniper
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Santai & Hemat (Tipe Tenang) */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 relative overflow-hidden group hover:border-emerald-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Santai &amp; Hemat
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Coffee className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-line gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {casualCount + consCount}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">terukur</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        ☕ {casualCount} Santai
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        🛡️ {consCount} Hemat
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Peserta Nyata Terdaftar */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 relative overflow-hidden group hover:border-blue-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Peserta Publik Nyata
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        {registeredUsers.length}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">akun pengguna</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500 font-medium">
                        Akun asli dari pendaftaran publik
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTION BAR & SUB-TAB SWITCHER */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Sub-Tab: Bot vs Peserta Nyata */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl self-start md:self-auto">
                    <button
                      onClick={() => setBotSubTab("bots")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        botSubTab === "bots"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Bot className="w-3.5 h-3.5 text-[#0066D6]" />
                      <span>Bot Pengguna</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
                        {bots.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setBotSubTab("registered_users")}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        botSubTab === "registered_users"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Peserta Publik Terdaftar</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700">
                        {registeredUsers.length}
                      </span>
                    </button>
                  </div>

                  {/* Actions Area */}
                  {botSubTab === "bots" ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search */}
                      <div className="relative flex-1 sm:w-56 min-w-[160px]">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={botSearchQuery}
                          onChange={(e) => setBotSearchQuery(e.target.value)}
                          placeholder="Cari bot (nama / nomor)..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066D6]/20 transition"
                        />
                      </div>

                      {/* Filter Personality */}
                      <select
                        value={botFilterPersonality}
                        onChange={(e) => setBotFilterPersonality(e.target.value)}
                        className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="ALL">Semua Karakter</option>
                        <option value="AGGRESSIVE">⚡ Agresif</option>
                        <option value="SNIPER">🎯 Sniper</option>
                        <option value="CASUAL">☕ Santai</option>
                        <option value="CONSERVATIVE">🛡️ Hemat</option>
                        <option value="ERRATIC">✨ Spontan</option>
                      </select>

                      {/* Add Bot Button */}
                      <button
                        onClick={handleOpenAddBotModal}
                        className="py-1.5 px-3 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0052ad] text-white transition flex items-center gap-1.5 shadow-2xs shadow-blue-500/10 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Bot</span>
                      </button>

                      {/* Refresh */}
                      <button
                        onClick={() => { fetchBots(); fetchUsers(); }}
                        disabled={isBotsLoading}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                        title="Segarkan Data"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isBotsLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchUsers}
                        className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-2.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Segarkan</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* TAB KONTEN 1: DAFTAR BOT PENGGUNA & KARAKTERNYA */}
                {botSubTab === "bots" && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Daftar Bot Pengguna &amp; Profil Karakter
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Menampilkan {filteredBots.length} dari {bots.length} bot. Setiap bot memiliki gaya respon, delay penawaran, dan batas anggaran yang berbeda.
                        </p>
                      </div>
                    </div>

                    {filteredBots.length === 0 ? (
                      <div className="p-12 text-center">
                        <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-xs font-bold text-slate-700">Tidak ada bot yang sesuai</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          {botSearchQuery || botFilterPersonality !== "ALL"
                            ? "Coba ubah kata kunci pencarian atau filter karakter."
                            : "Belum ada bot pengguna yang terdaftar. Klik 'Tambah Bot' untuk membuat profil bot baru."}
                        </p>
                        {botSearchQuery || botFilterPersonality !== "ALL" ? (
                          <button
                            onClick={() => { setBotSearchQuery(""); setBotFilterPersonality("ALL"); }}
                            className="mt-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0066D6] bg-blue-50 hover:bg-blue-100 transition"
                          >
                            Reset Filter
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2.5 px-4">Bot Pengguna</th>
                              <th className="py-2.5 px-4">Karakter &amp; Gaya Bidding</th>
                              <th className="py-2.5 px-4 text-center">Waktu Respon (Delay)</th>
                              <th className="py-2.5 px-4">Batas Anggaran</th>
                              <th className="py-2.5 px-4 text-center">Status</th>
                              <th className="py-2.5 px-4 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredBots.map((b) => {
                              const meta = PERSONALITY_META[b.personality] || PERSONALITY_META.CASUAL;
                              const MetaIcon = meta.icon;
                              const isDeletable = bots.length > 1; // Jangan hapus bot terakhir

                              return (
                                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                                  {/* Bot Name & Avatar */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                        b.isActive === 1
                                          ? "bg-blue-50 text-[#0066D6] border border-blue-200"
                                          : "bg-slate-100 text-slate-400 border border-slate-200"
                                      }`}>
                                        <Bot className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                          <span>{b.name}</span>
                                          {b.isActive === 1 ? (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Aktif"></span>
                                          ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" title="Nonaktif"></span>
                                          )}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400">
                                          ID: {b.id.slice(0, 10)}...
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Karakter Badge & Penjelasan */}
                                  <td className="py-3 px-4">
                                    <div className="space-y-1">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${meta.badgeClass}`}>
                                        <MetaIcon className="w-3 h-3" />
                                        <span>{meta.label}</span>
                                      </span>
                                      <p className="text-[11px] text-slate-500 leading-tight">
                                        {meta.description} — <span className="text-slate-400">{meta.behaviorNote}</span>
                                      </p>
                                    </div>
                                  </td>

                                  {/* Delay Penawaran */}
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">
                                      {b.minDelaySec}s – {b.maxDelaySec}s
                                    </span>
                                  </td>

                                  {/* Batas Anggaran */}
                                  <td className="py-3 px-4 font-mono">
                                    {b.maxBudget > 0 ? (
                                      <div className="font-semibold text-slate-800">
                                        Rp {b.maxBudget.toLocaleString("id-ID")}
                                      </div>
                                    ) : (
                                      <span className="text-[11px] text-slate-400 italic">
                                        Tanpa Batas
                                      </span>
                                    )}
                                  </td>

                                  {/* Toggle Status Aktif */}
                                  <td className="py-3 px-4 text-center">
                                    <button
                                      onClick={() => handleToggleBotActive(b)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                        b.isActive === 1
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                          : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                                      }`}
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${b.isActive === 1 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                                      <span>{b.isActive === 1 ? "Aktif" : "Nonaktif"}</span>
                                    </button>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditBotModal(b)}
                                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-[#0066D6] hover:border-blue-200 text-slate-600 transition cursor-pointer"
                                        title="Atur Karakter & Konfigurasi Bot"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                      </button>
                                      {isDeletable && (
                                        <button
                                          onClick={() => handleDeleteBot(b)}
                                          disabled={deletingBotId === b.id}
                                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-400 transition cursor-pointer disabled:opacity-40"
                                          title="Hapus Bot"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB KONTEN 2: DAFTAR PESERTA PUBLIK TERDAFTAR */}
                {botSubTab === "registered_users" && (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">
                          Daftar Akun Peserta Publik Terdaftar
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Total {registeredUsers.length} pengguna nyata yang telah terdaftar melalui halaman publik lelang.
                        </p>
                      </div>
                    </div>

                    {registeredUsers.length === 0 ? (
                      <div className="p-12 text-center">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-xs font-bold text-slate-700">Belum ada peserta publik terdaftar</h4>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                          Pengguna publik yang mendaftar atau melakukan login di halaman penawaran lelang akan tercatat di sini secara otomatis.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <th className="py-2.5 px-4">Nama Peserta</th>
                              <th className="py-2.5 px-4">Nomor HP / WhatsApp</th>
                              <th className="py-2.5 px-4">Kota Domisili</th>
                              <th className="py-2.5 px-4">Terdaftar Pada</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {registeredUsers.map((u) => (
                              <tr key={u.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3 px-4 font-bold text-slate-900">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                      {u.name?.slice(0, 1).toUpperCase() || "U"}
                                    </div>
                                    <span>{u.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-700">
                                  {u.phone || "-"}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  {u.city || "-"}
                                </td>
                                <td className="py-3 px-4 text-slate-500 text-[11px]">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleString("id-ID") : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ===================================================== */}
          {/* TAB 3: RIWAYAT PENAWARAN (GLOBAL & FILTERABLE) */}
          {/* ===================================================== */}
          {activeNav === "bids" && (() => {
            const displayBids =
              bidsFilterRoomId === "ALL"
                ? liveBidsFeed
                : liveBidsFeed.filter((b) => b.roomId === bidsFilterRoomId);

            return (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Catatan Riwayat Penawaran Real-Time
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Menampilkan {displayBids.length} penawaran terbaru dari seluruh unit lelang.
                      </p>
                    </div>

                    {/* Filter Room Selector Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600 shrink-0">
                        Filter Unit:
                      </span>
                      <select
                        value={bidsFilterRoomId}
                        onChange={(e) => setBidsFilterRoomId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-[#0066D6] cursor-pointer max-w-[280px]"
                      >
                        <option value="ALL">Semua Unit Lelang ({rooms.length} Unit)</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {displayBids.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400">
                      Belum ada penawaran tercatat untuk filter ini.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-medium">
                            <th className="py-2.5 px-4">Waktu</th>
                            <th className="py-2.5 px-4">Unit Lelang</th>
                            <th className="py-2.5 px-4">Nama Penawar</th>
                            <th className="py-2.5 px-4">Tipe</th>
                            <th className="py-2.5 px-4 text-right">Nilai Tawaran</th>
                            <th className="py-2.5 px-4 text-right">Kenaikan</th>
                            <th className="py-2.5 px-4 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {displayBids.map((b, idx) => (
                            <tr key={b.id || idx} className="hover:bg-slate-50/60 transition">
                              <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                {new Date(b.createdAt).toLocaleTimeString("id-ID")}
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-800 font-sans max-w-[200px] truncate">
                                {b.roomTitle || "Unit lelang"}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                                {b.bidderName}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    b.bidderType === "BOT"
                                      ? "bg-blue-50 text-[#0066D6] border border-blue-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {b.bidderType === "BOT" ? "Bot" : "Peserta"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-slate-900 whitespace-nowrap">
                                Rp {b.amount.toLocaleString("id-ID")}
                              </td>
                              <td className="py-3 px-4 text-right text-emerald-600 font-semibold text-[11px] whitespace-nowrap">
                                {b.previousAmount
                                  ? `+${(b.amount - b.previousAmount).toLocaleString("id-ID")}`
                                  : "-"}
                              </td>
                              <td className="py-3 px-4 text-center">
                                {b.roomId && (
                                  <Link
                                    href={`/rooms/${b.roomId}`}
                                    target="_blank"
                                    className="p-1 rounded-lg text-slate-400 hover:text-[#0066D6] inline-block transition"
                                    title="Buka live room lelang publik"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ===================================================== */}
          {/* TAB 4: IMPORT & SINKRONISASI JSON */}
          {/* ===================================================== */}
          {activeNav === "import" && (
            <div className="max-w-4xl space-y-6">
              {/* Feedback Alert Banner */}
              {importResult && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 animate-in fade-in duration-200 ${
                    importResult.type === "success"
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                      : "bg-rose-50/80 border-rose-200 text-rose-900"
                  }`}
                >
                  {importResult.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold">
                      {importResult.type === "success" ? "Sinkronisasi Berhasil!" : "Gagal Mengimpor JSON"}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90">{importResult.message}</p>
                    {importResult.type === "success" && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => setActiveNav("lots")}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Lihat Daftar Unit Terupdate ({rooms.length})
                        </button>
                        <Link
                          href="/"
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition"
                        >
                          Buka Katalog Publik
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informational Header Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-[#0066D6]">
                  <Database className="w-4 h-4 stroke-[2.5]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Sinkronisasi Keseluruhan Unit Lelang
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fitur ini memungkinkan Anda mengganti dan memperbarui seluruh data unit lelang di database dan memuat ulang mesin simulasi lelang secara instan tanpa perlu merestart server. Semua tawaran aktif akan direset dan seluruh unit baru akan langsung tersedia di katalog publik.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                    ⚡ Auto-Deduplikasi
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                    💰 Kelipatan Bid Rp 20.000 s/d Rp 420.000
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                    ⏱ Durasi Lelang 23 Jam 52 Menit
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80">
                    🔄 Reload Engine Otomatis
                  </span>
                </div>
              </div>

              {/* Grid: 2 Cards (Default JSON & Custom Upload) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --------------------------------------------------- */}
                {/* CARD 1: File Bawaan Server (bidding-items.json) */}
                {/* --------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066D6] flex items-center justify-center">
                          <FileJson className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">
                            File bidding-items.json
                          </h3>
                          <span className="text-[10px] text-slate-400">File server lokal proyek</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          jsonFileInfo?.available
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {jsonFileInfo?.available ? "Tersedia di Server" : "Tidak Ditemukan"}
                      </span>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-semibold block">Data Mentah</span>
                        <span className="text-base font-extrabold text-slate-900 font-mono">
                          {jsonFileInfo?.rawCount || 336} <span className="text-xs font-normal text-slate-400">baris</span>
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                        <span className="text-[10px] text-[#0066D6] font-semibold block">Total Unit Valid</span>
                        <span className="text-base font-extrabold text-[#0066D6] font-mono">
                          {jsonFileInfo?.totalCount || jsonFileInfo?.rawCount || 336} <span className="text-xs font-normal text-blue-400">unit</span>
                        </span>
                      </div>
                    </div>

                    {/* Preview Table */}
                    {jsonFileInfo?.samples && jsonFileInfo.samples.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          Contoh Item Terdeteksi:
                        </span>
                        <div className="rounded-xl border border-slate-200/80 overflow-hidden text-[11px]">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                              <tr>
                                <th className="py-1.5 px-2.5">Nama Item</th>
                                <th className="py-1.5 px-2">Grade</th>
                                <th className="py-1.5 px-2.5 text-right">Harga Mulai</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                              {jsonFileInfo.samples.slice(0, 4).map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-1.5 px-2.5 truncate max-w-[140px]" title={s.raw_name}>
                                    {s.raw_name}
                                  </td>
                                  <td className="py-1.5 px-2 font-mono text-[10px] text-[#0066D6] font-bold">
                                    {s.grade || "-"}
                                  </td>
                                  <td className="py-1.5 px-2.5 text-right font-mono text-[10px] font-bold text-slate-800">
                                    Rp {(s.auction_price || s.startingPrice || 0).toLocaleString("id-ID")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Apply Default Button */}
                  <button
                    onClick={handleImportDefaultJson}
                    disabled={isImporting || !jsonFileInfo?.available}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0055B8] text-white flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sedang Memproses Sinkronisasi...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Terapkan Seluruh {jsonFileInfo?.totalCount || jsonFileInfo?.rawCount || 336} Unit dari bidding-items.json</span>
                      </>
                    )}
                  </button>
                </div>

                {/* --------------------------------------------------- */}
                {/* CARD 2: Unggah File JSON Kustom */}
                {/* --------------------------------------------------- */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <UploadCloud className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900">
                            Unggah File JSON Kustom
                          </h3>
                          <span className="text-[10px] text-slate-400">Pilih file .json dari komputer</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        File .json
                      </span>
                    </div>

                    {/* File Input Drag/Pick Area */}
                    <div className="border-2 border-dashed border-slate-200 hover:border-[#0066D6] rounded-2xl p-5 text-center transition bg-slate-50/50">
                      <input
                        type="file"
                        accept=".json"
                        id="custom-json-upload"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="custom-json-upload"
                        className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0066D6] flex items-center justify-center">
                          <UploadCloud className="w-5 h-5 stroke-[2]" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {uploadedFileName ? uploadedFileName : "Pilih atau Seret File JSON"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Format: Array of objects dengan kolom raw_name, grade, condition, auction_price
                        </span>
                      </label>
                    </div>

                    {/* Upload Validation feedback */}
                    {uploadError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadedJsonData && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>File Siap Diterapkan:</span>
                          <span className="font-mono">{uploadedJsonData.length} baris data</span>
                        </div>
                        <p className="text-[11px] opacity-80">
                          {uploadedFileName} terverifikasi valid dan siap menggantikan seluruh unit lelang saat ini.
                        </p>
                      </div>
                    )}

                    {/* Schema Guide Accordion/Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-[10px] text-slate-500">
                      <span className="font-bold text-slate-700 block text-[11px]">
                        Contoh Format Objek JSON:
                      </span>
                      <pre className="font-mono bg-white p-2 rounded-lg border border-slate-200/80 overflow-x-auto text-[10px] text-slate-600">
{`{
  "raw_name": "samsung GALAXY S24 ULTRA 512GB",
  "grade": "AD",
  "condition": "Produk Only",
  "stock": 1,
  "auction_price": 12500000,
  "status": "Terdaftar"
}`}
                      </pre>
                    </div>
                  </div>

                  {/* Apply Custom Upload Button */}
                  <button
                    onClick={handleApplyUploadedJson}
                    disabled={isImporting || !uploadedJsonData || uploadedJsonData.length === 0}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sedang Menerapkan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          Ganti Semua Unit ({uploadedJsonData?.length || 0} Baris)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* 3. MODAL TAMBAH UNIT BARU (CLEAN LIGHT THEME) */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Unit Lelang Baru</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Produk / Item
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: iPhone 15 Pro 256GB"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition cursor-pointer"
                  >
                    <option value="Handphone">Handphone</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Durasi (Detik)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  URL Gambar Produk
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Harga Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={newStartingPrice}
                    onChange={(e) => setNewStartingPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kelipatan Bid (Rp)
                  </label>
                  <input
                    type="number"
                    value={newBidIncrement}
                    onChange={(e) => setNewBidIncrement(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0055B8] text-white shadow-xs transition cursor-pointer"
                >
                  Simpan Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL EDIT DETAIL UNIT LELANG */}
      {/* ========================================================= */}
      {isEditModalOpen && editingRoom && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Detail Unit Lelang</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {editingRoom.id}</p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingRoom(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nama Produk / Unit Lelang
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition cursor-pointer"
                  >
                    <option value="Handphone">Handphone</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Laptop">Laptop</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Grade / Badge Unit
                  </label>
                  <input
                    type="text"
                    value={editLotBadge}
                    onChange={(e) => setEditLotBadge(e.target.value)}
                    placeholder="Misal: (AD) STANDART"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kondisi
                  </label>
                  <input
                    type="text"
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    placeholder="Fullset / Product Only"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Status Lelang
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as "ACTIVE" | "PAUSED" | "ENDED")}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Berjalan)</option>
                    <option value="PAUSED">PAUSED (Dijeda)</option>
                    <option value="ENDED">ENDED (Selesai)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  URL Gambar Unit
                </label>
                <input
                  type="url"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Harga Awal / Open Bid (Rp)
                  </label>
                  <input
                    type="number"
                    value={editStartingPrice}
                    onChange={(e) => setEditStartingPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Harga Saat Ini (Rp)
                  </label>
                  <input
                    type="number"
                    value={editCurrentPrice}
                    onChange={(e) => setEditCurrentPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Kelipatan Bid (Rp)
                  </label>
                  <input
                    type="number"
                    value={editBidIncrement}
                    onChange={(e) => setEditBidIncrement(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Waktu Sisa (Detik)
                  </label>
                  <input
                    type="number"
                    value={editTimeRemaining}
                    onChange={(e) => setEditTimeRemaining(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#0066D6] transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0055B8] text-white shadow-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingEdit ? "Menyimpan..." : "Simpan Perubahan"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL RESET DAFTAR UNIT LELANG */}
      {/* ========================================================= */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 stroke-[2.25]" />
                <h3 className="text-sm font-bold text-slate-900">Reset Daftar Unit Lelang</h3>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Pilih tindakan reset yang ingin Anda lakukan terhadap daftar unit lelang saat ini:
            </p>

            <div className="space-y-3 pt-1">
              {/* Opsi 1: Kosongkan & Hapus Semua Unit */}
              <div className="p-4 rounded-2xl border-2 border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Hapus &amp; Kosongkan Semua Unit
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    0 Unit
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Menghapus seluruh <strong>{rooms.length} unit</strong> dan semua riwayat penawaran dari sistem sampai bersih (0 unit). Anda dapat mengimpor data kembali melalui menu <em>Import Data JSON</em> kapan saja.
                </p>
                <button
                  onClick={() => handleResetUnits("delete_all")}
                  disabled={isResettingUnits}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isResettingUnits ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Kosongkan &amp; Hapus Semua Unit</span>
                </button>
              </div>

              {/* Opsi 2: Reset Harga Tawaran ke Open Bid Saja */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#0066D6]" />
                    <span className="text-xs font-bold text-slate-900">
                      Reset Tawaran ke Open Bid Saja
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0066D6]">
                    Pertahankan Unit
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Pertahankan semua <strong>{rooms.length} unit lelang</strong>, namun kembalikan harga penawaran saat ini ke harga awal (open bid) dan hapus seluruh histori penawaran.
                </p>
                <button
                  onClick={() => handleResetUnits("reset_prices")}
                  disabled={isResettingUnits}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 active:scale-[0.99] text-slate-700 transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {isResettingUnits ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5" />
                  )}
                  <span>Reset Tawaran ke Open Bid</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* MODAL: ATUR KARAKTER & KONFIGURASI BOT PENGGUNA */}
      {/* ===================================================== */}
      {isBotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066D6] flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingBot ? "Atur Karakter & Konfigurasi Bot" : "Tambah Bot Pengguna Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sesuaikan identitas, gaya karakter penawaran, delay, dan batas budget.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBotModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto text-xs">
              {/* Field 1: Nama / Nomor HP */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Nama / Nomor HP Penawar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={botFormName}
                  onChange={(e) => setBotFormName(e.target.value)}
                  placeholder="Misal: +6281298492048 atau Budi Santoso"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066D6]/20 focus:border-[#0066D6] transition font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nama atau nomor ini akan tampil di riwayat feed lelang publik sebagai penawar.
                </p>
              </div>

              {/* Field 2: Pilihan Tipe Karakter (5 Card Pilihan) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Pilih Karakter &amp; Gaya Bidding <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(
                    [
                      { key: "AGGRESSIVE", label: "⚡ Agresif", sub: "Cepat & Kompetitif", desc: "Merespon cepat (1-3 dtk), agresif menaikkan harga untuk menekan peserta lain." },
                      { key: "SNIPER", label: "🎯 Sniper", sub: "Pemburu Detik Terakhir", desc: "Menunggu sisa waktu lelang kritis (< 45s) untuk mencuri kemenangan." },
                      { key: "CASUAL", label: "☕ Santai", sub: "Ritme Normal & Natural", desc: "Menawar dengan jeda sedang (3-6 dtk) secara santai tanpa terburu-buru." },
                      { key: "CONSERVATIVE", label: "🛡️ Hemat", sub: "Batas Anggaran Ketat", desc: "Membatasi diri berdasarkan batas anggaran, berhenti saat melebihi budget." },
                      { key: "ERRATIC", label: "✨ Spontan", sub: "Pola Acak & Tak Tertebak", desc: "Ritme berubah-ubah secara dinamis antara cepat dan lambat." },
                    ] as const
                  ).map((pers) => {
                    const isSelected = botFormPersonality === pers.key;
                    return (
                      <div
                        key={pers.key}
                        onClick={() => setBotFormPersonality(pers.key)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? "border-[#0066D6] bg-blue-50/50 shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-[#0066D6] bg-[#0066D6]"
                            : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900">{pers.label}</span>
                            <span className="text-[10px] font-medium text-slate-500">{pers.sub}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {pers.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Waktu Respon Delay (Min & Max Detik) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Respon Minimal (Detik)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={botFormMinDelay}
                    onChange={(e) => setBotFormMinDelay(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066D6]/20 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Respon Maksimal (Detik)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={botFormMaxDelay}
                    onChange={(e) => setBotFormMaxDelay(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066D6]/20 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Field 4: Batas Anggaran Maksimal */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Batas Anggaran Maksimal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000000}
                    value={botFormMaxBudget}
                    onChange={(e) => setBotFormMaxBudget(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066D6]/20 font-mono font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Ketik <strong>0</strong> untuk tidak membatasi anggaran (bot menawar bebas).
                </p>
              </div>

              {/* Field 5: Status Keaktifan */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Status Keaktifan Bot</span>
                  <span className="text-[11px] text-slate-500">
                    Jika aktif, bot akan berpartisipasi menawar saat sesi jadwal lelang berlangsung.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBotFormIsActive((v) => !v)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    botFormIsActive ? "bg-[#0066D6]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform transform shadow-sm ${
                      botFormIsActive ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsBotModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBot}
                disabled={isSavingBot}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0066D6] hover:bg-[#0052ad] text-white transition flex items-center gap-1.5 shadow-2xs shadow-blue-500/10 cursor-pointer disabled:opacity-50"
              >
                {isSavingBot ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{editingBot ? "Simpan Perubahan Karakter" : "Tambahkan Bot"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
