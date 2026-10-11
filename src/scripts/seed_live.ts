import fs from "node:fs";
import path from "node:path";
import { client, initDatabasePromise } from "../db";

async function main() {
  if (initDatabasePromise) {
    await initDatabasePromise;
  }

  const sqlFile = path.resolve(process.cwd(), "data/seed_data.sql");
  console.log(`📥 Membaca data SQL dari ${sqlFile}...`);
  if (!fs.existsSync(sqlFile)) {
    console.error("❌ File data/seed_data.sql tidak ditemukan!");
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFile, "utf-8");
  console.log("🚀 Mengimpor seluruh data lelang lokal ke PostgreSQL...");
  await client.unsafe(sqlContent);
  console.log("🎉 SUKSES! Seluruh database lokal (336 room, 282 bids, users, bots, configs) berhasil dimigrasikan ke database PostgreSQL!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Gagal migrasi:", err);
  process.exit(1);
});
