import { NextResponse } from "next/server";
import { db } from "@/db";
import { auctionRooms, simulationConfigs, bids } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { simulationEngine } from "@/server/engine";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [room] = await db.select().from(auctionRooms).where(eq(auctionRooms.id, id));

    if (!room) {
      return NextResponse.json({ success: false, message: "Unit tidak ditemukan" }, { status: 404 });
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const [existingRoom] = await db.select().from(auctionRooms).where(eq(auctionRooms.id, id));
    if (!existingRoom) {
      return NextResponse.json({ success: false, message: "Unit tidak ditemukan" }, { status: 404 });
    }

    const updateData: Partial<typeof auctionRooms.$inferInsert> = {
      updatedAt: Date.now(),
    };

    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.category !== undefined) updateData.category = String(body.category).trim();
    if (body.imageUrl !== undefined) updateData.imageUrl = String(body.imageUrl).trim();
    if (body.startingPrice !== undefined) updateData.startingPrice = Math.max(0, Number(body.startingPrice));
    if (body.currentPrice !== undefined) updateData.currentPrice = Math.max(0, Number(body.currentPrice));
    if (body.bidIncrement !== undefined) updateData.bidIncrement = Math.max(1000, Number(body.bidIncrement));
    if (body.reservePrice !== undefined) updateData.reservePrice = Math.max(0, Number(body.reservePrice));
    if (body.status !== undefined) updateData.status = body.status;
    if (body.lotBadge !== undefined) updateData.lotBadge = String(body.lotBadge);
    if (body.condition !== undefined) updateData.condition = String(body.condition);
    if (body.specs !== undefined) updateData.specs = String(body.specs);
    if (body.subtitle !== undefined) updateData.subtitle = String(body.subtitle);
    if (body.stock !== undefined) updateData.stock = Math.max(1, Number(body.stock));
    if (body.totalDurationSeconds !== undefined) {
      updateData.totalDurationSeconds = Math.max(10, Number(body.totalDurationSeconds));
    }
    if (body.timeRemaining !== undefined) {
      updateData.timeRemaining = Math.max(0, Number(body.timeRemaining));
    }

    await db.update(auctionRooms).set(updateData).where(eq(auctionRooms.id, id)).execute();

    // Reload unit in simulation engine
    await simulationEngine.reloadFromDatabase(id);

    const [updatedRoom] = await db.select().from(auctionRooms).where(eq(auctionRooms.id, id));

    return NextResponse.json({
      success: true,
      room: updatedRoom,
      message: "Unit lelang berhasil diperbarui",
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

    // 1. Delete associated bids and configs
    await db.delete(bids).where(eq(bids.roomId, id)).execute();
    await db.delete(simulationConfigs).where(eq(simulationConfigs.roomId, id)).execute();

    // 2. Delete room from auction_rooms
    await db.delete(auctionRooms).where(eq(auctionRooms.id, id)).execute();

    // 3. Remove room runtime state from simulation engine
    simulationEngine.removeRoom(id);

    return NextResponse.json({
      success: true,
      message: "Unit lelang berhasil dihapus",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
