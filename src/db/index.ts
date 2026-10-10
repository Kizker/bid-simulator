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
(async () => {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  try {
    await client.execute("PRAGMA journal_mode = WAL;");
    await client.execute("PRAGMA busy_timeout = 5000;");

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
              ('session_start_time', '17:00:00', ?),
              ('session_end_time', '08:00:00', ?),
              ('session_auto_sync', '1', ?)`,
        args: [now, now, now],
      });
    }

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


