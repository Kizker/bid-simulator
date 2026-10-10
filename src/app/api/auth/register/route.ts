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
    const { name, phone, email, city } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Nama lengkap wajib diisi minimal 2 karakter." },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhone(phone || "");
    if (!normalizedPhone || normalizedPhone.length < 8) {
      return NextResponse.json(
        { success: false, error: "Nomor handphone tidak valid (minimal 8 digit)." },
        { status: 400 }
      );
    }

    // Check if phone number already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone));

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Nomor handphone ini sudah terdaftar. Silakan masuk menggunakan nomor ini.",
          user: existing,
        },
        { status: 409 }
      );
    }

    const now = Date.now();
    const newUser = {
      id: `usr-${now}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      phone: normalizedPhone,
      email: email ? email.trim() : null,
      city: city ? city.trim() : "Jakarta",
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(users).values(newUser);

    return NextResponse.json(
      {
        success: true,
        message: "Pendaftaran berhasil! Akun Anda telah aktif.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mendaftarkan akun." },
      { status: 500 }
    );
  }
}
