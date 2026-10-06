import { NextResponse } from "next/server";
import { db } from "@/db";
import { auctionRooms, simulationConfigs, bids } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [room] = await db.select().from(auctionRooms).where(eq(auctionRooms.id, id));

    if (!room) {
      return NextResponse.json({ success: false, message: "Room not found" }, { status: 404 });
    }

    const [config] = await db
      .select()
      .from(simulationConfigs)
      .where(eq(simulationConfigs.roomId, id));

    const roomBids = await db
      .select()
      .from(bids)
      .where(eq(bids.roomId, id))
      .orderBy(desc(bids.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      room,
      config,
      bids: roomBids,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(auctionRooms).where(eq(auctionRooms.id, id));
    return NextResponse.json({ success: true, message: "Room deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
