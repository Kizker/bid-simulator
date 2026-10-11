"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_node_http = require("node:http");
var import_next = __toESM(require("next"));
var import_socket = require("socket.io");

// src/db/index.ts
var import_postgres_js = require("drizzle-orm/postgres-js");
var import_postgres = __toESM(require("postgres"));

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  appSettings: () => appSettings,
  auctionRooms: () => auctionRooms,
  bids: () => bids,
  botProfiles: () => botProfiles,
  simulationConfigs: () => simulationConfigs,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var auctionRooms = (0, import_pg_core.pgTable)("auction_rooms", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  title: (0, import_pg_core.text)("title").notNull(),
  description: (0, import_pg_core.text)("description").notNull(),
  category: (0, import_pg_core.text)("category").notNull().default("Handphone"),
  subtitle: (0, import_pg_core.text)("subtitle").notNull().default(""),
  lotBadge: (0, import_pg_core.text)("lot_badge").notNull().default("(AD) STANDART"),
  condition: (0, import_pg_core.text)("condition").notNull().default("Fullset"),
  stock: (0, import_pg_core.integer)("stock").notNull().default(1),
  specs: (0, import_pg_core.text)("specs").notNull().default(""),
  imageUrl: (0, import_pg_core.text)("image_url").notNull(),
  startingPrice: (0, import_pg_core.bigint)("starting_price", { mode: "number" }).notNull(),
  currentPrice: (0, import_pg_core.bigint)("current_price", { mode: "number" }).notNull(),
  bidIncrement: (0, import_pg_core.integer)("bid_increment").notNull().default(2e4),
  reservePrice: (0, import_pg_core.bigint)("reserve_price", { mode: "number" }).notNull().default(0),
  status: (0, import_pg_core.text)("status", { enum: ["DRAFT", "UPCOMING", "ACTIVE", "PAUSED", "ENDED"] }).notNull().default("ACTIVE"),
  totalDurationSeconds: (0, import_pg_core.integer)("total_duration_seconds").notNull().default(45240),
  // 12h 34m
  timeRemaining: (0, import_pg_core.integer)("time_remaining").notNull().default(45240),
  antiSnipingSeconds: (0, import_pg_core.integer)("anti_sniping_seconds").notNull().default(15),
  highestBidderName: (0, import_pg_core.text)("highest_bidder_name"),
  highestBidderType: (0, import_pg_core.text)("highest_bidder_type", { enum: ["USER", "BOT"] }),
  totalBids: (0, import_pg_core.integer)("total_bids").notNull().default(0),
  createdAt: (0, import_pg_core.bigint)("created_at", { mode: "number" }).notNull(),
  updatedAt: (0, import_pg_core.bigint)("updated_at", { mode: "number" }).notNull()
});
var bids = (0, import_pg_core.pgTable)("bids", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  roomId: (0, import_pg_core.text)("room_id").notNull().references(() => auctionRooms.id, { onDelete: "cascade" }),
  bidderName: (0, import_pg_core.text)("bidder_name").notNull(),
  bidderType: (0, import_pg_core.text)("bidder_type", { enum: ["USER", "BOT"] }).notNull().default("USER"),
  amount: (0, import_pg_core.bigint)("amount", { mode: "number" }).notNull(),
  previousAmount: (0, import_pg_core.bigint)("previous_amount", { mode: "number" }).notNull().default(0),
  status: (0, import_pg_core.text)("status", { enum: ["WINNING", "OUTBID", "WON"] }).notNull().default("WINNING"),
  createdAt: (0, import_pg_core.bigint)("created_at", { mode: "number" }).notNull()
});
var simulationConfigs = (0, import_pg_core.pgTable)("simulation_configs", {
  roomId: (0, import_pg_core.text)("room_id").primaryKey().references(() => auctionRooms.id, { onDelete: "cascade" }),
  botEnabled: (0, import_pg_core.integer)("bot_enabled").notNull().default(1),
  botCount: (0, import_pg_core.integer)("bot_count").notNull().default(4),
  botAggressiveness: (0, import_pg_core.text)("bot_aggressiveness", { enum: ["LOW", "MEDIUM", "HIGH", "CHAOS"] }).notNull().default("MEDIUM"),
  botMinDelayMs: (0, import_pg_core.integer)("bot_min_delay_ms").notNull().default(1500),
  botMaxDelayMs: (0, import_pg_core.integer)("bot_max_delay_ms").notNull().default(4500),
  antiSnipingEnabled: (0, import_pg_core.integer)("anti_sniping_enabled").notNull().default(1)
});
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  phone: (0, import_pg_core.text)("phone").notNull().unique(),
  email: (0, import_pg_core.text)("email"),
  city: (0, import_pg_core.text)("city").default("Jakarta"),
  createdAt: (0, import_pg_core.bigint)("created_at", { mode: "number" }).notNull(),
  updatedAt: (0, import_pg_core.bigint)("updated_at", { mode: "number" }).notNull()
});
var appSettings = (0, import_pg_core.pgTable)("app_settings", {
  key: (0, import_pg_core.text)("key").primaryKey(),
  value: (0, import_pg_core.text)("value").notNull(),
  updatedAt: (0, import_pg_core.bigint)("updated_at", { mode: "number" }).notNull()
});
var botProfiles = (0, import_pg_core.pgTable)("bot_profiles", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  personality: (0, import_pg_core.text)("personality", {
    enum: ["AGGRESSIVE", "SNIPER", "CASUAL", "CONSERVATIVE", "ERRATIC"]
  }).notNull().default("CASUAL"),
  avatarUrl: (0, import_pg_core.text)("avatar_url"),
  minDelaySec: (0, import_pg_core.integer)("min_delay_sec").notNull().default(2),
  maxDelaySec: (0, import_pg_core.integer)("max_delay_sec").notNull().default(5),
  maxBudget: (0, import_pg_core.bigint)("max_budget", { mode: "number" }).notNull().default(0),
  // 0 = unlimited
  isActive: (0, import_pg_core.integer)("is_active").notNull().default(1),
  // 1 = active, 0 = disabled
  createdAt: (0, import_pg_core.bigint)("created_at", { mode: "number" }).notNull(),
  updatedAt: (0, import_pg_core.bigint)("updated_at", { mode: "number" }).notNull()
});

