import { NextResponse } from "next/server";
import { db } from "@/db";
import { auctionRooms, simulationConfigs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { simulationEngine } from "@/server/engine";

export async function GET() {
  try {
    if (simulationEngine) {
      await simulationEngine.init();
      const liveRooms = simulationEngine.getAllRooms();
      if (liveRooms.length > 0) {
        return NextResponse.json({ success: true, rooms: liveRooms });
      }
    }
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
    const roomId = `lot-${now}-${Math.random().toString(36).substring(2, 6)}`;

    const newRoom = {
      id: roomId,
      title: body.title || "APPLE IPHONE SE 2020 128GB",
      subtitle: body.subtitle || "SoftCase Red",
      lotBadge: body.lotBadge || "(AD) STANDART",
      condition: body.condition || "Fullset",
      stock: Number(body.stock) || 1,
      specs: body.specs || "",
      description: body.description || "",
      category: body.category || "Handphone",
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80",
      startingPrice: Number(body.startingPrice) || 3551000,
      currentPrice: Number(body.startingPrice) || 3551000,
      bidIncrement: Number(body.bidIncrement) || 20000,
      reservePrice: Number(body.reservePrice) || 0,
      status: "ACTIVE" as const,
      totalDurationSeconds: Number(body.totalDurationSeconds) || 45240,
      timeRemaining: Number(body.totalDurationSeconds) || 45240,
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
      botMinDelayMs: Number(body.botMinDelayMs) || 2000,
      botMaxDelayMs: Number(body.botMaxDelayMs) || 5000,
      antiSnipingEnabled: body.antiSnipingEnabled ? 1 : 0,
    });

    if (simulationEngine) {
      await simulationEngine.init();
    }

    return NextResponse.json({ success: true, room: newRoom }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
