import { NextResponse } from "next/server";
import { db } from "@/db";
import { auctionRooms, simulationConfigs, bids } from "@/db/schema";
import { simulationEngine } from "@/server/engine";
import fs from "node:fs";
import path from "node:path";

export interface BiddingItemJson {
  raw_name?: string;
  name?: string;
  title?: string;
  grade?: string;
  status?: string;
  condition?: string;
  stock?: number;
  auction_price?: number;
  startingPrice?: number;
  price?: number;
  price_source?: string;
  imageUrl?: string;
}

export function mapBiddingItemToRoom(item: BiddingItemJson, index: number, now: number) {
  const lotId = `lot-${index + 1}`;
  const rawTitle = item.raw_name || item.name || item.title || `LOT #${String(index + 1).padStart(2, "0")}`;
  const title = rawTitle.toUpperCase();
  const grade = item.grade || "AD";
  const condition = item.condition || "Produk Only";
  const stock = Number(item.stock) || 1;
  const price = Number(item.auction_price || item.startingPrice || item.price) || 1000000;

  const specs = `Unit ${title}, Grade ${grade}, Kondisi ${condition}, Stok ${stock} unit. Status lelang: ${item.status || "Terdaftar"}.`;
  const description = `Unit lelang resmi Bidding Plus grade ${grade}. Kemulusan fisik dan fungsional sesuai standar QC.`;

  // Select clean image based on device name
  let imageUrl = item.imageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80";
  if (title.includes("SAMSUNG") || title.includes("GALAXY") || title.includes("FLIP") || title.includes("FOLD")) {
    imageUrl = "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80";
  } else if (title.includes("IPHONE") || title.includes("APPLE")) {
    imageUrl = "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80";
  } else if (title.includes("VIVO") || title.includes("OPPO") || title.includes("XIAOMI")) {
    imageUrl = "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=600&q=80";
  }

  return {
    id: lotId,
    title,
    subtitle: `${condition} • Grade ${grade}`,
    lotBadge: grade,
    condition,
    stock,
    specs,
    description,
    category: "Handphone",
    imageUrl,
    startingPrice: price,
    currentPrice: price,
    bidIncrement: 20000,
    reservePrice: Math.round(price * 1.15),
    status: "ACTIVE" as const,
    totalDurationSeconds: 85920,
    timeRemaining: 85920,
    antiSnipingSeconds: 15,
    highestBidderName: null,
    highestBidderType: null,
    totalBids: 0,
    createdAt: now - index * 1000,
    updatedAt: now - index * 1000,
  };
}

export async function POST(req: Request) {
  try {
    let rawItems: BiddingItemJson[] = [];
    let sourceName = "bidding-items.json";

    try {
      const body = await req.json();
      if (Array.isArray(body?.items) && body.items.length > 0) {
        rawItems = body.items;
        sourceName = body.fileName || "Payload JSON Kustom";
      } else if (body?.filePath) {
        const fullPath = path.resolve(process.cwd(), body.filePath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          rawItems = JSON.parse(content);
          sourceName = body.filePath;
        }
      }
    } catch {
      // Body empty or not JSON, fallback to reading bidding-items.json
    }

    // Default to reading bidding-items.json in project root
    if (rawItems.length === 0) {
      const defaultPath = path.resolve(process.cwd(), "bidding-items.json");
      if (fs.existsSync(defaultPath)) {
        const content = fs.readFileSync(defaultPath, "utf-8");
        rawItems = JSON.parse(content);
        sourceName = "bidding-items.json";
      } else {
        return NextResponse.json(
          { success: false, message: "File bidding-items.json tidak ditemukan di root proyek." },
          { status: 404 }
        );
      }
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Data JSON kosong atau format tidak valid (harus array)." },
        { status: 400 }
      );
    }

    // Map all raw items directly so total units matches uploaded JSON file
    const now = Date.now();
    const roomsToInsert = rawItems.map((item, idx) => mapBiddingItemToRoom(item, idx, now));

    // Clear existing data in database
    await db.delete(bids).execute();
    await db.delete(simulationConfigs).execute();
    await db.delete(auctionRooms).execute();

    // Chunked insert to prevent SQLite SQL variable limits
    const CHUNK_SIZE = 25;
    for (let i = 0; i < roomsToInsert.length; i += CHUNK_SIZE) {
      const roomChunk = roomsToInsert.slice(i, i + CHUNK_SIZE);
      await db.insert(auctionRooms).values(roomChunk).execute();

      const configChunk = roomChunk.map((r) => ({
        roomId: r.id,
        botEnabled: 1,
        botCount: 4,
        botAggressiveness: "MEDIUM" as const,
        botMinDelayMs: 2500,
        botMaxDelayMs: 6000,
        antiSnipingEnabled: 1,
      }));
      await db.insert(simulationConfigs).values(configChunk).execute();
    }

    // Reload simulation engine in-memory state
    await simulationEngine.reloadFromDatabase();

    return NextResponse.json({
      success: true,
      message: `Berhasil memperbarui seluruh daftar unit lelang (${roomsToInsert.length} unit) dari ${sourceName}.`,
      totalItems: roomsToInsert.length,
      rawCount: rawItems.length,
      source: sourceName,
    });
  } catch (error: any) {
    console.error("Error importing bidding items JSON:", error);
    return NextResponse.json(
      { success: false, message: `Gagal mengimpor JSON: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const defaultPath = path.resolve(process.cwd(), "bidding-items.json");
    if (!fs.existsSync(defaultPath)) {
      return NextResponse.json({
        available: false,
        message: "bidding-items.json belum ditemukan di root proyek.",
      });
    }

    const content = fs.readFileSync(defaultPath, "utf-8");
    const rawItems = JSON.parse(content);
    const sampleItems = Array.isArray(rawItems) ? rawItems.slice(0, 5) : [];

    return NextResponse.json({
      available: true,
      fileName: "bidding-items.json",
      rawCount: rawItems.length,
      uniqueCount: rawItems.length,
      totalCount: rawItems.length,
      samples: sampleItems,
    });
  } catch (error: any) {
    return NextResponse.json({ available: false, error: error.message }, { status: 500 });
  }
}