// src/db/index.ts
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
  }
}
var connectionString = process.env.DATABASE_URL || "postgres://bid_user:bid_secure_pass123@localhost:5432/bid_simulator";
var client = (0, import_postgres.default)(connectionString, {
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "20", 10),
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: () => {
  }
  // Suppress notice spam
});
var db = (0, import_postgres_js.drizzle)(client, { schema: schema_exports });
var initDatabasePromise = (async () => {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  try {
    await client`
      CREATE TABLE IF NOT EXISTS auction_rooms (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL DEFAULT '',
        lot_badge TEXT NOT NULL DEFAULT '(AD) STANDART',
        condition TEXT NOT NULL DEFAULT 'Fullset',
        stock INTEGER NOT NULL DEFAULT 1,
        specs TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Handphone',
        image_url TEXT NOT NULL,
        starting_price BIGINT NOT NULL,
        current_price BIGINT NOT NULL,
        bid_increment INTEGER NOT NULL DEFAULT 50000,
        reserve_price BIGINT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        total_duration_seconds INTEGER NOT NULL DEFAULT 45240,
        time_remaining INTEGER NOT NULL DEFAULT 45240,
        anti_sniping_seconds INTEGER NOT NULL DEFAULT 15,
        highest_bidder_name TEXT,
        highest_bidder_type TEXT,
        total_bids INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;
    await client`
      CREATE TABLE IF NOT EXISTS bids (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL REFERENCES auction_rooms(id) ON DELETE CASCADE,
        bidder_name TEXT NOT NULL,
        bidder_type TEXT NOT NULL DEFAULT 'USER',
        amount BIGINT NOT NULL,
        previous_amount BIGINT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'WINNING',
        created_at BIGINT NOT NULL
      );
    `;
    await client`
      CREATE TABLE IF NOT EXISTS simulation_configs (
        room_id TEXT PRIMARY KEY REFERENCES auction_rooms(id) ON DELETE CASCADE,
        bot_enabled INTEGER NOT NULL DEFAULT 1,
        bot_count INTEGER NOT NULL DEFAULT 4,
        bot_aggressiveness TEXT NOT NULL DEFAULT 'MEDIUM',
        bot_min_delay_ms INTEGER NOT NULL DEFAULT 2000,
        bot_max_delay_ms INTEGER NOT NULL DEFAULT 5000,
        anti_sniping_enabled INTEGER NOT NULL DEFAULT 1
      );
    `;
    await client`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        city TEXT DEFAULT 'Jakarta',
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;
    const usersRes = await client`
      SELECT id FROM users WHERE phone = '81373827173' LIMIT 1
    `;
    const now = Date.now();
    if (usersRes.length === 0) {
      await client`
        INSERT INTO users (id, name, phone, email, city, created_at, updated_at)
        VALUES ('usr-demo-1', 'Menik Sri Rejeki', '81373827173', 'menikbda@gmail.com', 'Jakarta', ${now}, ${now})
        ON CONFLICT (phone) DO UPDATE
        SET name = EXCLUDED.name, email = EXCLUDED.email;
      `;
    } else {
      await client`
        UPDATE users SET name = 'Menik Sri Rejeki', email = 'menikbda@gmail.com' WHERE phone = '81373827173';
      `;
    }
    await client`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;
    const scheduleRes = await client`
      SELECT key FROM app_settings WHERE key = 'session_start_time' LIMIT 1
    `;
    if (scheduleRes.length === 0) {
      await client`
        INSERT INTO app_settings (key, value, updated_at) VALUES
          ('session_start_time', '00:00:00', ${now}),
          ('session_end_time', '23:59:59', ${now}),
          ('session_auto_sync', '1', ${now})
        ON CONFLICT (key) DO NOTHING;
      `;
    }
    await client`UPDATE app_settings SET value = '00:00:00' WHERE key = 'session_start_time'`;
    await client`UPDATE app_settings SET value = '23:59:59' WHERE key = 'session_end_time'`;
    await client`
      UPDATE auction_rooms
      SET status = 'ACTIVE', time_remaining = 36000, total_duration_seconds = 36000
      WHERE status = 'UPCOMING' OR time_remaining <= 0
    `;
    await client`
      CREATE TABLE IF NOT EXISTS bot_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        personality TEXT NOT NULL DEFAULT 'CASUAL',
        avatar_url TEXT,
        min_delay_sec INTEGER NOT NULL DEFAULT 2,
        max_delay_sec INTEGER NOT NULL DEFAULT 5,
        max_budget BIGINT NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;
    const botsCount = await client`SELECT count(*) as count FROM bot_profiles`;
    const count = Number(botsCount[0]?.count || 0);
    if (count === 0) {
      const defaultBots = [
        { id: "bot-1", name: "+62858...", personality: "AGGRESSIVE", minDelaySec: 1, maxDelaySec: 3, maxBudget: 0, isActive: 1 },
        { id: "bot-2", name: "+62821...", personality: "SNIPER", minDelaySec: 1, maxDelaySec: 3, maxBudget: 0, isActive: 1 },
        { id: "bot-3", name: "+62857...", personality: "CASUAL", minDelaySec: 3, maxDelaySec: 6, maxBudget: 0, isActive: 1 },
        { id: "bot-4", name: "+62813...", personality: "CONSERVATIVE", minDelaySec: 2, maxDelaySec: 5, maxBudget: 25e6, isActive: 1 },
        { id: "bot-5", name: "+62896...", personality: "ERRATIC", minDelaySec: 1, maxDelaySec: 7, maxBudget: 0, isActive: 1 },
        { id: "bot-6", name: "+62878...", personality: "AGGRESSIVE", minDelaySec: 1, maxDelaySec: 3, maxBudget: 0, isActive: 1 },
        { id: "bot-7", name: "+62852...", personality: "SNIPER", minDelaySec: 1, maxDelaySec: 2, maxBudget: 0, isActive: 1 }
      ];
      for (const b of defaultBots) {
        await client`
          INSERT INTO bot_profiles (id, name, personality, min_delay_sec, max_delay_sec, max_budget, is_active, created_at, updated_at)
          VALUES (${b.id}, ${b.name}, ${b.personality}, ${b.minDelaySec}, ${b.maxDelaySec}, ${b.maxBudget}, ${b.isActive}, ${now}, ${now})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
  } catch (err) {
    console.warn("Database initialization warning (will retry on query if starting up):", err);
  }
})();

// src/server/engine.ts
var import_drizzle_orm = require("drizzle-orm");
function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(":").map((v) => parseInt(v, 10) || 0);
  const h = Math.min(23, Math.max(0, parts[0] || 0));
  const m = Math.min(59, Math.max(0, parts[1] || 0));
  const s = Math.min(59, Math.max(0, parts[2] || 0));
  return h * 3600 + m * 60 + s;
}
function normalizeTimeStr(timeStr, fallback = "17:00:00") {
  if (!timeStr) return fallback;
  const parts = timeStr.trim().split(":").map((v) => parseInt(v, 10) || 0);
  const h = String(Math.min(23, Math.max(0, parts[0] || 0))).padStart(2, "0");
  const m = String(Math.min(59, Math.max(0, parts[1] || 0))).padStart(2, "0");
  const s = String(Math.min(59, Math.max(0, parts[2] || 0))).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
var BOT_NAMES = [
  "+62858...",
  "+62821...",
  "+62857...",
  "+62813...",
  "+62896...",
  "+62878...",
  "+62852..."
];
var SimulationEngine = class {
  constructor() {
    this.rooms = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
    this.isInitialized = false;
    this.botProfiles = [];
    // Operational schedule config
    this.sessionStartTime = "17:00:00";
    this.sessionEndTime = "08:00:00";
    this.sessionAutoSync = true;
    this.lastSyncLiveState = null;
  }
  onEvent(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  emit(event, payload) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload);
      } catch (e) {
        console.error("Error in event listener:", e);
      }
    }
  }
  async init() {
    if (this.isInitialized) return;
    if (initDatabasePromise) {
      await initDatabasePromise;
    }
    console.log("\u26A1 Initializing Simulation Engine...");
    const allRooms = await db.select().from(auctionRooms);
    for (const room of allRooms) {
      const [config] = await db.select().from(simulationConfigs).where((0, import_drizzle_orm.eq)(simulationConfigs.roomId, room.id));
      const roomBids = await db.select().from(bids).where((0, import_drizzle_orm.eq)(bids.roomId, room.id)).orderBy((0, import_drizzle_orm.desc)(bids.createdAt)).limit(20);
      const state = {
        room,
        config: config || {
          roomId: room.id,
          botEnabled: 1,
          botCount: 4,
          botAggressiveness: "MEDIUM",
          botMinDelayMs: 1500,
          botMaxDelayMs: 4500,
          antiSnipingEnabled: 1
        },
        recentBids: roomBids
      };
      if (room.status !== "ENDED") {
        state.room.status = "ACTIVE";
        if (!state.room.timeRemaining || state.room.timeRemaining <= 0) {
          state.room.timeRemaining = state.room.totalDurationSeconds || 36e3;
        }
      }
      this.rooms.set(room.id, state);
    }
    this.startMasterTicker();
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
    await this.reloadBots();
    if (!this.scheduleSyncInterval) {
      this.scheduleSyncInterval = setInterval(() => {
        this.checkScheduleAutoSync();
      }, 1e3);
    }
    this.isInitialized = true;
    console.log(`\u2705 Simulation Engine initialized with ${this.rooms.size} rooms.`);
  }
  async reloadBots() {
    try {
      this.botProfiles = await db.select().from(botProfiles);
      console.log(`\u{1F916} Loaded ${this.botProfiles.length} bot profiles.`);
    } catch (err) {
      console.warn("Could not load botProfiles:", err);
    }
  }
  getBots() {
    return this.botProfiles;
  }
  getScheduleInfo() {
    const now = /* @__PURE__ */ new Date();
    const currentSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const currentServerTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const startSec = parseTimeToSeconds(this.sessionStartTime);
    const endSec = parseTimeToSeconds(this.sessionEndTime);
    let totalDurationSeconds = 0;
    if (endSec > startSec) {
      totalDurationSeconds = endSec - startSec;
    } else {
      totalDurationSeconds = 86400 - startSec + endSec;
    }
    let isLive = false;
    let remainingSeconds = 0;
    if (endSec > startSec) {
      isLive = currentSec >= startSec && currentSec < endSec;
      if (isLive) {
        remainingSeconds = endSec - currentSec;
      } else if (currentSec < startSec) {
        remainingSeconds = startSec - currentSec;
      } else {
        remainingSeconds = 86400 - currentSec + startSec;
      }
    } else {
      isLive = currentSec >= startSec || currentSec < endSec;
      if (isLive) {
        if (currentSec >= startSec) {
          remainingSeconds = 86400 - currentSec + endSec;
        } else {
          remainingSeconds = endSec - currentSec;
        }
      } else {
        remainingSeconds = startSec - currentSec;
      }
    }
    const publicStartTime = this.sessionStartTime.slice(0, 5);
    const publicEndTime = this.sessionEndTime.slice(0, 5);
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
      currentServerTime
    };
  }
  async setSessionSchedule(startTime, endTime, autoSync = true, applyNow = true) {
    const normStart = normalizeTimeStr(startTime, "17:00:00");
    const normEnd = normalizeTimeStr(endTime, "08:00:00");
    this.sessionStartTime = normStart;
    this.sessionEndTime = normEnd;
    this.sessionAutoSync = autoSync;
    const now = Date.now();
    const saveSetting = async (key, value) => {
      const existing = await db.select().from(appSettings).where((0, import_drizzle_orm.eq)(appSettings.key, key));
      if (existing.length > 0) {
        await db.update(appSettings).set({ value, updatedAt: now }).where((0, import_drizzle_orm.eq)(appSettings.key, key));
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
  applyScheduleToAllRooms(forceStartIfLive = true) {
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
  endAllRooms() {
    for (const [roomId, state] of this.rooms) {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = void 0;
      }
      state.room.status = "ENDED";
      state.room.timeRemaining = 0;
      this.persistRoom(roomId).catch(console.error);
      this.emit("room_updated", state.room);
    }
    this.emit("all_rooms_ended", {});
  }
  checkScheduleAutoSync() {
    if (!this.sessionAutoSync || this.rooms.size === 0) return;
    const schedule = this.getScheduleInfo();
    if (this.lastSyncLiveState === null) {
      this.lastSyncLiveState = schedule.isLive;
    } else if (this.lastSyncLiveState !== schedule.isLive) {
      this.lastSyncLiveState = schedule.isLive;
      if (schedule.isLive) {
        console.log(`\u23F0 [AutoSync] Sesi lelang dimulai pada ${schedule.currentServerTime}. Memulai room lelang...`);
        this.applyScheduleToAllRooms(true);
        this.emit("session_started", schedule);
      } else {
        console.log(`\u23F0 [AutoSync] Sesi lelang berakhir pada ${schedule.currentServerTime}. Mengatur room lelang ke sesi berikutnya (UPCOMING)...`);
        this.applyScheduleToAllRooms(false);
        this.emit("session_ended", schedule);
      }
    }
  }
  getRoomState(roomId) {
    return this.rooms.get(roomId);
  }
  getAllRooms() {
    return Array.from(this.rooms.values()).map((s) => s.room);
  }
  startTimer(roomId) {
    const state = this.rooms.get(roomId);
    if (!state) return;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = void 0;
    }
    state.room.status = "ACTIVE";
    if (state.config.botEnabled && !state.nextBotBidAt) {
      this.scheduleNextBotBid(roomId);
    }
    this.startMasterTicker();
    this.persistRoom(roomId).catch(console.error);
    this.emit("room_updated", state.room);
  }
  pauseTimer(roomId) {
    const state = this.rooms.get(roomId);
    if (!state) return;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = void 0;
    }
    state.room.status = "PAUSED";
    state.nextBotBidAt = void 0;
    this.persistRoom(roomId).catch(console.error);
    this.emit("room_updated", state.room);
  }
  resetRoom(roomId) {
    const state = this.rooms.get(roomId);
    if (!state) return;
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = void 0;
    }
    state.room.status = "ACTIVE";
    state.room.timeRemaining = state.room.totalDurationSeconds || 36e3;
    state.room.currentPrice = state.room.startingPrice;
    state.room.highestBidderName = null;
    state.room.highestBidderType = null;
    state.room.totalBids = 0;
    state.recentBids = [];
    state.nextBotBidAt = void 0;
    db.delete(bids).where((0, import_drizzle_orm.eq)(bids.roomId, roomId)).execute().catch(console.error);
    this.startMasterTicker();
    this.persistRoom(roomId).catch(console.error);
    this.emit("room_updated", state.room);
    this.emit("bids_cleared", { roomId });
  }
  async reloadFromDatabase(roomId) {
    if (roomId) {
      const [room] = await db.select().from(auctionRooms).where((0, import_drizzle_orm.eq)(auctionRooms.id, roomId));
      if (!room) return;
      const [config] = await db.select().from(simulationConfigs).where((0, import_drizzle_orm.eq)(simulationConfigs.roomId, roomId));
      const roomBids = await db.select().from(bids).where((0, import_drizzle_orm.eq)(bids.roomId, roomId)).orderBy((0, import_drizzle_orm.desc)(bids.createdAt)).limit(20);
      const existing = this.rooms.get(roomId);
      if (existing?.timerInterval) {
        clearInterval(existing.timerInterval);
      }
      const state = {
        room,
        config: config || {
          roomId: room.id,
          botEnabled: 0,
          botCount: 4,
          botAggressiveness: "MEDIUM",
          botMinDelayMs: 2e3,
          botMaxDelayMs: 5e3,
          antiSnipingEnabled: 1
        },
        recentBids: roomBids
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
  removeRoom(roomId) {
    const existing = this.rooms.get(roomId);
    if (existing?.timerInterval) {
      clearInterval(existing.timerInterval);
    }
    this.rooms.delete(roomId);
    this.emit("room_deleted", { roomId });
  }
  clearAllRooms() {
    for (const [, state] of this.rooms) {
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
      }
    }
    this.rooms.clear();
    this.isInitialized = true;
    this.emit("all_rooms_cleared", {});
  }
  startAllBots() {
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
  pauseAllBots() {
    for (const [, state] of this.rooms) {
      state.config.botEnabled = 0;
      state.nextBotBidAt = void 0;
    }
    db.update(simulationConfigs).set({ botEnabled: 0 }).execute().catch(console.error);
    this.emit("all_bots_paused", { botEnabled: 0 });
    this.emit("all_configs_updated", { botEnabled: 0 });
  }
  startAllRooms() {
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
  pauseAllRooms() {
    for (const [roomId, state] of this.rooms) {
      state.config.botEnabled = 0;
      state.nextBotBidAt = void 0;
      if (state.room.status === "ACTIVE") {
        this.pauseTimer(roomId);
      }
    }
    db.update(simulationConfigs).set({ botEnabled: 0 }).execute().catch(console.error);
    this.emit("all_rooms_paused", {});
    this.emit("all_configs_updated", { botEnabled: 0 });
  }
  resetAllRooms() {
    for (const [roomId, state] of this.rooms) {
      state.config.botEnabled = 0;
      state.nextBotBidAt = void 0;
      this.resetRoom(roomId);
    }
    db.update(simulationConfigs).set({ botEnabled: 0 }).execute().catch(console.error);
    this.emit("all_rooms_reset", {});
    this.emit("all_configs_updated", { botEnabled: 0 });
  }
  addTimeToAllRooms(extraSeconds) {
    for (const [roomId, state] of this.rooms) {
      if (state.room.status === "ACTIVE" || state.room.status === "PAUSED") {
        this.addTime(roomId, extraSeconds);
      }
    }
    this.emit("all_time_extended", { added: extraSeconds });
  }
  updateAllConfigs(newConfig) {
    for (const [roomId, state] of this.rooms) {
      state.config = { ...state.config, ...newConfig };
      this.emit("config_updated", { roomId, config: state.config });
    }
    db.update(simulationConfigs).set(newConfig).execute().catch(console.error);
    this.emit("all_configs_updated", newConfig);
  }
  async triggerRandomBotBid() {
    const activeRooms = Array.from(this.rooms.values()).filter(
      (s) => s.room.status === "ACTIVE" && Boolean(s.config.botEnabled) && s.room.timeRemaining > 2
    );
    if (activeRooms.length === 0) return;
    const randomChoice = activeRooms[Math.floor(Math.random() * activeRooms.length)];
    await this.executeBotBid(randomChoice.room.id);
  }
  addTime(roomId, extraSeconds) {
    const state = this.rooms.get(roomId);
    if (!state) return;
    state.room.timeRemaining += extraSeconds;
    this.persistRoom(roomId);
    this.emit("time_extended", { roomId, timeRemaining: state.room.timeRemaining, added: extraSeconds });
    this.emit("room_updated", state.room);
  }
  startMasterTicker() {
    if (this.masterTicker) return;
    this.masterTicker = setInterval(() => {
      this.masterTick();
    }, 1e3);
  }
  masterTick() {
    const now = Date.now();
    for (const [roomId, state] of this.rooms) {
      if (state.room.status !== "ACTIVE") continue;
      if (state.room.timeRemaining > 0) {
        state.room.timeRemaining -= 1;
        this.emit("timer_tick", {
          roomId,
          timeRemaining: state.room.timeRemaining
        });
        if (state.config.botEnabled && state.nextBotBidAt && now >= state.nextBotBidAt && state.room.timeRemaining > 1) {
          this.executeBotBid(roomId).catch(console.error);
        }
      } else {
        state.room.status = "ENDED";
        state.nextBotBidAt = void 0;
        this.persistRoom(roomId).catch(console.error);
        this.emit("auction_ended", {
          roomId,
          winnerName: state.room.highestBidderName,
          winnerType: state.room.highestBidderType,
          finalPrice: state.room.currentPrice
        });
        this.emit("room_updated", state.room);
      }
    }
  }
  scheduleNextBotBid(roomId, botProfile) {
    const state = this.rooms.get(roomId);
    if (!state || !state.config.botEnabled || state.room.status !== "ACTIVE") return;
    let minDelay = botProfile ? botProfile.minDelaySec * 1e3 : state.config.botMinDelayMs;
    let maxDelay = botProfile ? botProfile.maxDelaySec * 1e3 : state.config.botMaxDelayMs;
    if (botProfile) {
      if (botProfile.personality === "AGGRESSIVE") {
        minDelay = Math.max(800, minDelay * 0.7);
        maxDelay = Math.max(1600, maxDelay * 0.7);
      } else if (botProfile.personality === "SNIPER" && state.room.timeRemaining <= 30) {
        minDelay = 600;
        maxDelay = 1500;
      } else if (botProfile.personality === "CASUAL") {
        minDelay = Math.max(3e3, minDelay);
        maxDelay = Math.max(6e3, maxDelay);
      } else if (botProfile.personality === "ERRATIC") {
        if (Math.random() < 0.5) {
          minDelay = 900;
          maxDelay = 2e3;
        } else {
          minDelay = 4e3;
          maxDelay = 8e3;
        }
      }
    } else {
      const { botAggressiveness } = state.config;
      let multiplier = 1;
      if (botAggressiveness === "CHAOS") multiplier = 0.35;
      else if (botAggressiveness === "HIGH") multiplier = 0.6;
      else if (botAggressiveness === "MEDIUM") multiplier = 1;
      else if (botAggressiveness === "LOW") multiplier = 1.8;
      minDelay *= multiplier;
      maxDelay *= multiplier;
    }
    const delay = Math.floor(
      minDelay + Math.random() * Math.max(400, maxDelay - minDelay)
    );
    state.nextBotBidAt = Date.now() + delay;
  }
  async forceBotBid(roomId) {
    return this.executeBotBid(roomId);
  }
  async executeBotBid(roomId) {
    const state = this.rooms.get(roomId);
    if (!state || state.room.status !== "ACTIVE" || !state.config.botEnabled) return;
    const activeBots = this.botProfiles.filter((b) => b.isActive === 1);
    const availableBots = activeBots.filter((b) => b.name !== state.room.highestBidderName);
    let selectedBot = null;
    if (availableBots.length > 0) {
      const eligibleBots = availableBots.filter((b) => {
        if (b.personality === "CONSERVATIVE" && b.maxBudget > 0 && state.room.currentPrice >= b.maxBudget) {
          return false;
        }
        if (b.personality === "SNIPER" && state.room.timeRemaining > 45) {
          return Math.random() < 0.2;
        }
        return true;
      });
      const pool = eligibleBots.length > 0 ? eligibleBots : availableBots;
      selectedBot = pool[Math.floor(Math.random() * pool.length)];
    }
    const botName = selectedBot ? selectedBot.name : BOT_NAMES.filter((name) => name !== state.room.highestBidderName)[0] || "Bot_AutoBidder";
    const nextAmount = state.room.currentPrice + state.room.bidIncrement;
    await this.placeBid({
      roomId,
      bidderName: botName,
      bidderType: "BOT",
      amount: nextAmount
    });
    this.scheduleNextBotBid(roomId, selectedBot || void 0);
  }
  async placeBid({
    roomId,
    bidderName,
    bidderType,
    amount,
    clientPrice
  }) {
    const state = this.rooms.get(roomId);
    if (!state) {
      return { success: false, message: "Terjadi Kesalahan", code: "NOT_FOUND" };
    }
    if (state.room.status !== "ACTIVE" || state.room.timeRemaining <= 0) {
      state.room.status = "ACTIVE";
      if (!state.room.timeRemaining || state.room.timeRemaining <= 0) {
        state.room.timeRemaining = state.room.totalDurationSeconds || 36e3;
      }
      state.config.botEnabled = 1;
      this.startTimer(roomId);
    }
    if (amount <= state.room.currentPrice) {
      return {
        success: false,
        message: "Harga tidak boleh sama atau kurang dari tawaran sebelumnya",
        code: "PRICE_TOO_LOW"
      };
    }
    if (bidderType === "USER" && (state.room.highestBidderType === "USER" || state.room.highestBidderName === "Kamu" || state.recentBids.length > 0 && (state.recentBids[0].bidderType === "USER" || state.recentBids[0].bidderName === "Kamu"))) {
      this.scheduleCompetitorResponse(roomId, 1500, 3e3);
      return {
        success: false,
        message: "Harap menunggu user lain untuk menawar",
        code: "ALREADY_HIGHEST"
      };
    }
    const previousAmount = state.room.currentPrice;
    const bidId = `bid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();
    const newBid = {
      id: bidId,
      roomId,
      bidderName,
      bidderType,
      amount,
      previousAmount,
      status: "WINNING",
      createdAt: now
    };
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
    let antiSnipingTriggered = false;
    if (state.config.antiSnipingEnabled && state.room.timeRemaining <= 10) {
      state.room.timeRemaining += state.room.antiSnipingSeconds;
      antiSnipingTriggered = true;
    }
    this.persistBid(newBid).catch(console.error);
    this.persistRoom(roomId).catch(console.error);
    this.emit("bid_placed", {
      bid: newBid,
      room: state.room,
      antiSnipingTriggered,
      extendedSeconds: antiSnipingTriggered ? state.room.antiSnipingSeconds : 0
    });
    this.emit("room_updated", state.room);
    if (bidderType === "USER") {
      this.scheduleCompetitorResponse(roomId, 2500, 4500);
    } else if (state.config.botEnabled) {
      this.scheduleNextBotBid(roomId);
    }
    return { success: true, bid: newBid };
  }
  scheduleCompetitorResponse(roomId, minDelay = 2500, maxDelay = 4500) {
    const state = this.rooms.get(roomId);
    if (!state || state.room.status !== "ACTIVE") return;
    state.config.botEnabled = 1;
    const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
    setTimeout(() => {
      const currentState = this.rooms.get(roomId);
      if (currentState && currentState.room.status === "ACTIVE" && (currentState.room.highestBidderType === "USER" || currentState.room.highestBidderName === "Kamu")) {
        this.executeBotBid(roomId).catch(console.error);
      }
    }, delay);
  }
  updateConfig(roomId, newConfig) {
    const state = this.rooms.get(roomId);
    if (!state) return;
    state.config = { ...state.config, ...newConfig };
    db.update(simulationConfigs).set(newConfig).where((0, import_drizzle_orm.eq)(simulationConfigs.roomId, roomId)).execute().catch(console.error);
    this.emit("config_updated", { roomId, config: state.config });
  }
  async persistRoom(roomId) {
    const state = this.rooms.get(roomId);
    if (!state) return;
    try {
      await db.update(auctionRooms).set({
        currentPrice: state.room.currentPrice,
        status: state.room.status,
        totalDurationSeconds: state.room.totalDurationSeconds,
        timeRemaining: state.room.timeRemaining,
        highestBidderName: state.room.highestBidderName,
        highestBidderType: state.room.highestBidderType,
        totalBids: state.room.totalBids,
        updatedAt: Date.now()
      }).where((0, import_drizzle_orm.eq)(auctionRooms.id, roomId));
    } catch (err) {
      console.warn(`[Engine] Failed to persist room ${roomId}:`, err);
    }
  }
  async persistBid(bid) {
    try {
      await db.insert(bids).values(bid);
    } catch (err) {
      console.warn(`[Engine] Failed to persist bid ${bid.id}:`, err);
    }
  }
};
var globalForSimulation = globalThis;
var simulationEngine = globalForSimulation.simulationEngine ?? new SimulationEngine();
if (process.env.NODE_ENV !== "production") {
  globalForSimulation.simulationEngine = simulationEngine;
}

// src/server/socket.ts
function initSocketServer(io, engine) {
  engine.onEvent((event, payload) => {
    switch (event) {
      case "timer_tick": {
        io.to(`room:${payload.roomId}`).emit("timer_tick", payload);
        break;
      }
      case "bid_placed": {
        io.to(`room:${payload.room.id}`).emit("bid_placed", payload);
        io.emit("admin_bid_placed", payload);
        break;
      }
      case "room_updated": {
        io.to(`room:${payload.id}`).emit("room_updated", payload);
        io.emit("admin_room_updated", payload);
        break;
      }
      case "time_extended": {
        io.to(`room:${payload.roomId}`).emit("time_extended", payload);
        break;
      }
      case "auction_ended": {
        io.to(`room:${payload.roomId}`).emit("auction_ended", payload);
        io.emit("admin_auction_ended", payload);
        break;
      }
      case "bids_cleared": {
        io.to(`room:${payload.roomId}`).emit("bids_cleared", payload);
        io.emit("admin_bids_cleared", payload);
        break;
      }
      case "config_updated": {
        io.to(`room:${payload.roomId}`).emit("config_updated", payload);
        io.emit("admin_config_updated", payload);
        break;
      }
      case "schedule_updated": {
        io.emit("schedule_updated", payload);
        break;
      }
      case "schedule_applied": {
        io.emit("schedule_applied", payload);
        break;
      }
      case "session_started": {
        io.emit("session_started", payload);
        break;
      }
      case "session_ended": {
        io.emit("session_ended", payload);
        break;
      }
      case "all_rooms_paused": {
        io.emit("all_rooms_paused", payload);
        break;
      }
      case "all_rooms_started": {
        io.emit("all_rooms_started", payload);
        break;
      }
      case "all_configs_updated": {
        io.emit("all_configs_updated", payload);
        break;
      }
      case "all_bots_paused": {
        io.emit("all_bots_paused", payload);
        break;
      }
      case "all_bots_started": {
        io.emit("all_bots_started", payload);
        break;
      }
    }
  });
  io.on("connection", (socket) => {
    socket.on("join_room", (roomId) => {
      socket.join(`room:${roomId}`);
      const state = engine.getRoomState(roomId);
      if (state) {
        if (state.room.status !== "ACTIVE" || state.room.timeRemaining <= 0) {
          state.room.status = "ACTIVE";
          if (!state.room.timeRemaining || state.room.timeRemaining <= 0) {
            state.room.timeRemaining = state.room.totalDurationSeconds || 36e3;
          }
          state.config.botEnabled = 1;
          engine.startTimer(roomId);
        }
        socket.emit("initial_state", {
          room: state.room,
          config: state.config,
          recentBids: state.recentBids
        });
        if (state.room.highestBidderType === "USER" || state.room.highestBidderName === "Kamu") {
          engine.scheduleCompetitorResponse(roomId, 3e3, 5e3);
        }
      }
    });
    socket.on("request_competitor_bid", (data) => {
      engine.scheduleCompetitorResponse(data.roomId, 3e3, 5e3);
    });
    socket.on("get_schedule", () => {
      socket.emit("schedule_updated", engine.getScheduleInfo());
    });
    socket.on("get_server_time", (clientSentTime) => {
      socket.emit("server_time", {
        clientSentTime,
        serverTime: Date.now()
      });
    });
    socket.on("leave_room", (roomId) => {
      socket.leave(`room:${roomId}`);
    });
    socket.on("place_bid", async (data) => {
      const result = await engine.placeBid({
        roomId: data.roomId,
        bidderName: data.bidderName || "Kamu",
        bidderType: "USER",
        amount: data.amount,
        clientPrice: data.clientPrice
      });
      if (!result.success) {
        if (result.code === "ALREADY_HIGHEST") {
          engine.scheduleCompetitorResponse(data.roomId, 3e3, 5e3);
        }
        const state = engine.getRoomState(data.roomId);
        socket.emit("bid_error", {
          message: result.message,
          code: result.code,
          latestRoom: state?.room,
          latestBids: state?.recentBids
        });
      } else {
        socket.emit("bid_success", { bid: result.bid, roomId: data.roomId });
      }
    });
    socket.on("admin_command", async (data) => {
      const { action, roomId, payload } = data;
      if (!roomId || roomId === "ALL") {
        console.log(`\u{1F4E1} [AdminCommand] Received global action: ${action}`);
        switch (action) {
          case "START_BOTS":
          case "START":
          case "START_ALL":
            engine.startAllBots();
            break;
          case "PAUSE_BOTS":
          case "PAUSE":
          case "PAUSE_ALL":
            engine.pauseAllBots();
            break;
          case "START_ROOMS":
            engine.startAllRooms();
            break;
          case "PAUSE_ROOMS":
            engine.pauseAllRooms();
            break;
          case "RESET":
          case "RESET_ALL":
            engine.resetAllRooms();
            break;
          case "END_ALL":
            engine.endAllRooms();
            break;
          case "UPDATE_SCHEDULE":
            if (payload) {
              await engine.setSessionSchedule(
                payload.startTime,
                payload.endTime,
                payload.autoSync !== void 0 ? payload.autoSync : true,
                payload.applyNow !== void 0 ? payload.applyNow : true
              );
            }
            break;
          case "APPLY_SCHEDULE":
            engine.applyScheduleToAllRooms(true);
            break;
          case "ADD_TIME":
          case "ADD_TIME_ALL":
            engine.addTimeToAllRooms(payload?.seconds || 30);
            break;
          case "UPDATE_CONFIG":
          case "UPDATE_ALL_CONFIG":
            engine.updateAllConfigs(payload || {});
            break;
          case "TRIGGER_RANDOM_BOT":
          case "FORCE_BOT_BID":
            await engine.triggerRandomBotBid();
            break;
          case "RELOAD_DB":
            await engine.reloadFromDatabase();
            break;
        }
        return;
      }
      switch (action) {
        case "START":
          engine.startTimer(roomId);
          break;
        case "PAUSE":
          engine.pauseTimer(roomId);
          break;
        case "RESET":
          engine.resetRoom(roomId);
          break;
        case "ADD_TIME":
          engine.addTime(roomId, payload?.seconds || 30);
          break;
        case "FORCE_BOT_BID":
          await engine.forceBotBid(roomId);
          break;
        case "UPDATE_CONFIG":
          engine.updateConfig(roomId, payload);
          break;
        case "RELOAD_DB":
          await engine.reloadFromDatabase(roomId);
          break;
      }
    });
    socket.on("get_admin_overview", () => {
      const rooms = engine.getAllRooms();
      socket.emit("admin_overview", { rooms });
    });
  });
  console.log("\u26A1 Socket.io handlers configured.");
}

// server.ts
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
  }
}
var dev = process.env.NODE_ENV === "development";
var hostname = "0.0.0.0";
var port = parseInt(process.env.PORT || "3030", 10);
async function main() {
  await simulationEngine.init();
  const path = require("node:path");
  const fs = require("node:fs");
  let projectDir = process.cwd();
  if (!fs.existsSync(path.join(projectDir, ".next/required-server-files.json"))) {
    projectDir = path.resolve(__dirname, "..");
  }
  let handle;
  if (dev) {
    const app = (0, import_next.default)({
      dev: true,
      hostname,
      port,
      dir: projectDir
    });
    await app.prepare();
    handle = app.getRequestHandler();
  } else {
    const NextNodeServer = require("next/dist/server/next-server").default;
    console.log(`\u{1F4C2} Using project directory: ${projectDir}`);
    const serverFiles = require(path.join(projectDir, ".next/required-server-files.json"));
    const conf = serverFiles.config;
    const nextServer = new NextNodeServer({
      dir: projectDir,
      conf,
      dev: false,
      minimalMode: false,
      hostname,
      port
    });
    await nextServer.prepare();
    handle = nextServer.getRequestHandler();
  }
  const mimeTypes = {
    ".js": "application/javascript",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".json": "application/json"
  };
  const serveStaticFile = (res, filePath) => {
    try {
      const pathModule2 = require("node:path");
      const fsModule2 = require("node:fs");
      const ext = pathModule2.extname(filePath);
      const contentType = mimeTypes[ext] || "application/octet-stream";
      const stat = fsModule2.statSync(filePath);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Length": stat.size,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet"
      });
      fsModule2.createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404);
      res.end();
    }
  };
  const pathModule = require("node:path");
  const fsModule = require("node:fs");
  const httpServer = (0, import_node_http.createServer)((req, res) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    const rawUrl = req.url || "/";
    const cleanUrl = rawUrl.split("?")[0];
    if (cleanUrl.startsWith("/_next/static/")) {
      const relPath = cleanUrl.replace(/^\/_next\/static\//, "");
      const filePath = pathModule.join(process.cwd(), ".next/static", relPath);
      if (fsModule.existsSync(filePath) && fsModule.statSync(filePath).isFile()) {
        return serveStaticFile(res, filePath);
      }
    }
    const publicPath = pathModule.join(process.cwd(), "public", cleanUrl.replace(/^\//, ""));
    if (cleanUrl !== "/" && fsModule.existsSync(publicPath) && fsModule.statSync(publicPath).isFile()) {
      return serveStaticFile(res, publicPath);
    }
    handle(req, res);
  });
  const io = new import_socket.Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/api/socketio"
  });
  if (process.env.REDIS_URL) {
    try {
      const { createAdapter } = require("@socket.io/redis-adapter");
      const Redis = require("ioredis");
      const pubClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
      const subClient = pubClient.duplicate();
      io.adapter(createAdapter(pubClient, subClient));
      console.log("\u26A1 Socket.IO initialized with Redis Pub/Sub adapter for high-concurrency clustering.");
    } catch (redisErr) {
      console.warn("\u26A0\uFE0F Failed to initialize Redis Adapter for Socket.IO (falling back to memory):", redisErr);
    }
  }
  initSocketServer(io, simulationEngine);
  httpServer.listen(port, hostname, () => {
    console.log(`
======================================================`);
    console.log(`\u26A1 BID SIMULATOR & CMS CONTROLLER READY`);
    console.log(`\u{1F310} Tampilan Publik  : http://localhost:${port}/`);
    console.log(`\u{1F5A5}\uFE0F CMS Controller   : http://localhost:${port}/admin`);
    console.log(`======================================================
`);
  });
}
main().catch((err) => {
  console.error("\u274C Fatal error starting server:", err);
  process.exit(1);
});
