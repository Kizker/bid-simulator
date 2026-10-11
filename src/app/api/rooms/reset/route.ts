import { NextResponse } from "next/server";
import { db } from "@/db";
import { bids, simulationConfigs, auctionRooms } from "@/db/schema";
import { simulationEngine } from "@/server/engine";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    let mode = "reset_prices"; // Safe default: reset prices to open bid
    try {
      const body = await req.json();
      if (body?.mode) {
        mode = body.mode;
      }
    } catch {
      // no body -> default to reset_prices
    }

    if (mode === "reset_prices") {
      // Execute atomic reset to open bid and notify all clients via socket
      await simulationEngine.resetAllRoomsToOpenBid();

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
