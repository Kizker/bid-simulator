import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import fs from "node:fs";
import path from "node:path";

// Ensure data folder exists
const dbDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, "simulator.db");
export const client = createClient({
  url: `file:${dbPath}`,
});

export const db = drizzle(client, { schema });
export { schema };

// Self-healing: enable WAL mode, busy_timeout, and ensure users table exists
export const initDatabasePromise = (async () => {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  try {
    await client.execute("PRAGMA journal_mode = WAL;");
    await client.execute("PRAGMA busy_timeout = 5000;");

    await client.execute(`
      CREATE TABLE IF NOT EXISTS auction_rooms (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL DEFAULT '',
        lot_badge TEXT NOT NULL DEFAULT '(AD) STANDART',
        condition TEXT NOT NULL DEFAULT 'Fullset',
        stock INTEGER NOT NULL DEFAULT 1,
        specs TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Handphone',
        image_url TEXT NOT NULL,
        starting_price INTEGER NOT NULL,
        current_price INTEGER NOT NULL,
        bid_increment INTEGER NOT NULL DEFAULT 50000,
        reserve_price INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        total_duration_seconds INTEGER NOT NULL DEFAULT 45240,
        time_remaining INTEGER NOT NULL DEFAULT 45240,
        anti_sniping_seconds INTEGER NOT NULL DEFAULT 15,
        highest_bidder_name TEXT,
        highest_bidder_type TEXT,
        total_bids INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS bids (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        bidder_name TEXT NOT NULL,
        bidder_type TEXT NOT NULL DEFAULT 'USER',
        amount INTEGER NOT NULL,
        previous_amount INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'WINNING',
        created_at INTEGER NOT NULL,
        FOREIGN KEY (room_id) REFERENCES auction_rooms(id) ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS simulation_configs (
        room_id TEXT PRIMARY KEY,
        bot_enabled INTEGER NOT NULL DEFAULT 1,
        bot_count INTEGER NOT NULL DEFAULT 4,
        bot_aggressiveness TEXT NOT NULL DEFAULT 'MEDIUM',
        bot_min_delay_ms INTEGER NOT NULL DEFAULT 2000,
        bot_max_delay_ms INTEGER NOT NULL DEFAULT 5000,
        anti_sniping_enabled INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (room_id) REFERENCES auction_rooms(id) ON DELETE CASCADE
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        city TEXT DEFAULT 'Jakarta',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Check if default demo user exists
    const res = await client.execute({
      sql: "SELECT id FROM users WHERE phone = ? LIMIT 1",
      args: ["81373827173"],
    });

    if (res.rows.length === 0) {
      const now = Date.now();
      await client.execute({
        sql: `INSERT INTO users (id, name, phone, email, city, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          "usr-demo-1",
          "Menik Sri Rejeki",
          "81373827173",
          "menikbda@gmail.com",
          "Jakarta",
          now,
          now,
        ],
      });
    } else {
      await client.execute({
        sql: "UPDATE users SET name = ?, email = ? WHERE phone = ?",
        args: ["Menik Sri Rejeki", "menikbda@gmail.com", "81373827173"],
      });
    }

    // Initialize app_settings table for session schedule and simulation settings
    await client.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    const scheduleRes = await client.execute({
      sql: "SELECT key FROM app_settings WHERE key = 'session_start_time' LIMIT 1",
    });

    if (scheduleRes.rows.length === 0) {
      const now = Date.now();
      await client.execute({
        sql: `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES
              ('session_start_time', '00:00:00', ?),
              ('session_end_time', '23:59:59', ?),
              ('session_auto_sync', '1', ?)`,
        args: [now, now, now],
      });
    }

    // Pastikan sesi lelang selalu aktif 24/7 dan semua room lelang berstatus ACTIVE
    await client.execute({
      sql: `UPDATE app_settings SET value = '00:00:00' WHERE key = 'session_start_time'`,
    });
    await client.execute({
      sql: `UPDATE app_settings SET value = '23:59:59' WHERE key = 'session_end_time'`,
    });
    await client.execute({
      sql: `UPDATE auction_rooms SET status = 'ACTIVE', time_remaining = 36000, total_duration_seconds = 36000 WHERE status = 'UPCOMING' OR time_remaining <= 0`,
    });

    // Initialize bot_profiles table for customizable bot users
    await client.execute(`
      CREATE TABLE IF NOT EXISTS bot_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        personality TEXT NOT NULL DEFAULT 'CASUAL',
        avatar_url TEXT,
        min_delay_sec INTEGER NOT NULL DEFAULT 2,
        max_delay_sec INTEGER NOT NULL DEFAULT 5,
        max_budget INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `);

    // Check if initial bots exist
    const botsCount = await client.execute("SELECT count(*) as count FROM bot_profiles");
    const count = Number((botsCount.rows[0] as any)?.count || 0);

    if (count === 0) {
      const now = Date.now();
      const defaultBots = [
        { id: "bot-1", name: "+62858...", personality: "AGGRESSIVE", minDelaySec: 1, maxDelaySec: 3, maxBudget: 0, isActive: 1 },
        { id: "bot-2", name: "+62821...", personality: "SNIPER", minDelaySec: 1, maxDelaySec: 3, maxBudget: 0, isActive: 1 },
        { id: "bot-3", name: "+62857...", personality: "CASUAL", minDelaySec: 3, maxDelaySec: 6, maxBudget: 0, isActive: 1 },
        { id: "bot-4", name: "+62813...", personality: "CONSERVATIVE", minDelaySec: 2, maxDelaySec: 5, maxBudget: 25000000, isActive: 1 },
        { id: "bot-5", name: "+62896...", personality: "ERRATIC", minDelaySec: 1, maxDelaySec: 7, maxBudget: 0, isActive: 1 },
        { id: "bot-6", name: "+62878...", personality: "AGGRESSIVE", minDelaySec: 1, maxDelaySec: 3, maxBudget: 0, isActive: 1 },
        { id: "bot-7", name: "+62852...", personality: "SNIPER", minDelaySec: 1, maxDelaySec: 2, maxBudget: 0, isActive: 1 },
      ];

      for (const b of defaultBots) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO bot_profiles (id, name, personality, min_delay_sec, max_delay_sec, max_budget, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [b.id, b.name, b.personality, b.minDelaySec, b.maxDelaySec, b.maxBudget, b.isActive, now, now],
        });
      }
    }
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
  }
})();


