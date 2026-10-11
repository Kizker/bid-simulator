import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {}
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://bid_user:bid_secure_pass123@localhost:5432/bid_simulator";

// PostgreSQL client configured for high concurrency in Node.js
export const client = postgres(connectionString, {
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "20", 10),
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: () => {}, // Suppress notice spam
});

export const db = drizzle(client, { schema });
export { schema };

// Self-healing: ensure PostgreSQL tables and default initial seed data exist
export const initDatabasePromise = (async () => {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  try {
    await client`
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
        starting_price BIGINT NOT NULL,
        current_price BIGINT NOT NULL,
        bid_increment INTEGER NOT NULL DEFAULT 50000,
        reserve_price BIGINT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        total_duration_seconds INTEGER NOT NULL DEFAULT 45240,
        time_remaining INTEGER NOT NULL DEFAULT 45240,
        anti_sniping_seconds INTEGER NOT NULL DEFAULT 15,
        highest_bidder_name TEXT,
        highest_bidder_type TEXT,
        total_bids INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS bids (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL REFERENCES auction_rooms(id) ON DELETE CASCADE,
        bidder_name TEXT NOT NULL,
        bidder_type TEXT NOT NULL DEFAULT 'USER',
        amount BIGINT NOT NULL,
        previous_amount BIGINT NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'WINNING',
        created_at BIGINT NOT NULL
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS simulation_configs (
        room_id TEXT PRIMARY KEY REFERENCES auction_rooms(id) ON DELETE CASCADE,
        bot_enabled INTEGER NOT NULL DEFAULT 1,
        bot_count INTEGER NOT NULL DEFAULT 4,
        bot_aggressiveness TEXT NOT NULL DEFAULT 'MEDIUM',
        bot_min_delay_ms INTEGER NOT NULL DEFAULT 2000,
        bot_max_delay_ms INTEGER NOT NULL DEFAULT 5000,
        anti_sniping_enabled INTEGER NOT NULL DEFAULT 1
      );
    `;

    await client`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        email TEXT,
        city TEXT DEFAULT 'Jakarta',
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;

    // Check if default demo user exists
    const usersRes = await client`
      SELECT id FROM users WHERE phone = '81373827173' LIMIT 1
    `;

    const now = Date.now();
    if (usersRes.length === 0) {
      await client`
        INSERT INTO users (id, name, phone, email, city, created_at, updated_at)
        VALUES ('usr-demo-1', 'Menik Sri Rejeki', '81373827173', 'menikbda@gmail.com', 'Jakarta', ${now}, ${now})
        ON CONFLICT (phone) DO UPDATE
        SET name = EXCLUDED.name, email = EXCLUDED.email;
      `;
    } else {
      await client`
        UPDATE users SET name = 'Menik Sri Rejeki', email = 'menikbda@gmail.com' WHERE phone = '81373827173';
      `;
    }

    // Initialize app_settings table
    await client`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;

    const scheduleRes = await client`
      SELECT key FROM app_settings WHERE key = 'session_start_time' LIMIT 1
    `;

    if (scheduleRes.length === 0) {
      await client`
        INSERT INTO app_settings (key, value, updated_at) VALUES
          ('session_start_time', '00:00:00', ${now}),
          ('session_end_time', '23:59:59', ${now}),
          ('session_auto_sync', '1', ${now})
        ON CONFLICT (key) DO NOTHING;
      `;
    }

    // Pastikan sesi lelang selalu aktif 24/7 dan room lelang berstatus ACTIVE
    await client`UPDATE app_settings SET value = '00:00:00' WHERE key = 'session_start_time'`;
    await client`UPDATE app_settings SET value = '23:59:59' WHERE key = 'session_end_time'`;
    await client`
      UPDATE auction_rooms
      SET status = 'ACTIVE', time_remaining = 36000, total_duration_seconds = 36000
      WHERE status = 'UPCOMING' OR time_remaining <= 0
    `;

    // Initialize bot_profiles table
    await client`
      CREATE TABLE IF NOT EXISTS bot_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        personality TEXT NOT NULL DEFAULT 'CASUAL',
        avatar_url TEXT,
        min_delay_sec INTEGER NOT NULL DEFAULT 2,
        max_delay_sec INTEGER NOT NULL DEFAULT 5,
        max_budget BIGINT NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `;

    // Check if initial bots exist
    const botsCount = await client`SELECT count(*) as count FROM bot_profiles`;
    const count = Number(botsCount[0]?.count || 0);

    if (count === 0) {
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
        await client`
          INSERT INTO bot_profiles (id, name, personality, min_delay_sec, max_delay_sec, max_budget, is_active, created_at, updated_at)
          VALUES (${b.id}, ${b.name}, ${b.personality}, ${b.minDelaySec}, ${b.maxDelaySec}, ${b.maxBudget}, ${b.isActive}, ${now}, ${now})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
  } catch (err) {
    console.warn("Database initialization warning (will retry on query if starting up):", err);
  }
})();
