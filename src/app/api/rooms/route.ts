import { NextResponse } from "next/server";
import { db } from "@/db";
import { auctionRooms, simulationConfigs, bids } from "@/db/schema";
import { desc } from "drizzle-orm";
import { simulationEngine } from "@/server/engine";

export async function GET() {
  try {
    const rooms = await db.select().from(auctionRooms).orderBy(desc(auctionRooms.createdAt));
    return NextResponse.json({ success: true, rooms });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = Date.now();
    const roomId = `room-${now}-${Math.random().toString(36).substring(2, 6)}`;

    const newRoom = {
      id: roomId,
      title: body.title || "Lelang Baru",
      description: body.description || "",
      category: body.category || "General",
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
      startingPrice: Number(body.startingPrice) || 1000000,
      currentPrice: Number(body.startingPrice) || 1000000,
      bidIncrement: Number(body.bidIncrement) || 100000,
      reservePrice: Number(body.reservePrice) || 0,
      status: "UPCOMING" as const,
      totalDurationSeconds: Number(body.totalDurationSeconds) || 120,
      timeRemaining: Number(body.totalDurationSeconds) || 120,
      antiSnipingSeconds: Number(body.antiSnipingSeconds) || 15,
      highestBidderName: null,
      highestBidderType: null,
      totalBids: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(auctionRooms).values(newRoom);

    await db.insert(simulationConfigs).values({
      roomId: roomId,
      botEnabled: body.botEnabled ? 1 : 0,
      botCount: Number(body.botCount) || 4,
      botAggressiveness: body.botAggressiveness || "MEDIUM",
      botMinDelayMs: Number(body.botMinDelayMs) || 1500,
      botMaxDelayMs: Number(body.botMaxDelayMs) || 4500,
      antiSnipingEnabled: body.antiSnipingEnabled ? 1 : 0,
    });

    // Also register in memory engine if running
    if (simulationEngine) {
      await simulationEngine.init();
    }

    return NextResponse.json({ success: true, room: newRoom }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
