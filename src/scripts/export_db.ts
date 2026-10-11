import postgres from "postgres";
import fs from "node:fs";
import path from "node:path";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {}
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://bid_user:bid_secure_pass123@localhost:5432/bid_simulator";

async function main() {
  console.log("📤 Mengambil data dari local PostgreSQL...");
  const sql = postgres(connectionString);

  const users = await sql`SELECT * FROM users`;
  const botProfiles = await sql`SELECT * FROM bot_profiles`;
  const appSettings = await sql`SELECT * FROM app_settings`;
  const auctionRooms = await sql`SELECT * FROM auction_rooms`;
  const simulationConfigs = await sql`SELECT * FROM simulation_configs`;
  const bids = await sql`SELECT * FROM bids`;

  console.log(`📊 Statistik Data Lokal:
  - Users              : ${users.length}
  - Bot Profiles       : ${botProfiles.length}
  - App Settings       : ${appSettings.length}
  - Auction Rooms      : ${auctionRooms.length}
  - Simulation Configs : ${simulationConfigs.length}
  - Bids               : ${bids.length}`);

  let dumpSql = `-- =========================================================================
-- Dump Database Bid Simulator dari Local ke Live Server
-- Generated at: ${new Date().toISOString()}
-- =========================================================================

-- 1. Bersihkan data lama di live server
TRUNCATE TABLE bids CASCADE;
TRUNCATE TABLE simulation_configs CASCADE;
TRUNCATE TABLE auction_rooms CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE bot_profiles CASCADE;
TRUNCATE TABLE app_settings CASCADE;

`;

  // Helper function to format SQL values
  const escapeSql = (val: any) => {
    if (val === null || val === undefined) return "NULL";
    if (typeof val === "number" || typeof val === "bigint") return String(val);
    if (typeof val === "boolean") return val ? "1" : "0";
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  // 1. Users
  if (users.length > 0) {
    dumpSql += `-- Users (${users.length})\nINSERT INTO users (id, name, phone, email, city, created_at, updated_at) VALUES\n`;
    dumpSql += users
      .map(
        (u) =>
          `(${escapeSql(u.id)}, ${escapeSql(u.name)}, ${escapeSql(u.phone)}, ${escapeSql(u.email)}, ${escapeSql(u.city)}, ${escapeSql(u.created_at)}, ${escapeSql(u.updated_at)})`
      )
      .join(",\n");
    dumpSql += ";\n\n";
  }

  // 2. Bot Profiles
  if (botProfiles.length > 0) {
    dumpSql += `-- Bot Profiles (${botProfiles.length})\nINSERT INTO bot_profiles (id, name, personality, avatar_url, min_delay_sec, max_delay_sec, max_budget, is_active, created_at, updated_at) VALUES\n`;
    dumpSql += botProfiles
      .map(
        (b) =>
          `(${escapeSql(b.id)}, ${escapeSql(b.name)}, ${escapeSql(b.personality)}, ${escapeSql(b.avatar_url)}, ${escapeSql(b.min_delay_sec)}, ${escapeSql(b.max_delay_sec)}, ${escapeSql(b.max_budget)}, ${escapeSql(b.is_active)}, ${escapeSql(b.created_at)}, ${escapeSql(b.updated_at)})`
      )
      .join(",\n");
    dumpSql += ";\n\n";
  }

  // 3. App Settings
  if (appSettings.length > 0) {
    dumpSql += `-- App Settings (${appSettings.length})\nINSERT INTO app_settings (key, value, updated_at) VALUES\n`;
    dumpSql += appSettings
      .map((s) => `(${escapeSql(s.key)}, ${escapeSql(s.value)}, ${escapeSql(s.updated_at)})`)
      .join(",\n");
    dumpSql += ";\n\n";
  }

  // 4. Auction Rooms (Batch in chunks of 50 to avoid massive single statements)
  if (auctionRooms.length > 0) {
    dumpSql += `-- Auction Rooms (${auctionRooms.length})\n`;
    const chunkSize = 50;
    for (let i = 0; i < auctionRooms.length; i += chunkSize) {
      const chunk = auctionRooms.slice(i, i + chunkSize);
      dumpSql += `INSERT INTO auction_rooms (id, title, subtitle, lot_badge, condition, stock, specs, description, category, image_url, starting_price, current_price, bid_increment, reserve_price, status, total_duration_seconds, time_remaining, anti_sniping_seconds, highest_bidder_name, highest_bidder_type, total_bids, created_at, updated_at) VALUES\n`;
      dumpSql += chunk
        .map(
          (r) =>
            `(${escapeSql(r.id)}, ${escapeSql(r.title)}, ${escapeSql(r.subtitle)}, ${escapeSql(r.lot_badge)}, ${escapeSql(r.condition)}, ${escapeSql(r.stock)}, ${escapeSql(r.specs)}, ${escapeSql(r.description)}, ${escapeSql(r.category)}, ${escapeSql(r.image_url)}, ${escapeSql(r.starting_price)}, ${escapeSql(r.current_price)}, ${escapeSql(r.bid_increment)}, ${escapeSql(r.reserve_price)}, ${escapeSql(r.status)}, ${escapeSql(r.total_duration_seconds)}, ${escapeSql(r.time_remaining)}, ${escapeSql(r.anti_sniping_seconds)}, ${escapeSql(r.highest_bidder_name)}, ${escapeSql(r.highest_bidder_type)}, ${escapeSql(r.total_bids)}, ${escapeSql(r.created_at)}, ${escapeSql(r.updated_at)})`
        )
        .join(",\n");
      dumpSql += ";\n";
    }
    dumpSql += "\n";
  }

  // 5. Simulation Configs
  if (simulationConfigs.length > 0) {
    dumpSql += `-- Simulation Configs (${simulationConfigs.length})\n`;
    const chunkSize = 50;
    for (let i = 0; i < simulationConfigs.length; i += chunkSize) {
      const chunk = simulationConfigs.slice(i, i + chunkSize);
      dumpSql += `INSERT INTO simulation_configs (room_id, bot_enabled, bot_count, bot_aggressiveness, bot_min_delay_ms, bot_max_delay_ms, anti_sniping_enabled) VALUES\n`;
      dumpSql += chunk
        .map(
          (c) =>
            `(${escapeSql(c.room_id)}, ${escapeSql(c.bot_enabled)}, ${escapeSql(c.bot_count)}, ${escapeSql(c.bot_aggressiveness)}, ${escapeSql(c.bot_min_delay_ms)}, ${escapeSql(c.bot_max_delay_ms)}, ${escapeSql(c.anti_sniping_enabled)})`
        )
        .join(",\n");
      dumpSql += ";\n";
    }
    dumpSql += "\n";
  }

  // 6. Bids
  if (bids.length > 0) {
    dumpSql += `-- Bids (${bids.length})\n`;
    const chunkSize = 50;
    for (let i = 0; i < bids.length; i += chunkSize) {
      const chunk = bids.slice(i, i + chunkSize);
      dumpSql += `INSERT INTO bids (id, room_id, bidder_name, bidder_type, amount, previous_amount, status, created_at) VALUES\n`;
      dumpSql += chunk
        .map(
          (b) =>
            `(${escapeSql(b.id)}, ${escapeSql(b.room_id)}, ${escapeSql(b.bidder_name)}, ${escapeSql(b.bidder_type)}, ${escapeSql(b.amount)}, ${escapeSql(b.previous_amount)}, ${escapeSql(b.status)}, ${escapeSql(b.created_at)})`
        )
        .join(",\n");
      dumpSql += ";\n";
    }
    dumpSql += "\n";
  }

  const outDir = path.resolve(process.cwd(), "data");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const targetFile = path.resolve(outDir, "seed_data.sql");
  fs.writeFileSync(targetFile, dumpSql, "utf-8");
  console.log(`✅ Berhasil mengekspor database ke: ${targetFile}`);

  await sql.end();
}

main().catch((err) => {
  console.error("❌ Gagal mengekspor data:", err);
  process.exit(1);
});
