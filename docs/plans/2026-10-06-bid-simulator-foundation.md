# Bid Simulator & CMS Controller Implementation Plan

> **For Claude / Antigravity:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membangun aplikasi Web Bid Simulator interaktif dengan tampilan Mobile-First untuk peserta lelang, didampingi CMS Admin Controller untuk mengontrol sesi, parameter lelang, dan bot simulasi secara real-time.

**Architecture:** Arsitektur fullstack menggunakan Next.js 15 App Router yang terintegrasi dengan custom Node.js server (`server.ts`) membawa Socket.io untuk transmisi event real-time (<100ms latency) dan in-memory `SimulationEngine`. Database lokal berbasis SQLite dikelola menggunakan Drizzle ORM (`better-sqlite3`) untuk persistensi skenario, item, dan riwayat penawaran.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Lucide Icons, Socket.io & Socket.io-client, Drizzle ORM + better-sqlite3, Web Audio API (native synth sound effects), Framer Motion / CSS Transitions.

---

### Task 1: Project Scaffolding & macOS Environment Hygiene

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` (via `create-next-app`)
- Create: `.gitignore` (with macOS and SQLite hygiene)

**Step 1: Inisialisasi Next.js 15 App Router dengan TypeScript & Tailwind**
Run: `npx -y create-next-app@latest ./ --ts --tailwind --app --src-dir --import-alias "@/*" --use-pnpm --yes`

**Step 2: Konfigurasi macOS Git Hygiene**
Pastikan `.gitignore` memiliki entri khusus file sampah macOS (`.DS_Store`, `AppleDouble`, `*.swp`) dan database SQLite (`*.db`, `*.db-journal`, `*.db-wal`).

**Step 3: Instalasi Dependensi Inti**
Run: `pnpm add socket.io socket.io-client drizzle-orm better-sqlite3 lucide-react clsx tailwind-merge canvas-confetti`
Run: `pnpm add -D @types/better-sqlite3 @types/canvas-confetti drizzle-kit tsx cross-env`

**Step 4: Verifikasi instalasi**
Run: `pnpm build` untuk memastikan template dasar bebas error.

---

### Task 2: Database Schema & SQLite Persistence (Drizzle ORM)

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/index.ts`
- Create: `drizzle.config.ts`
- Create: `src/db/seed.ts`

**Step 1: Buat Skema Tabel Database**
Definisikan tabel:
- `auction_rooms`: ID, title, description, image_url, starting_price, current_price, bid_increment, reserve_price, status (`DRAFT`, `UPCOMING`, `ACTIVE`, `PAUSED`, `ENDED`), duration_seconds, time_remaining, anti_sniping_seconds.
- `bids`: ID, room_id, bidder_name, bidder_type (`USER`, `BOT`), amount, created_at, status (`VALID`, `OUTBID`, `WINNING`).
- `simulation_configs`: ID, room_id, bot_count, bot_aggressiveness (`LOW`, `MEDIUM`, `HIGH`), bot_sniping_enabled, auto_start.

**Step 2: Inisialisasi Koneksi SQLite dengan Drizzle**
Buat singleton database client di `src/db/index.ts` menggunakan file lokal `data/simulator.db`.

**Step 3: Script Seeding Data Awal**
Buat data lelang simulasi:
- Item 1: *Rolex Submariner Date 41mm* (Luxury Watch)
- Item 2: *Air Jordan 1 Retro High Chicago 1985* (Rare Collectible)
- Item 3: *Vespa Primavera 1976 Vintage* (Classic Vehicle)

Run: `npx tsx src/db/seed.ts` untuk mengisi database awal.

---

### Task 3: Simulation Engine & Realtime Server (Socket.io)

**Files:**
- Create: `src/server/engine.ts`
- Create: `src/server/socket.ts`
- Create: `server.ts`
- Modify: `package.json` (update `scripts.dev` dan `scripts.start`)

**Step 1: Buat Core Simulation Engine (`src/server/engine.ts`)**
- Tick timer interval (1000ms loop).
- Aturan Anti-Sniping: jika bid masuk di bawah 10 detik terakhir, otomatis tambah durasi +15 detik.
- Logika Bot AI Bidder:
  - Profil Agresif: Menawar balik dalam 1-3 detik setelah user menawar.
  - Profil Konservatif: Menawar bertahap dengan kelipatan minimum.
  - Profil Sniper: Menunggu detik ke 3-5 sebelum durasi habis.
