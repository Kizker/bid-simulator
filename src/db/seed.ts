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

  console.log("🛠️ Rebuilding database schema with Bidding Plus format...");

  // Drop and recreate tables to ensure new columns exist cleanly
  await client.execute("DROP TABLE IF EXISTS bids;");
  await client.execute("DROP TABLE IF EXISTS simulation_configs;");
  await client.execute("DROP TABLE IF EXISTS auction_rooms;");

  await client.execute(`
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
      starting_price INTEGER NOT NULL,
      current_price INTEGER NOT NULL,
      bid_increment INTEGER NOT NULL DEFAULT 50000,
      reserve_price INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      total_duration_seconds INTEGER NOT NULL DEFAULT 45240,
      time_remaining INTEGER NOT NULL DEFAULT 45240,
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
      bot_min_delay_ms INTEGER NOT NULL DEFAULT 2000,
      bot_max_delay_ms INTEGER NOT NULL DEFAULT 5000,
      anti_sniping_enabled INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (room_id) REFERENCES auction_rooms(id) ON DELETE CASCADE
    );
  `);

  console.log("🚀 Seeding Bidding Plus exact lots...");
  const now = Date.now();
  const iphoneImg = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80";

  const sampleRooms = [
    {
      id: "lot-1",
      title: "APPLE IPHONE SE 2020 128GB",
      subtitle: "SoftCase Red",
      lotBadge: "(AE) FAIR",
      condition: "Fullset",
      stock: 1,
      specs: "Kapasitas 128GB, Battery Health 82%, Touch ID Normal, Truetone Aktif, Factory Unlocked (Semua SIM).",
      description: "Unit iPhone SE 2020 kondisi fisik mulus sesuai grade Scrapt/Standart, kelengkapan fullset box dan charger. Garansi fungsi 7 hari.",
      category: "Handphone",
      imageUrl: iphoneImg,
      startingPrice: 7918000,
      currentPrice: 8718000,
      bidIncrement: 20000,
      reservePrice: 9000000,
      status: "ACTIVE",
      totalDurationSeconds: 85920, // 23 Jam 52 Menit
      timeRemaining: 85920,
      antiSnipingSeconds: 15,
      highestBidderName: "Kamu",
      highestBidderType: "USER",
      totalBids: 7,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "lot-2",
      title: "APPLE IPHONE SE 2020 128GB",
      subtitle: "SoftCase Black",
      lotBadge: "(AJ) LOT SCRAPT",
      condition: "Fullset",
      stock: 1,
      specs: "Kapasitas 128GB, Battery Health 85%, All Operator, Kamera Jernih, iCloud Clean siap reset.",
      description: "Unit lelang lot scrapt, kemulusan 90%, fungsi speaker mic normal, siap pakai harian.",
      category: "Handphone",
      imageUrl: iphoneImg,
      startingPrice: 2551000,
      currentPrice: 2551000,
      bidIncrement: 20000,
      reservePrice: 2800000,
      status: "ACTIVE",
      totalDurationSeconds: 45240,
      timeRemaining: 45240,
      antiSnipingSeconds: 15,
      highestBidderName: null,
      highestBidderType: null,
      totalBids: 0,
      createdAt: now - 1000,
      updatedAt: now - 1000,
    },
    {
      id: "lot-3",
      title: "APPLE IPHONE SE 2020 128GB",
      subtitle: "SoftCase Brown",
      lotBadge: "(AD) STANDART",
      condition: "Fullset",
      stock: 1,
      specs: "Kapasitas 128GB, Battery Health 88%, LCD Original, Fingerprint responsif, Mulus 93%.",
      description: "Grade Standart pilihan koleksi lelang reguler, lengkap dengan softcase cokelat premium.",
      category: "Handphone",
      imageUrl: iphoneImg,
      startingPrice: 4551000,
      currentPrice: 4551000,
      bidIncrement: 20000,
      reservePrice: 4800000,
      status: "ACTIVE",
      totalDurationSeconds: 45240,
      timeRemaining: 45240,
      antiSnipingSeconds: 15,
      highestBidderName: null,
      highestBidderType: null,
      totalBids: 0,
      createdAt: now - 2000,
      updatedAt: now - 2000,
    },
    {
      id: "lot-4",
      title: "APPLE IPHONE SE 2020 128GB",
      subtitle: "SoftCase Ungu",
      lotBadge: "(AD) STANDART",
      condition: "Fullset",
      stock: 1,
      specs: "Kapasitas 128GB, Battery Health 86%, Layar Retina HD, Unit mulus grade standart.",
      description: "Unit iPhone SE 2020 warna ungu softcase, tested lulus QC 32 titik sensor.",
      category: "Handphone",
      imageUrl: iphoneImg,
      startingPrice: 3851000,
      currentPrice: 3851000,
      bidIncrement: 20000,
      reservePrice: 4000000,
      status: "ACTIVE",
      totalDurationSeconds: 45240,
      timeRemaining: 45240,
      antiSnipingSeconds: 15,
      highestBidderName: null,
      highestBidderType: null,
      totalBids: 0,
      createdAt: now - 3000,
      updatedAt: now - 3000,
    },
  ];

  for (const r of sampleRooms) {
    await client.execute({
      sql: `INSERT INTO auction_rooms (
        id, title, subtitle, lot_badge, condition, stock, specs, description, category,
        image_url, starting_price, current_price, bid_increment, reserve_price, status,
        total_duration_seconds, time_remaining, anti_sniping_seconds, highest_bidder_name,
        highest_bidder_type, total_bids, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        r.id, r.title, r.subtitle, r.lotBadge, r.condition, r.stock, r.specs, r.description,
        r.category, r.imageUrl, r.startingPrice, r.currentPrice, r.bidIncrement, r.reservePrice,
        r.status, r.totalDurationSeconds, r.timeRemaining, r.antiSnipingSeconds,
        r.highestBidderName, r.highestBidderType, r.totalBids, r.createdAt, r.updatedAt,
      ],
    });

    await client.execute({
      sql: `INSERT INTO simulation_configs (
        room_id, bot_enabled, bot_count, bot_aggressiveness, bot_min_delay_ms,
        bot_max_delay_ms, anti_sniping_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [r.id, r.id === "lot-1" ? 0 : 1, 4, "LOW", 3000, 7000, 1],
    });
  }

  // Seed sample initial bids for lot-1 (to match the screenshot!)
  const initialBids = [
    {
      id: "bid-1",
      roomId: "lot-1",
      bidderName: "Kamu",
      bidderType: "USER",
      amount: 8718000,
      previousAmount: 8698000,
      status: "WINNING",
      createdAt: now - 30000,
    },
    {
      id: "bid-2",
      roomId: "lot-1",
      bidderName: "+62858...",
      bidderType: "BOT",
      amount: 8698000,
      previousAmount: 8638000,
      status: "OUTBID",
      createdAt: now - 90000,
    },
    {
      id: "bid-3",
      roomId: "lot-1",
      bidderName: "+62821...",
      bidderType: "BOT",
      amount: 8638000,
      previousAmount: 8618000,
      status: "OUTBID",
      createdAt: now - 150000,
    },
    {
      id: "bid-4",
      roomId: "lot-1",
      bidderName: "+62858...",
      bidderType: "BOT",
      amount: 8618000,
      previousAmount: 8558000,
      status: "OUTBID",
      createdAt: now - 210000,
    },
    {
      id: "bid-5",
      roomId: "lot-1",
      bidderName: "+62821...",
      bidderType: "BOT",
      amount: 8558000,
      previousAmount: 8538000,
      status: "OUTBID",
      createdAt: now - 270000,
    },
    {
      id: "bid-6",
      roomId: "lot-1",
      bidderName: "+62858...",
      bidderType: "BOT",
      amount: 8538000,
      previousAmount: 8458000,
      status: "OUTBID",
      createdAt: now - 330000,
    },
    {
      id: "bid-7",
      roomId: "lot-1",
      bidderName: "+62821...",
      bidderType: "BOT",
      amount: 8458000,
      previousAmount: 7918000,
      status: "OUTBID",
      createdAt: now - 390000,
    },
  ];

  for (const b of initialBids) {
    await client.execute({
      sql: `INSERT INTO bids (id, room_id, bidder_name, bidder_type, amount, previous_amount, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [b.id, b.roomId, b.bidderName, b.bidderType, b.amount, b.previousAmount, b.status, b.createdAt],
    });
  }

  console.log("✅ Bidding Plus Seed Complete! 4 exact iPhone lots + initial bid history ready.");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
