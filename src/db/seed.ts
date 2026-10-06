import { createClient } from "@libsql/client";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const dbDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.resolve(dbDir, "simulator.db");
  const client = createClient({
    url: `file:${dbPath}`,
  });

  console.log("🛠️ Initializing database schema...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS auction_rooms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      image_url TEXT NOT NULL,
      starting_price INTEGER NOT NULL,
      current_price INTEGER NOT NULL,
      bid_increment INTEGER NOT NULL DEFAULT 100000,
      reserve_price INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'UPCOMING',
      total_duration_seconds INTEGER NOT NULL DEFAULT 120,
      time_remaining INTEGER NOT NULL DEFAULT 120,
      anti_sniping_seconds INTEGER NOT NULL DEFAULT 15,
      highest_bidder_name TEXT,
      highest_bidder_type TEXT,
      total_bids INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS bids (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      bidder_name TEXT NOT NULL,
      bidder_type TEXT NOT NULL DEFAULT 'USER',
      amount INTEGER NOT NULL,
      previous_amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'WINNING',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (room_id) REFERENCES auction_rooms(id) ON DELETE CASCADE
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS simulation_configs (
      room_id TEXT PRIMARY KEY,
      bot_enabled INTEGER NOT NULL DEFAULT 1,
      bot_count INTEGER NOT NULL DEFAULT 4,
      bot_aggressiveness TEXT NOT NULL DEFAULT 'MEDIUM',
      bot_min_delay_ms INTEGER NOT NULL DEFAULT 1500,
      bot_max_delay_ms INTEGER NOT NULL DEFAULT 4500,
      anti_sniping_enabled INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (room_id) REFERENCES auction_rooms(id) ON DELETE CASCADE
    );
  `);

  console.log("🌱 Checking existing rooms...");
  const existing = await client.execute("SELECT count(*) as count FROM auction_rooms;");
  const count = Number(existing.rows[0].count);

  if (count === 0) {
    console.log("🚀 Seeding initial auction simulation data...");
    const now = Date.now();

    const sampleRooms = [
      {
        id: "room-1",
        title: "Rolex Submariner Date 41mm 'Kermit' Green Bezel",
        description: "Kondisi Brand New In Box (BNIB) 2024. Lengkap dengan box original, green tag, kartu garansi internasional resmi 5 tahun, dan full links.",
        category: "Luxury Watches",
        imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
        startingPrice: 175000000,
        currentPrice: 175000000,
        bidIncrement: 2500000,
        reservePrice: 190000000,
        status: "ACTIVE",
        totalDurationSeconds: 180,
        timeRemaining: 180,
        antiSnipingSeconds: 15,
        highestBidderName: null,
        highestBidderType: null,
        totalBids: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "room-2",
        title: "Air Jordan 1 Retro High OG 'Chicago' 1985 Collector Edition",
        description: "Sepatu legendaris Michael Jordan dengan kondisi deadstock museum-grade. Verified authentic by LegitCheck dengan sertifikat NFT.",
        category: "Rare Sneakers",
        imageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80",
        startingPrice: 25000000,
        currentPrice: 25000000,
        bidIncrement: 500000,
        reservePrice: 32000000,
        status: "UPCOMING",
        totalDurationSeconds: 120,
        timeRemaining: 120,
        antiSnipingSeconds: 15,
        highestBidderName: null,
        highestBidderType: null,
        totalBids: 0,
        createdAt: now - 3600000,
        updatedAt: now - 3600000,
      },
      {
        id: "room-3",
        title: "Vespa Super 150cc 1974 Restorasi Original Piaggio Italy",
        description: "Mesin halus kering no bocor, cat original Spies Hecker British Racing Green, surat lengkap akur BPKB & STNK hidup nomor rangka cocok.",
        category: "Classic Vehicles",
        imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
        startingPrice: 45000000,
        currentPrice: 45000000,
        bidIncrement: 1000000,
        reservePrice: 55000000,
        status: "UPCOMING",
        totalDurationSeconds: 240,
        timeRemaining: 240,
        antiSnipingSeconds: 20,
        highestBidderName: null,
        highestBidderType: null,
        totalBids: 0,
        createdAt: now - 7200000,
        updatedAt: now - 7200000,
      },
    ];

    for (const r of sampleRooms) {
      await client.execute({
        sql: `INSERT INTO auction_rooms (
          id, title, description, category, image_url, starting_price, current_price,
          bid_increment, reserve_price, status, total_duration_seconds, time_remaining,
          anti_sniping_seconds, highest_bidder_name, highest_bidder_type, total_bids,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          r.id, r.title, r.description, r.category, r.imageUrl, r.startingPrice, r.currentPrice,
          r.bidIncrement, r.reservePrice, r.status, r.totalDurationSeconds, r.timeRemaining,
          r.antiSnipingSeconds, r.highestBidderName, r.highestBidderType, r.totalBids,
          r.createdAt, r.updatedAt,
        ],
      });

      await client.execute({
        sql: `INSERT INTO simulation_configs (
          room_id, bot_enabled, bot_count, bot_aggressiveness, bot_min_delay_ms,
          bot_max_delay_ms, anti_sniping_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [r.id, 1, 4, "MEDIUM", 1500, 4500, 1],
      });
    }

    console.log("✅ Seed complete! 3 sample auction rooms created.");
  } else {
    console.log(`ℹ️ Database already has ${count} rooms. Skipping initial seed.`);
  }
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
