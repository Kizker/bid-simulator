import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return NextResponse.json({
      success: true,
      users: allUsers,
      total: allUsers.length,
    });
  } catch (err: any) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
