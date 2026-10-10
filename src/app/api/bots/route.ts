import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { botProfiles, users, type NewBotProfile } from "@/db/schema";
import { simulationEngine } from "@/server/engine";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const bots = await db.select().from(botProfiles).orderBy(desc(botProfiles.createdAt));
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    const totalBots = bots.length;
    const activeBots = bots.filter((b) => b.isActive === 1).length;
    const totalUsers = allUsers.length;

    const personalityCounts: Record<string, number> = {
      AGGRESSIVE: 0,
      SNIPER: 0,
      CASUAL: 0,
      CONSERVATIVE: 0,
      ERRATIC: 0,
    };

    for (const b of bots) {
      if (personalityCounts[b.personality] !== undefined) {
        personalityCounts[b.personality]++;
      }
    }

    return NextResponse.json({
      success: true,
      bots,
      summary: {
        totalBots,
        activeBots,
        inactiveBots: totalBots - activeBots,
        totalUsers,
        personalityCounts,
      },
    });
  } catch (err: any) {
    console.error("GET /api/bots error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch bot profiles" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, personality, minDelaySec, maxDelaySec, maxBudget, isActive } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama bot wajib diisi" },
        { status: 400 }
      );
    }

    const id = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = Date.now();

    const newBot: NewBotProfile = {
      id,
      name: name.trim(),
      personality: personality || "CASUAL",
      minDelaySec: Math.max(1, parseInt(minDelaySec, 10) || 2),
      maxDelaySec: Math.max(2, parseInt(maxDelaySec, 10) || 5),
      maxBudget: Math.max(0, parseInt(maxBudget, 10) || 0),
      isActive: isActive !== undefined ? (isActive ? 1 : 0) : 1,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(botProfiles).values(newBot);
    await simulationEngine.reloadBots();

    return NextResponse.json({
      success: true,
      bot: newBot,
      message: "Bot pengguna berhasil ditambahkan",
    });
  } catch (err: any) {
    console.error("POST /api/bots error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menambahkan bot" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, personality, minDelaySec, maxDelaySec, maxBudget, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID bot wajib disertakan" },
        { status: 400 }
      );
    }

    const updateData: Partial<NewBotProfile> = {
      updatedAt: Date.now(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (personality !== undefined) updateData.personality = personality;
    if (minDelaySec !== undefined) updateData.minDelaySec = Math.max(1, parseInt(minDelaySec, 10) || 1);
    if (maxDelaySec !== undefined) updateData.maxDelaySec = Math.max(2, parseInt(maxDelaySec, 10) || 2);
    if (maxBudget !== undefined) updateData.maxBudget = Math.max(0, parseInt(maxBudget, 10) || 0);
    if (isActive !== undefined) updateData.isActive = isActive ? 1 : 0;

    await db.update(botProfiles).set(updateData).where(eq(botProfiles.id, id));
    await simulationEngine.reloadBots();

    const [updated] = await db.select().from(botProfiles).where(eq(botProfiles.id, id));

    return NextResponse.json({
      success: true,
      bot: updated,
      message: "Karakter bot berhasil diperbarui",
    });
  } catch (err: any) {
    console.error("PUT /api/bots error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal memperbarui bot" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID bot wajib disertakan" },
        { status: 400 }
      );
    }

    await db.delete(botProfiles).where(eq(botProfiles.id, id));
    await simulationEngine.reloadBots();

    return NextResponse.json({
      success: true,
      message: "Bot pengguna berhasil dihapus",
    });
  } catch (err: any) {
    console.error("DELETE /api/bots error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Gagal menghapus bot" },
      { status: 500 }
    );
  }
}
