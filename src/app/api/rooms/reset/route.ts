import { NextResponse } from "next/server";
import { db } from "@/db";
import { bids, simulationConfigs, auctionRooms } from "@/db/schema";
import { simulationEngine } from "@/server/engine";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    let mode = "delete_all"; // default to deleting all units as requested by user
    try {
      const body = await req.json();
      if (body?.mode) {
        mode = body.mode;
      }
    } catch {
      // no body or plain POST -> default delete_all
    }

    if (mode === "reset_prices") {
      // 1. Delete all bids
      await db.delete(bids);

      // 2. Reset prices and timers to starting prices
      await db.update(auctionRooms).set({
        currentPrice: sql`starting_price`,
        highestBidderName: null,
        highestBidderType: null,
        totalBids: 0,
        timeRemaining: sql`total_duration_seconds`,
        status: "ACTIVE",
      });

      // 3. Reload in-memory engine
      await simulationEngine.reloadFromDatabase();

      return NextResponse.json({
        success: true,
        mode: "reset_prices",
        message: "Harga semua unit lelang berhasil dikembalikan ke harga awal (open bid).",
      });
    }

    // Default: "delete_all" -> Purge ALL units and bids completely (0 units)
    await db.delete(bids);
    await db.delete(simulationConfigs);
    await db.delete(auctionRooms);

    // Clear simulation engine
    simulationEngine.clearAllRooms();

    return NextResponse.json({
      success: true,
      mode: "delete_all",
      message: "Seluruh daftar unit lelang dan tawaran berhasil dihapus dan dikosongkan.",
    });
  } catch (error: any) {
    console.error("Failed to reset/clear auction units:", error);
    return NextResponse.json(
      { success: false, message: `Gagal mereset unit: ${error.message}` },
      { status: 500 }
    );
  }
}
