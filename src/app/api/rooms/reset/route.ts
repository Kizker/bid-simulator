import { NextResponse } from "next/server";
import { client } from "@/db";
import { simulationEngine } from "@/server/engine";

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
      await client.execute("DELETE FROM bids");

      // 2. Reset prices and timers to starting prices
      await client.execute(`
        UPDATE auction_rooms
        SET current_price = starting_price,
            highest_bidder_name = NULL,
            highest_bidder_type = NULL,
            total_bids = 0,
            time_remaining = total_duration_seconds,
            status = 'ACTIVE'
      `);

      // 3. Reload in-memory engine
      await simulationEngine.reloadFromDatabase();

      return NextResponse.json({
        success: true,
        mode: "reset_prices",
        message: "Harga semua unit lelang berhasil dikembalikan ke harga awal (open bid).",
      });
    }

    // Default: "delete_all" -> Purge ALL units and bids completely (0 units)
    await client.execute("DELETE FROM bids");
    await client.execute("DELETE FROM simulation_configs");
    await client.execute("DELETE FROM auction_rooms");

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
