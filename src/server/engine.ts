import { db, initDatabasePromise } from "../db";
import {
  auctionRooms,
  bids,
  simulationConfigs,
  appSettings,
  botProfiles,
  type AuctionRoom,
  type Bid,
  type SimulationConfig,
  type BotProfile,
} from "../db/schema";
import { eq, desc } from "drizzle-orm";

export interface RoomRuntimeState {
  room: AuctionRoom;
  config: SimulationConfig;
  recentBids: Bid[];
  timerInterval?: NodeJS.Timeout;
  nextBotBidAt?: number;
}

export interface ScheduleInfo {
  startTime: string;        // "HH:mm:ss" (Full precision for Admin)
  endTime: string;          // "HH:mm:ss" (Full precision for Admin)
  publicStartTime: string;  // "HH:mm" (Public display, no seconds)
  publicEndTime: string;    // "HH:mm" (Public display, no seconds)
  publicDisplay: string;    // e.g. "17.00 s/d 08.00 wib"
  autoSync: boolean;
  totalDurationSeconds: number;
  remainingSeconds: number;
  isLive: boolean;
  currentServerTime: string; // "HH:mm:ss"
}

function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(":").map((v) => parseInt(v, 10) || 0);
  const h = Math.min(23, Math.max(0, parts[0] || 0));
  const m = Math.min(59, Math.max(0, parts[1] || 0));
  const s = Math.min(59, Math.max(0, parts[2] || 0));
  return h * 3600 + m * 60 + s;
}

