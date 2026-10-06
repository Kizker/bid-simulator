import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const auctionRooms = sqliteTable("auction_rooms", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("General"),
  imageUrl: text("image_url").notNull(),
  startingPrice: integer("starting_price").notNull(),
  currentPrice: integer("current_price").notNull(),
  bidIncrement: integer("bid_increment").notNull().default(100000),
  reservePrice: integer("reserve_price").notNull().default(0),
  status: text("status", { enum: ["DRAFT", "UPCOMING", "ACTIVE", "PAUSED", "ENDED"] })
    .notNull()
    .default("UPCOMING"),
  totalDurationSeconds: integer("total_duration_seconds").notNull().default(120),
  timeRemaining: integer("time_remaining").notNull().default(120),
  antiSnipingSeconds: integer("anti_sniping_seconds").notNull().default(15),
  highestBidderName: text("highest_bidder_name"),
  highestBidderType: text("highest_bidder_type", { enum: ["USER", "BOT"] }),
  totalBids: integer("total_bids").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const bids = sqliteTable("bids", {
  id: text("id").primaryKey(),
  roomId: text("room_id")
    .notNull()
    .references(() => auctionRooms.id, { onDelete: "cascade" }),
  bidderName: text("bidder_name").notNull(),
  bidderType: text("bidder_type", { enum: ["USER", "BOT"] }).notNull().default("USER"),
  amount: integer("amount").notNull(),
  previousAmount: integer("previous_amount").notNull().default(0),
  status: text("status", { enum: ["WINNING", "OUTBID", "WON"] })
    .notNull()
    .default("WINNING"),
  createdAt: integer("created_at").notNull(),
});

export const simulationConfigs = sqliteTable("simulation_configs", {
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

export type AuctionRoom = typeof auctionRooms.$inferSelect;
export type NewAuctionRoom = typeof auctionRooms.$inferInsert;
export type Bid = typeof bids.$inferSelect;
export type NewBid = typeof bids.$inferInsert;
export type SimulationConfig = typeof simulationConfigs.$inferSelect;
