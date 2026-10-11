import { db, initDatabasePromise } from "./index";
import { auctionRooms, simulationConfigs, bids } from "./schema";

async function main() {
  console.log("🛠️ Rebuilding PostgreSQL database schema...");
  if (initDatabasePromise) {
    await initDatabasePromise;
  }

  console.log("🧹 Clearing old data...");
  await db.delete(bids);
  await db.delete(simulationConfigs);
  await db.delete(auctionRooms);

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
      status: "ACTIVE" as const,
      totalDurationSeconds: 85920, // 23 Jam 52 Menit
      timeRemaining: 85920,
      antiSnipingSeconds: 15,
      highestBidderName: "Kamu",
      highestBidderType: "USER" as const,
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
      status: "ACTIVE" as const,
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
      status: "ACTIVE" as const,
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
      status: "ACTIVE" as const,
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

  await db.insert(auctionRooms).values(sampleRooms);

  for (const r of sampleRooms) {
    await db.insert(simulationConfigs).values({
      roomId: r.id,
      botEnabled: r.id === "lot-1" ? 0 : 1,
      botCount: 4,
      botAggressiveness: "LOW",
      botMinDelayMs: 3000,
      botMaxDelayMs: 7000,
      antiSnipingEnabled: 1,
    });
  }

  // Seed sample initial bids for lot-1
  const initialBids = [
    {
      id: "bid-1",
      roomId: "lot-1",
      bidderName: "Kamu",
      bidderType: "USER" as const,
      amount: 8718000,
      previousAmount: 8698000,
      status: "WINNING" as const,
      createdAt: now - 30000,
    },
    {
      id: "bid-2",
      roomId: "lot-1",
      bidderName: "+62858...",
      bidderType: "BOT" as const,
      amount: 8698000,
      previousAmount: 8638000,
      status: "OUTBID" as const,
      createdAt: now - 90000,
    },
    {
      id: "bid-3",
      roomId: "lot-1",
      bidderName: "+62821...",
      bidderType: "BOT" as const,
      amount: 8638000,
      previousAmount: 8618000,
      status: "OUTBID" as const,
      createdAt: now - 150000,
    },
    {
      id: "bid-4",
      roomId: "lot-1",
      bidderName: "+62858...",
      bidderType: "BOT" as const,
      amount: 8618000,
      previousAmount: 8558000,
      status: "OUTBID" as const,
      createdAt: now - 210000,
    },
    {
      id: "bid-5",
      roomId: "lot-1",
      bidderName: "+62821...",
      bidderType: "BOT" as const,
      amount: 8558000,
      previousAmount: 8538000,
      status: "OUTBID" as const,
      createdAt: now - 270000,
    },
    {
      id: "bid-6",
      roomId: "lot-1",
      bidderName: "+62858...",
      bidderType: "BOT" as const,
      amount: 8538000,
      previousAmount: 8458000,
      status: "OUTBID" as const,
      createdAt: now - 330000,
    },
    {
      id: "bid-7",
      roomId: "lot-1",
      bidderName: "+62821...",
      bidderType: "BOT" as const,
      amount: 8458000,
      previousAmount: 7918000,
      status: "OUTBID" as const,
      createdAt: now - 390000,
    },
  ];

  await db.insert(bids).values(initialBids);

  console.log("✅ PostgreSQL Seed Complete! 4 exact iPhone lots + initial bid history ready.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