- Concurrency Safe Bid Handler: Memvalidasi penawaran harus lebih tinggi dari `current_price + bid_increment`.

**Step 2: Integrasikan Socket.io Server (`server.ts`)**
- Pasang HTTP Server yang menggabungkan Next.js request handler dan Socket.io.
- Event:
  - `join_room`: Sinkronisasi state room saat ini ke client baru.
  - `place_bid`: Menerima penawaran dari user / bot.
  - `admin_command`: Kontrol CMS (Start, Pause, Reset, Add Time, Trigger Bot Bid, Update Settings).
  - Broadcast `room_update`, `bid_added`, `outbid_alert`, `auction_ended`.

---

### Task 4: Mobile-First Bid Simulator UI (`/` dan `/simulator`)

**Files:**
- Create: `src/components/simulator/MobileFrame.tsx`
- Create: `src/components/simulator/AuctionHeader.tsx`
- Create: `src/components/simulator/ItemShowcase.tsx`
- Create: `src/components/simulator/LiveBidTicker.tsx`
- Create: `src/components/simulator/StickyBidControls.tsx`
- Create: `src/components/simulator/WinningModal.tsx`
- Create: `src/lib/audio.ts` (Web Audio API synth synthesizer)
- Create: `src/app/page.tsx` (redirect / entry point)
- Create: `src/app/simulator/page.tsx`

**Step 1: Desain Mobile Viewport & Desktop Frame**
- Di desktop: Ditampilkan di dalam frame smartphone modern (iPhone style) dengan dynamic island, status bar, dan toggle "Full Screen Mobile View".
- Di smartphone: Otomatis mengisi 100% tinggi layar (*100dvh*, no-scroll body, native app touch feel).

**Step 2: Visual & Sound Experience**
- Palet Gelap Premium: Obsidian background (`#0b0f19`), Gold accent (`#f59e0b`), Emerald (`#10b981`), Crimson neon (`#ef4444`).
- Web Audio API FX: Sound tick hitung mundur (beep pendek), bid masuk (ding), outbid (double pulse warning), menang (chime gong).
- Animated Number Ticker untuk kenaikan harga.

**Step 3: Sticky Bottom Bidding Bar**
- Tombol quick bid: `+Kelipatan`, `+2x`, `+5x`.
- Tombol CTA utama besar dengan haptic visual effect.

---

### Task 5: CMS Simulation Controller (`/admin`)

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/components/admin/RoomList.tsx`
- Create: `src/components/admin/LiveControlPanel.tsx`
- Create: `src/components/admin/BidHistoryAudit.tsx`
- Create: `src/components/admin/BotConfigModal.tsx`
- Create: `src/app/api/admin/rooms/route.ts`

**Step 1: Dashboard Navigation & Metrics Overview**
- Ringkasan statistik: Total Lelang, Active Room, Total Bid Diterima, Highest Price Achieved.

**Step 2: Live Room Controller**
- Tombol Aksi Cepat: `[START]`, `[PAUSE]`, `[RESET]`, `[+30s EXTEND]`, `[FORCE BOT BID]`, `[END NOW]`.
- Slider Agresivitas Bot (Low / Medium / High / Chaos).
- Toggle Auto-Bot on/off.

**Step 3: Real-Time Audit Log & Bid Stream**
- Tabel histori penawaran per detik yang ter-update via socket secara live dengan badge status penawar (User vs Bot).

---

### Task 6: Testing, Polish & Verifikasi Terintegrasi

**Files:**
- Test scripts & verifikasi browser

**Step 1: Pengujian End-to-End**
- Buka `/admin` di satu tab browser dan `/simulator` di tab lain.
- Trigger Start dari CMS -> Verifikasi countdown berjalan serempak di simulator.
- Lakukan bid dari simulator -> Verifikasi bid masuk ke CMS dan bot memberikan respons penawaran balik.
- Uji skenario detik terakhir -> Verifikasi anti-sniping memperpanjang waktu secara otomatis.
