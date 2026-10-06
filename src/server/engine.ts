import { db } from "../db";
import { auctionRooms, bids, simulationConfigs, type AuctionRoom, type Bid, type SimulationConfig } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export interface RoomRuntimeState {
  room: AuctionRoom;
  config: SimulationConfig;
  recentBids: Bid[];
  timerInterval?: NodeJS.Timeout;
  nextBotBidAt?: number;
}

export type EventListener = (event: string, payload: any) => void;

// List of realistic bot phone numbers matching Bidding Plus
const BOT_NAMES = [
  "+62896...",
  "+62812...",
  "+62857...",
  "+62878...",
  "+62813...",
  "+62821...",
  "+62852...",
];

export class SimulationEngine {
  private rooms: Map<string, RoomRuntimeState> = new Map();
  private listeners: Set<EventListener> = new Set();
  private isInitialized = false;

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

    this.isInitialized = true;
    console.log(`✅ Simulation Engine initialized with ${this.rooms.size} rooms.`);
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
    this.scheduleNextBotBid(roomId);

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

  private scheduleNextBotBid(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state || !state.config.botEnabled || state.room.status !== "ACTIVE") return;

    const { botAggressiveness, botMinDelayMs, botMaxDelayMs } = state.config;

    let multiplier = 1;
    if (botAggressiveness === "CHAOS") multiplier = 0.35;
    else if (botAggressiveness === "HIGH") multiplier = 0.6;
    else if (botAggressiveness === "MEDIUM") multiplier = 1.0;
    else if (botAggressiveness === "LOW") multiplier = 1.8;

    const delay = Math.floor(
      (botMinDelayMs + Math.random() * (botMaxDelayMs - botMinDelayMs)) * multiplier
    );

    state.nextBotBidAt = Date.now() + delay;
  }

  public async forceBotBid(roomId: string) {
    return this.executeBotBid(roomId);
  }

  private async executeBotBid(roomId: string) {
    const state = this.rooms.get(roomId);
    if (!state || state.room.status !== "ACTIVE") return;

    // Pick a random bot name that isn't the current highest bidder
    const availableBots = BOT_NAMES.filter((name) => name !== state.room.highestBidderName);
    const botName = availableBots[Math.floor(Math.random() * availableBots.length)] || "Bot_AutoBidder";

    const nextAmount = state.room.currentPrice + state.room.bidIncrement;

    await this.placeBid({
      roomId,
      bidderName: botName,
      bidderType: "BOT",
      amount: nextAmount,
    });

    this.scheduleNextBotBid(roomId);
  }

  public async placeBid({
    roomId,
    bidderName,
    bidderType,
    amount,
  }: {
    roomId: string;
    bidderName: string;
    bidderType: "USER" | "BOT";
    amount: number;
  }): Promise<{ success: boolean; message?: string; bid?: Bid }> {
    const state = this.rooms.get(roomId);
    if (!state) {
      return { success: false, message: "Room tidak ditemukan." };
    }

    if (state.room.status !== "ACTIVE") {
      return { success: false, message: "Lelang belum aktif atau telah selesai." };
    }

    if (amount <= state.room.currentPrice) {
      return {
        success: false,
        message: `Tawaran harus lebih tinggi dari harga saat ini (Rp ${state.room.currentPrice.toLocaleString("id-ID")}).`,
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

    // If a USER placed a bid, trigger bots to react quickly if enabled
    if (bidderType === "USER" && state.config.botEnabled) {
      const quickDelay = Math.floor(1000 + Math.random() * 2500);
      state.nextBotBidAt = Date.now() + quickDelay;
    }

    return { success: true, bid: newBid };
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

    await db
      .update(auctionRooms)
      .set({
        currentPrice: state.room.currentPrice,
        status: state.room.status,
        timeRemaining: state.room.timeRemaining,
        highestBidderName: state.room.highestBidderName,
        highestBidderType: state.room.highestBidderType,
        totalBids: state.room.totalBids,
        updatedAt: Date.now(),
      })
      .where(eq(auctionRooms.id, roomId));
  }

  private async persistBid(bid: Bid) {
    await db.insert(bids).values(bid);
  }
}

export const simulationEngine = new SimulationEngine();
