import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

function normalizePhone(raw: string): string {
  let cleaned = raw.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("62")) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    const normalizedPhone = normalizePhone(phone || "");
    if (!normalizedPhone || normalizedPhone.length < 8) {
      return NextResponse.json(
        { success: false, error: "Nomor handphone tidak valid (minimal 8 digit)." },
        { status: 400 }
      );
    }

    // Find user by phone number
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone));

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          isRegistered: false,
          error: "Nomor handphone belum terdaftar. Silakan daftar akun baru terlebih dahulu.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isRegistered: true,
      user,
      otp: "1234",
      message: "Nomor terverifikasi. Masukkan kode OTP untuk melanjutkan.",
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses login." },
      { status: 500 }
    );
  }
}
