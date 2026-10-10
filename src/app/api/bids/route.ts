import { NextResponse } from "next/server";
import { db } from "@/db";
import { bids, auctionRooms } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50)));

    if (roomId) {
      const roomBids = await db
        .select({
          id: bids.id,
          roomId: bids.roomId,
          bidderName: bids.bidderName,
          bidderType: bids.bidderType,
          amount: bids.amount,
          previousAmount: bids.previousAmount,
          status: bids.status,
          createdAt: bids.createdAt,
          roomTitle: auctionRooms.title,
        })
        .from(bids)
        .leftJoin(auctionRooms, eq(bids.roomId, auctionRooms.id))
        .where(eq(bids.roomId, roomId))
        .orderBy(desc(bids.createdAt))
        .limit(limit);

      return NextResponse.json({ success: true, bids: roomBids });
    }

    // Global bids across all rooms
    const allBids = await db
      .select({
        id: bids.id,
        roomId: bids.roomId,
        bidderName: bids.bidderName,
        bidderType: bids.bidderType,
        amount: bids.amount,
        previousAmount: bids.previousAmount,
        status: bids.status,
        createdAt: bids.createdAt,
        roomTitle: auctionRooms.title,
      })
      .from(bids)
      .leftJoin(auctionRooms, eq(bids.roomId, auctionRooms.id))
      .orderBy(desc(bids.createdAt))
      .limit(limit);

    return NextResponse.json({ success: true, bids: allBids });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
