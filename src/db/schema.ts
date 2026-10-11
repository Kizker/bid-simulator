import { pgTable, text, integer, bigint } from "drizzle-orm/pg-core";

export const auctionRooms = pgTable("auction_rooms", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("Handphone"),
  subtitle: text("subtitle").notNull().default(""),
  lotBadge: text("lot_badge").notNull().default("(AD) STANDART"),
  condition: text("condition").notNull().default("Fullset"),
  stock: integer("stock").notNull().default(1),
  specs: text("specs").notNull().default(""),
  imageUrl: text("image_url").notNull(),
  startingPrice: bigint("starting_price", { mode: "number" }).notNull(),
  currentPrice: bigint("current_price", { mode: "number" }).notNull(),
  bidIncrement: integer("bid_increment").notNull().default(20000),
  reservePrice: bigint("reserve_price", { mode: "number" }).notNull().default(0),
  status: text("status", { enum: ["DRAFT", "UPCOMING", "ACTIVE", "PAUSED", "ENDED"] })
    .notNull()
    .default("ACTIVE"),
  totalDurationSeconds: integer("total_duration_seconds").notNull().default(45240), // 12h 34m
  timeRemaining: integer("time_remaining").notNull().default(45240),
  antiSnipingSeconds: integer("anti_sniping_seconds").notNull().default(15),
  highestBidderName: text("highest_bidder_name"),
  highestBidderType: text("highest_bidder_type", { enum: ["USER", "BOT"] }),
  totalBids: integer("total_bids").notNull().default(0),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const bids = pgTable("bids", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => auctionRooms.id, { onDelete: "cascade" }),
  bidderName: text("bidder_name").notNull(),
  bidderType: text("bidder_type", { enum: ["USER", "BOT"] }).notNull().default("USER"),
  amount: bigint("amount", { mode: "number" }).notNull(),
  previousAmount: bigint("previous_amount", { mode: "number" }).notNull().default(0),
  status: text("status", { enum: ["WINNING", "OUTBID", "WON"] })
    .notNull()
    .default("WINNING"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const simulationConfigs = pgTable("simulation_configs", {
  roomId: text("room_id")
    .primaryKey()
    .references(() => auctionRooms.id, { onDelete: "cascade" }),
  botEnabled: integer("bot_enabled").notNull().default(1),
  botCount: integer("bot_count").notNull().default(4),
  botAggressiveness: text("bot_aggressiveness", { enum: ["LOW", "MEDIUM", "HIGH", "CHAOS"] })
    .notNull()
    .default("MEDIUM"),
  botMinDelayMs: integer("bot_min_delay_ms").notNull().default(1500),
  botMaxDelayMs: integer("bot_max_delay_ms").notNull().default(4500),
  antiSnipingEnabled: integer("anti_sniping_enabled").notNull().default(1),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  city: text("city").default("Jakarta"),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export const botProfiles = pgTable("bot_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  personality: text("personality", {
    enum: ["AGGRESSIVE", "SNIPER", "CASUAL", "CONSERVATIVE", "ERRATIC"],
  })
    .notNull()
    .default("CASUAL"),
  avatarUrl: text("avatar_url"),
  minDelaySec: integer("min_delay_sec").notNull().default(2),
  maxDelaySec: integer("max_delay_sec").notNull().default(5),
  maxBudget: bigint("max_budget", { mode: "number" }).notNull().default(0), // 0 = unlimited
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = disabled
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
  updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
});

export type AuctionRoom = typeof auctionRooms.$inferSelect;
export type NewAuctionRoom = typeof auctionRooms.$inferInsert;
export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
export type SimulationConfig = typeof simulationConfigs.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;
export type BotProfile = typeof botProfiles.$inferSelect;
export type NewBotProfile = typeof botProfiles.$inferInsert;
