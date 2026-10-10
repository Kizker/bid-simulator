import fs from "node:fs";
import path from "node:path";
import { db } from "../db";
import { auctionRooms, simulationConfigs, bids } from "../db/schema";
import { mapBiddingItemToRoom } from "../lib/biddingMapper";

async function main() {
  const filePathArg = process.argv[2] || "bidding-items.json";

  if (filePathArg === "--help" || filePathArg === "-h") {
    console.log(`
Penggunaan CLI Import Lot Lelang:
  pnpm import-items [path/to/file.json]

Contoh:
  pnpm import-items
  pnpm import-items bidding-items.json
  pnpm import-items /path/to/custom-items.json
`);
    process.exit(0);
  }

  const targetPath = path.resolve(process.cwd(), filePathArg);

  console.log(`📦 Membaca file: ${targetPath}...`);
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ File tidak ditemukan: ${targetPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(targetPath, "utf-8");
  const rawItems = JSON.parse(content);
  console.log(`📊 Total unit dalam file: ${rawItems.length}`);

  const now = Date.now();
  const roomsToInsert = rawItems.map((item: any, idx: number) => mapBiddingItemToRoom(item, idx, now));

  console.log("🧹 Membersihkan data lelang lama di database...");
  await db.delete(bids).execute();
  await db.delete(simulationConfigs).execute();
  await db.delete(auctionRooms).execute();

  console.log("💾 Menyimpan data lot baru ke database...");
  const CHUNK_SIZE = 25;
  for (let i = 0; i < roomsToInsert.length; i += CHUNK_SIZE) {
    const roomChunk = roomsToInsert.slice(i, i + CHUNK_SIZE);
    await db.insert(auctionRooms).values(roomChunk).execute();

    const configChunk = roomChunk.map((r: any) => ({
      roomId: r.id,
      botEnabled: 1,
      botCount: 4,
      botAggressiveness: "MEDIUM" as const,
      botMinDelayMs: 2500,
      botMaxDelayMs: 6000,
      antiSnipingEnabled: 1,
    }));
    await db.insert(simulationConfigs).values(configChunk).execute();
    process.stdout.write(`  Inserted ${Math.min(i + CHUNK_SIZE, roomsToInsert.length)}/${roomsToInsert.length} rooms...\r`);
  }

  console.log(`\n🎉 SUKSES! ${roomsToInsert.length} produk lot berhasil diimpor ke database.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Gagal mengimpor:", err);
  process.exit(1);
});
