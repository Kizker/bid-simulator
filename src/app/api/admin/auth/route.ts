import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const validUsername = process.env.ADMIN_USER || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (username === validUsername && password === validPassword) {
      return NextResponse.json({
        success: true,
        message: "Login admin berhasil.",
        token: "admin_authenticated_session",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Username atau password admin salah. Silakan periksa kembali.",
      },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses autentikasi admin." },
      { status: 500 }
    );
  }
}