function normalizeTimeStr(timeStr: string, fallback = "17:00:00"): string {
  if (!timeStr) return fallback;
  const parts = timeStr.trim().split(":").map((v) => parseInt(v, 10) || 0);
  const h = String(Math.min(23, Math.max(0, parts[0] || 0))).padStart(2, "0");
  const m = String(Math.min(59, Math.max(0, parts[1] || 0))).padStart(2, "0");
  const s = String(Math.min(59, Math.max(0, parts[2] || 0))).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export type EventListener = (event: string, payload: any) => void;

// List of realistic bot phone numbers matching Bidding Plus
const BOT_NAMES = [
  "+62858...",
  "+62821...",
  "+62857...",
  "+62813...",
  "+62896...",
  "+62878...",
  "+62852...",
];

export class SimulationEngine {
  private rooms: Map<string, RoomRuntimeState> = new Map();
  private listeners: Set<EventListener> = new Set();
  private isInitialized = false;
  private botProfiles: BotProfile[] = [];

  // Operational schedule config
  private sessionStartTime: string = "17:00:00";
  private sessionEndTime: string = "08:00:00";
  private sessionAutoSync: boolean = true;
  private scheduleSyncInterval?: NodeJS.Timeout;
  private lastSyncLiveState: boolean | null = null;

  public onEvent(callback: EventListener) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(event: string, payload: any) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload);
      } catch (e) {
        console.error("Error in event listener:", e);
      }
    }
  }

  public async init() {
    if (this.isInitialized) return;

    if (initDatabasePromise) {
      await initDatabasePromise;
    }

    console.log("⚡ Initializing Simulation Engine...");
    const allRooms = await db.select().from(auctionRooms);

    for (const room of allRooms) {
      const [config] = await db
        .select()
        .from(simulationConfigs)
        .where(eq(simulationConfigs.roomId, room.id));

      const roomBids = await db
        .select()
        .from(bids)
        .where(eq(bids.roomId, room.id))
        .orderBy(desc(bids.createdAt))
        .limit(20);

      const state: RoomRuntimeState = {
        room,
        config: config || {
          roomId: room.id,
          botEnabled: 1,
          botCount: 4,
          botAggressiveness: "MEDIUM",
          botMinDelayMs: 1500,
          botMaxDelayMs: 4500,
          antiSnipingEnabled: 1,
        },
        recentBids: roomBids,
      };

      this.rooms.set(room.id, state);

      if (room.status === "ACTIVE") {
        this.startTimer(room.id);
      }
    }

    // Load schedule settings from appSettings
    try {
      const settings = await db.select().from(appSettings);
      for (const s of settings) {
        if (s.key === "session_start_time") this.sessionStartTime = s.value;
        if (s.key === "session_end_time") this.sessionEndTime = s.value;
        if (s.key === "session_auto_sync") this.sessionAutoSync = s.value === "1";
      }
    } catch (err) {
      console.warn("Could not load appSettings:", err);
    }

    // Load customizable bot profiles
    await this.reloadBots();

    if (!this.scheduleSyncInterval) {
      this.scheduleSyncInterval = setInterval(() => {
        this.checkScheduleAutoSync();
      }, 1000);
    }

    this.isInitialized = true;
    console.log(`✅ Simulation Engine initialized with ${this.rooms.size} rooms.`);
  }

  public async reloadBots() {
    try {
      this.botProfiles = await db.select().from(botProfiles);
      console.log(`🤖 Loaded ${this.botProfiles.length} bot profiles.`);
    } catch (err) {
      console.warn("Could not load botProfiles:", err);
    }
  }

  public getBots(): BotProfile[] {
    return this.botProfiles;
  }

  public getScheduleInfo(): ScheduleInfo {
    const now = new Date();
    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const currentServerTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const startSec = parseTimeToSeconds(this.sessionStartTime);
    const endSec = parseTimeToSeconds(this.sessionEndTime);

    // Total session duration
    let totalDurationSeconds = 0;
    if (endSec > startSec) {
      totalDurationSeconds = endSec - startSec;
    } else {
      // Crosses midnight (e.g. 17:00:00 -> 08:00:00 is 15h = 54000s)
      totalDurationSeconds = 86400 - startSec + endSec;
    }

    // Check if current time is within session window
    let isLive = false;
    let remainingSeconds = 0;

    if (endSec > startSec) {
      // Same day window (e.g. 09:00:00 to 17:00:00)
      isLive = currentSec >= startSec && currentSec < endSec;
      if (isLive) {
        remainingSeconds = endSec - currentSec;
      } else if (currentSec < startSec) {
        remainingSeconds = startSec - currentSec;
      } else {
        remainingSeconds = 86400 - currentSec + startSec;
      }
    } else {
      // Crosses midnight window (e.g. 17:00:00 to 08:00:00)
      isLive = currentSec >= startSec || currentSec < endSec;
      if (isLive) {
        if (currentSec >= startSec) {
          remainingSeconds = 86400 - currentSec + endSec;
        } else {
          remainingSeconds = endSec - currentSec;
        }
      } else {
        // Waiting for session to start (between endSec and startSec, e.g. 08:00:00 to 17:00:00)
        remainingSeconds = startSec - currentSec;
      }
    }

    const publicStartTime = this.sessionStartTime.slice(0, 5); // "HH:mm"
    const publicEndTime = this.sessionEndTime.slice(0, 5);     // "HH:mm"
    const publicDisplay = `${publicStartTime.replace(":", ".")} s/d ${publicEndTime.replace(":", ".")} wib`;

    return {
      startTime: this.sessionStartTime,
      endTime: this.sessionEndTime,
      publicStartTime,
      publicEndTime,
      publicDisplay,
      autoSync: this.sessionAutoSync,
      totalDurationSeconds,
      remainingSeconds,
      isLive,
      currentServerTime,
    };
  }

  public async setSessionSchedule(
    startTime: string,
    endTime: string,
    autoSync: boolean = true,
    applyNow: boolean = true
  ): Promise<ScheduleInfo> {
    const normStart = normalizeTimeStr(startTime, "17:00:00");
    const normEnd = normalizeTimeStr(endTime, "08:00:00");

    this.sessionStartTime = normStart;
    this.sessionEndTime = normEnd;
    this.sessionAutoSync = autoSync;

    const now = Date.now();
    const saveSetting = async (key: string, value: string) => {
      const existing = await db.select().from(appSettings).where(eq(appSettings.key, key));
      if (existing.length > 0) {
        await db.update(appSettings).set({ value, updatedAt: now }).where(eq(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value, updatedAt: now });
      }
    };

    try {
      await saveSetting("session_start_time", normStart);
      await saveSetting("session_end_time", normEnd);
      await saveSetting("session_auto_sync", autoSync ? "1" : "0");
    } catch (err) {
      console.error("Failed to save schedule settings to database:", err);
    }

    const info = this.getScheduleInfo();
    if (applyNow) {
      this.applyScheduleToAllRooms(info.isLive);
    }

    this.emit("schedule_updated", info);
    return info;
  }

  public applyScheduleToAllRooms(forceStartIfLive: boolean = true): ScheduleInfo {
    const schedule = this.getScheduleInfo();
    for (const [roomId, state] of this.rooms) {
      state.room.totalDurationSeconds = schedule.totalDurationSeconds;
      if (schedule.isLive) {
        state.room.timeRemaining = schedule.remainingSeconds;
        if (forceStartIfLive && state.room.status !== "ACTIVE" && state.room.status !== "ENDED") {
          this.startTimer(roomId);
        }
      } else {
        state.room.timeRemaining = schedule.totalDurationSeconds;
        if (state.room.status === "ACTIVE") {
          this.pauseTimer(roomId);
        }
        state.room.status = "UPCOMING";
      }
      this.persistRoom(roomId).catch(console.error);
      this.emit("room_updated", state.room);
    }
    this.emit("schedule_applied", schedule);
    return schedule;
  }

  public endAllRooms() {
    for (const [roomId, state] of this.rooms) {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = undefined;
      }
      state.room.status = "ENDED";
      state.room.timeRemaining = 0;
      this.persistRoom(roomId).catch(console.error);
      this.emit("room_updated", state.room);
    }
    this.emit("all_rooms_ended", {});
  }

  private checkScheduleAutoSync() {
    if (!this.sessionAutoSync || this.rooms.size === 0) return;
    const schedule = this.getScheduleInfo();

    if (this.lastSyncLiveState === null) {
      this.lastSyncLiveState = schedule.isLive;
    } else if (this.lastSyncLiveState !== schedule.isLive) {
      this.lastSyncLiveState = schedule.isLive;
      if (schedule.isLive) {
        console.log(`⏰ [AutoSync] Sesi lelang dimulai pada ${schedule.currentServerTime}. Memulai room lelang...`);
        this.applyScheduleToAllRooms(true);
        this.emit("session_started", schedule);
      } else {
        console.log(`⏰ [AutoSync] Sesi lelang berakhir pada ${schedule.currentServerTime}. Mengatur room lelang ke sesi berikutnya (UPCOMING)...`);
        this.applyScheduleToAllRooms(false);
        this.emit("session_ended", schedule);
      }
    }
  }

  public getRoomState(roomId: string): RoomRuntimeState | undefined {
    return this.rooms.get(roomId);
  }

  public getAllRooms(): AuctionRoom[] {
    return Array.from(this.rooms.values()).map((s) => s.room);
  }

  public startTimer(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    state.room.status = "ACTIVE";
    if (state.config.botEnabled) {
      this.scheduleNextBotBid(roomId);
    }

    state.timerInterval = setInterval(() => {
      this.tick(roomId);
    }, 1000);

    this.persistRoom(roomId);
    this.emit("room_updated", state.room);
  }

  public pauseTimer(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = undefined;
    }

    state.room.status = "PAUSED";
    state.nextBotBidAt = undefined;

    this.persistRoom(roomId);
    this.emit("room_updated", state.room);
  }

  public resetRoom(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = undefined;
    }

    state.room.status = "UPCOMING";
    state.room.timeRemaining = state.room.totalDurationSeconds;
    state.room.currentPrice = state.room.startingPrice;
    state.room.highestBidderName = null;
    state.room.highestBidderType = null;
    state.room.totalBids = 0;
    state.recentBids = [];

    // Delete bids from database for this room
    db.delete(bids).where(eq(bids.roomId, roomId)).execute().catch(console.error);

    this.persistRoom(roomId);
    this.emit("room_updated", state.room);
    this.emit("bids_cleared", { roomId });
  }

  public async reloadFromDatabase(roomId?: string) {
    if (roomId) {
      const [room] = await db.select().from(auctionRooms).where(eq(auctionRooms.id, roomId));
      if (!room) return;
      const [config] = await db.select().from(simulationConfigs).where(eq(simulationConfigs.roomId, roomId));
      const roomBids = await db
        .select()
        .from(bids)
        .where(eq(bids.roomId, roomId))
        .orderBy(desc(bids.createdAt))
        .limit(20);

      const existing = this.rooms.get(roomId);
      if (existing?.timerInterval) {
        clearInterval(existing.timerInterval);
      }

      const state: RoomRuntimeState = {
        room,
        config: config || {
          roomId: room.id,
          botEnabled: 0,
          botCount: 4,
          botAggressiveness: "MEDIUM",
          botMinDelayMs: 2000,
          botMaxDelayMs: 5000,
          antiSnipingEnabled: 1,
        },
        recentBids: roomBids,
      };

      this.rooms.set(roomId, state);
      if (room.status === "ACTIVE") {
        this.startTimer(roomId);
      }
      this.emit("room_updated", state.room);
    } else {
      for (const [, state] of this.rooms) {
        if (state.timerInterval) {
          clearInterval(state.timerInterval);
        }
      }
      this.rooms.clear();
      this.isInitialized = false;
      await this.init();
    }
  }

  public removeRoom(roomId: string) {
    const existing = this.rooms.get(roomId);
    if (existing?.timerInterval) {
      clearInterval(existing.timerInterval);
    }
    this.rooms.delete(roomId);
    this.emit("room_deleted", { roomId });
  }

  public clearAllRooms() {
    for (const [, state] of this.rooms) {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
    }
    this.rooms.clear();
    this.isInitialized = true;
    this.emit("all_rooms_cleared", {});
  }

  public startAllBots() {
    for (const [roomId, state] of this.rooms) {
      state.config.botEnabled = 1;
      if (state.room.status === "ACTIVE") {
        this.scheduleNextBotBid(roomId);
      }
    }
    db.update(simulationConfigs).set({ botEnabled: 1 }).execute().catch(console.error);
    this.emit("all_bots_started", { botEnabled: 1 });
    this.emit("all_configs_updated", { botEnabled: 1 });
  }

  public pauseAllBots() {
    for (const [, state] of this.rooms) {
      state.config.botEnabled = 0;
      state.nextBotBidAt = undefined;
    }
    db.update(simulationConfigs).set({ botEnabled: 0 }).execute().catch(console.error);
    this.emit("all_bots_paused", { botEnabled: 0 });
    this.emit("all_configs_updated", { botEnabled: 0 });
  }

  public startAllRooms() {
    for (const [roomId, state] of this.rooms) {
      if (state.room.status !== "ENDED") {
        state.config.botEnabled = 1;
        this.startTimer(roomId);
      }
    }
    db.update(simulationConfigs).set({ botEnabled: 1 }).execute().catch(console.error);
    this.emit("all_rooms_started", {});
    this.emit("all_configs_updated", { botEnabled: 1 });
  }

  public pauseAllRooms() {
    for (const [roomId, state] of this.rooms) {
      state.config.botEnabled = 0;
      state.nextBotBidAt = undefined;
      if (state.room.status === "ACTIVE") {
        this.pauseTimer(roomId);
      }
    }
    db.update(simulationConfigs).set({ botEnabled: 0 }).execute().catch(console.error);
    this.emit("all_rooms_paused", {});
    this.emit("all_configs_updated", { botEnabled: 0 });
  }

  public resetAllRooms() {
    for (const [roomId, state] of this.rooms) {
      state.config.botEnabled = 0;
      state.nextBotBidAt = undefined;
      this.resetRoom(roomId);
    }
    db.update(simulationConfigs).set({ botEnabled: 0 }).execute().catch(console.error);
    this.emit("all_rooms_reset", {});
    this.emit("all_configs_updated", { botEnabled: 0 });
  }

  public addTimeToAllRooms(extraSeconds: number) {
    for (const [roomId, state] of this.rooms) {
      if (state.room.status === "ACTIVE" || state.room.status === "PAUSED") {
        this.addTime(roomId, extraSeconds);
      }
    }
    this.emit("all_time_extended", { added: extraSeconds });
  }

  public updateAllConfigs(newConfig: Partial<SimulationConfig>) {
    for (const [roomId, state] of this.rooms) {
      state.config = { ...state.config, ...newConfig };
      this.emit("config_updated", { roomId, config: state.config });
    }
    db.update(simulationConfigs)
      .set(newConfig)
      .execute()
      .catch(console.error);
    this.emit("all_configs_updated", newConfig);
  }

  public async triggerRandomBotBid() {
    const activeRooms = Array.from(this.rooms.values()).filter(
      (s) => s.room.status === "ACTIVE" && Boolean(s.config.botEnabled) && s.room.timeRemaining > 2
    );
    if (activeRooms.length === 0) return;
    const randomChoice = activeRooms[Math.floor(Math.random() * activeRooms.length)];
    await this.executeBotBid(randomChoice.room.id);
  }

  public addTime(roomId: string, extraSeconds: number) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    state.room.timeRemaining += extraSeconds;
    this.persistRoom(roomId);
    this.emit("time_extended", { roomId, timeRemaining: state.room.timeRemaining, added: extraSeconds });
    this.emit("room_updated", state.room);
  }

  private tick(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state || state.room.status !== "ACTIVE") return;

    if (state.room.timeRemaining > 0) {
      state.room.timeRemaining -= 1;
      this.emit("timer_tick", {
        roomId,
        timeRemaining: state.room.timeRemaining,
      });

      // Check if it is time for a bot bid
      if (
        state.config.botEnabled &&
        state.nextBotBidAt &&
        Date.now() >= state.nextBotBidAt &&
        state.room.timeRemaining > 1
      ) {
        this.executeBotBid(roomId);
      }
    } else {
      // Auction ended
      clearInterval(state.timerInterval);
      state.timerInterval = undefined;
      state.room.status = "ENDED";

      this.persistRoom(roomId);
      this.emit("auction_ended", {
        roomId,
        winnerName: state.room.highestBidderName,
        winnerType: state.room.highestBidderType,
        finalPrice: state.room.currentPrice,
      });
      this.emit("room_updated", state.room);
    }
  }

  private scheduleNextBotBid(roomId: string, botProfile?: BotProfile) {
    const state = this.rooms.get(roomId);
    if (!state || !state.config.botEnabled || state.room.status !== "ACTIVE") return;

    let minDelay = botProfile ? botProfile.minDelaySec * 1000 : state.config.botMinDelayMs;
    let maxDelay = botProfile ? botProfile.maxDelaySec * 1000 : state.config.botMaxDelayMs;

    // Apply personality tweaks if botProfile is available
    if (botProfile) {
      if (botProfile.personality === "AGGRESSIVE") {
        minDelay = Math.max(800, minDelay * 0.7);
        maxDelay = Math.max(1600, maxDelay * 0.7);
      } else if (botProfile.personality === "SNIPER" && state.room.timeRemaining <= 30) {
        minDelay = 600;
        maxDelay = 1500;
      } else if (botProfile.personality === "CASUAL") {
        minDelay = Math.max(3000, minDelay);
        maxDelay = Math.max(6000, maxDelay);
      } else if (botProfile.personality === "ERRATIC") {
        if (Math.random() < 0.5) {
          minDelay = 900;
          maxDelay = 2000;
        } else {
          minDelay = 4000;
          maxDelay = 8000;
        }
      }
    } else {
      const { botAggressiveness } = state.config;
      let multiplier = 1;
      if (botAggressiveness === "CHAOS") multiplier = 0.35;
      else if (botAggressiveness === "HIGH") multiplier = 0.6;
      else if (botAggressiveness === "MEDIUM") multiplier = 1.0;
      else if (botAggressiveness === "LOW") multiplier = 1.8;
      minDelay *= multiplier;
      maxDelay *= multiplier;
    }

    const delay = Math.floor(
      minDelay + Math.random() * Math.max(400, maxDelay - minDelay)
    );

    state.nextBotBidAt = Date.now() + delay;
  }

  public async forceBotBid(roomId: string) {
    return this.executeBotBid(roomId);
  }

  private async executeBotBid(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state || state.room.status !== "ACTIVE" || !state.config.botEnabled) return;

    // Filter active bots from database
    const activeBots = this.botProfiles.filter((b) => b.isActive === 1);
    const availableBots = activeBots.filter((b) => b.name !== state.room.highestBidderName);

    let selectedBot: BotProfile | null = null;

    if (availableBots.length > 0) {
      // Evaluate personality constraints:
      // 1. Conservative bot respects maxBudget
      // 2. Sniper bot prefers waiting for last seconds (< 45s)
      const eligibleBots = availableBots.filter((b) => {
        if (b.personality === "CONSERVATIVE" && b.maxBudget > 0 && state.room.currentPrice >= b.maxBudget) {
          return false;
        }
        if (b.personality === "SNIPER" && state.room.timeRemaining > 45) {
          return Math.random() < 0.2; // 20% chance to bid early
        }
        return true;
      });

      const pool = eligibleBots.length > 0 ? eligibleBots : availableBots;
      selectedBot = pool[Math.floor(Math.random() * pool.length)];
    }

    const botName = selectedBot
      ? selectedBot.name
      : (BOT_NAMES.filter((name) => name !== state.room.highestBidderName)[0] || "Bot_AutoBidder");

    const nextAmount = state.room.currentPrice + state.room.bidIncrement;

    await this.placeBid({
      roomId,
      bidderName: botName,
      bidderType: "BOT",
      amount: nextAmount,
    });

    this.scheduleNextBotBid(roomId, selectedBot || undefined);
  }

  public async placeBid({
    roomId,
    bidderName,
    bidderType,
    amount,
    clientPrice,
  }: {
    roomId: string;
    bidderName: string;
    bidderType: "USER" | "BOT";
    amount: number;
    clientPrice?: number;
  }): Promise<{ success: boolean; message?: string; code?: string; bid?: Bid }> {
    const state = this.rooms.get(roomId);
    if (!state) {
      return { success: false, message: "Terjadi Kesalahan", code: "NOT_FOUND" };
    }

    if (state.room.status !== "ACTIVE") {
      return { success: false, message: "Terjadi Kesalahan", code: "INVALID_STATUS" };
    }

    // 1. Jika penawaran diajukan berdasarkan harga layar yang sudah basi (stale)
    // karena penawar lain sudah menawar di background pada server,
    // atau jika harga tawaran <= harga lelang server saat ini:
    if (
      bidderType === "USER" &&
      ((clientPrice !== undefined && clientPrice < state.room.currentPrice) ||
        amount <= state.room.currentPrice)
    ) {
      return {
        success: false,
        message: "Harga tidak boleh sama atau kurang dari tawaran sebelumnya",
        code: "PRICE_TOO_LOW",
      };
    }

    // 2. Posisi pengguna sudah diatas: tidak boleh menawar kembali, harus menunggu yang lain untuk menawar
    if (
      bidderType === "USER" &&
      (state.room.highestBidderType === "USER" ||
        state.room.highestBidderName === "Kamu" ||
        (state.recentBids.length > 0 &&
          (state.recentBids[0].bidderType === "USER" || state.recentBids[0].bidderName === "Kamu")))
    ) {
      return {
        success: false,
        message: "Harap menunggu user lain untuk menawar",
        code: "ALREADY_HIGHEST",
      };
    }

    // 3. Validasi umum jika tawaran <= harga saat ini
    if (amount <= state.room.currentPrice) {
      return {
        success: false,
        message: "Harga tidak boleh sama atau kurang dari tawaran sebelumnya",
        code: "PRICE_TOO_LOW",
      };
    }

    const previousAmount = state.room.currentPrice;
    const bidId = `bid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const newBid: Bid = {
      id: bidId,
      roomId,
      bidderName,
      bidderType,
      amount,
      previousAmount,
      status: "WINNING",
      createdAt: now,
    };

    // Update old winning bids in memory to OUTBID
    for (const b of state.recentBids) {
      if (b.status === "WINNING") {
        b.status = "OUTBID";
      }
    }

    state.recentBids.unshift(newBid);
    if (state.recentBids.length > 30) {
      state.recentBids.pop();
    }

    state.room.currentPrice = amount;
    state.room.highestBidderName = bidderName;
    state.room.highestBidderType = bidderType;
    state.room.totalBids += 1;
    state.room.updatedAt = now;

    // Check Anti-Sniping rule: If bid entered during last 10 seconds
    let antiSnipingTriggered = false;
    if (state.config.antiSnipingEnabled && state.room.timeRemaining <= 10) {
      state.room.timeRemaining += state.room.antiSnipingSeconds;
      antiSnipingTriggered = true;
    }

    // Persist to database asynchronously
    this.persistBid(newBid).catch(console.error);
    this.persistRoom(roomId).catch(console.error);

    // Emit real-time events
    this.emit("bid_placed", {
      bid: newBid,
      room: state.room,
      antiSnipingTriggered,
      extendedSeconds: antiSnipingTriggered ? state.room.antiSnipingSeconds : 0,
    });

    this.emit("room_updated", state.room);

    // Jika pengguna menawar dan berada di atas, jadwalkan penawar lain (simulasi) setelah beberapa detik
    if (bidderType === "USER") {
      this.scheduleCompetitorResponse(roomId, 4000, 7000);
    } else if (state.config.botEnabled) {
      this.scheduleNextBotBid(roomId);
    }

    return { success: true, bid: newBid };
  }

  public scheduleCompetitorResponse(roomId: string, minDelay = 4000, maxDelay = 7000) {
    const state = this.rooms.get(roomId);
    if (!state || state.room.status !== "ACTIVE" || !state.config.botEnabled) return;

    const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
    setTimeout(() => {
      const currentState = this.rooms.get(roomId);
      if (
        currentState &&
        currentState.room.status === "ACTIVE" &&
        currentState.config.botEnabled &&
        (currentState.room.highestBidderType === "USER" || currentState.room.highestBidderName === "Kamu")
      ) {
        this.executeBotBid(roomId).catch(console.error);
      }
    }, delay);
  }

  public updateConfig(roomId: string, newConfig: Partial<SimulationConfig>) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    state.config = { ...state.config, ...newConfig };
    db.update(simulationConfigs)
      .set(newConfig)
      .where(eq(simulationConfigs.roomId, roomId))
      .execute()
      .catch(console.error);

    this.emit("config_updated", { roomId, config: state.config });
  }

  private async persistRoom(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state) return;

    try {
      await db
        .update(auctionRooms)
        .set({
          currentPrice: state.room.currentPrice,
          status: state.room.status,
          totalDurationSeconds: state.room.totalDurationSeconds,
          timeRemaining: state.room.timeRemaining,
          highestBidderName: state.room.highestBidderName,
          highestBidderType: state.room.highestBidderType,
          totalBids: state.room.totalBids,
          updatedAt: Date.now(),
        })
        .where(eq(auctionRooms.id, roomId));
    } catch (err) {
      console.warn(`[Engine] Failed to persist room ${roomId}:`, err);
    }
  }

  private async persistBid(bid: Bid) {
    try {
      await db.insert(bids).values(bid);
    } catch (err) {
      console.warn(`[Engine] Failed to persist bid ${bid.id}:`, err);
    }
  }
}

const globalForSimulation = globalThis as unknown as {
  simulationEngine: SimulationEngine | undefined;
};

export const simulationEngine =
  globalForSimulation.simulationEngine ?? new SimulationEngine();

if (process.env.NODE_ENV !== "production") {
  globalForSimulation.simulationEngine = simulationEngine;
}
