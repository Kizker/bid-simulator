# PANDUAN RESMI DEPLOYMENT SISTEM
## BidPulse — Real-Time Live Auction Simulator & CMS Controller

Dokumen ini berisi panduan lengkap untuk setup awal, konfigurasi reverse proxy, serta prosedur pembaruan (*deploy update*) aplikasi **BidPulse Auction Simulator** pada server VPS target:

* **Sistem Operasi**: Ubuntu 24.04 LTS (Hostinger VPS KVM 1)
* **Koneksi SSH**: `ssh root@72.62.127.119`
* **Domain Publik**: `https://bidsim.labtry.my.id`
* **Direktori Server**: `/var/www/fastuser/data/www/bidsim.labtry.my.id`
* **Control Panel**: FASTPANEL
* **Port Internal**: `3030` *(Dipilih untuk menghindari bentrok dengan port 3000 yang sedang digunakan oleh container Docker `trading_app`)*
* **Repository GitHub**: `https://github.com/Kizker/bid-simulator.git` (Branch: `main`)

---

## 1. Arsitektur & Spesifikasi Server

Aplikasi dibangun dengan arsitektur modern berkinerja tinggi:
* **Frontend**: Next.js App Router (React 19) dengan desain mobile-first Bidding Plus.
* **Backend Server**: Node.js (`dist/server.cjs` atau container) dengan Socket.IO WebSocket server yang didukung Redis Pub/Sub Adapter.
* **Database & Cache**: 
  - **PostgreSQL 16**: Relational storage dengan *row-level locking* penuh (menggantikan SQLite, mengeliminasi error `SQLITE_BUSY: database is locked` secara permanen).
  - **Redis 7**: *In-memory cache* untuk state countdown timer lelang, atomic bid locking, dan sinkronisasi Socket.IO cluster.
* **Reverse Proxy**: Nginx (dikelola oleh FASTPANEL / native) dengan terminasi SSL HTTPS (Let's Encrypt) dan penerusan WebSocket (`Upgrade: websocket`).
* **Proteksi Anti-SEO**: Header HTTP `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` aktif di seluruh respons server.

---

## 2. Panduan Setup Awal (First-Time Deployment)

### Langkah 1: Hubungkan ke Server VPS via SSH
Buka terminal dan login menggunakan kredensial root:
```bash
ssh root@72.62.127.119
```

### Langkah 2: Masuk ke Direktori Situs FASTPANEL
```bash
cd /var/www/fastuser/data/www/bidsim.labtry.my.id

# Hapus file placeholder bawaan FASTPANEL jika ada
rm -f index.html
```

### Langkah 3: Clone Repository dari GitHub
```bash
git clone https://github.com/Kizker/bid-simulator.git .
```

### Langkah 4: Sesuaikan Kepemilikan Berkas (*Permissions*)
FASTPANEL menggunakan user `fastuser` untuk pengelolaan file situs:
```bash
chown -R fastuser:fastuser /var/www/fastuser/data/www/bidsim.labtry.my.id
chmod +x deploy.sh start.sh status.sh stop.sh
```

### Langkah 5: Instalasi Dependensi Node.js
Server VPS sudah memiliki Node.js v24.16.0. Pasang dependensi aplikasi:
```bash
npm install --omit=dev
```

### Langkah 6: Jalankan Server Aplikasi
Jalankan aplikasi di background pada port `3030`:
```bash
# Opsi A: Menggunakan Runner Standalone Ringan (Rekomendasi)
./start.sh

# Opsi B: Menggunakan PM2 (Jika menyukai dashboard PM2)
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Setelah server menyala, uji respons port 3030:
```bash
curl -I http://127.0.0.1:3030/admin
```
*Respons wajib menampilkan: `HTTP/1.1 200 OK`.*

---

## 3. Konfigurasi Reverse Proxy & WebSocket di FASTPANEL

Agar domain `https://bidsim.labtry.my.id` meneruskan traffic HTTP dan WebSocket ke port `3030`:

### A. Pengaturan Backend FASTPANEL
1. Buka dashboard FASTPANEL di browser: `https://72.62.127.119:8888`
2. Pilih kartu situs **`bidsim.labtry.my.id`**.
3. Masuk ke menu **Pengaturan / Settings** ➔ **Backend**.
4. Pilih **Backend type**: **`Proxy terbalik`** (*Reverse Proxy*).
5. Klik **`+ Add`** dan masukkan Address: **`http://127.0.0.1:3030`**.
6. Klik **Simpan**.

### B. Memastikan Dukungan WebSocket Nginx
Buka konfigurasi Nginx situs di FASTPANEL (atau edit berkas `/etc/nginx/fastpanel2-sites/bidsim.labtry.my.id.conf`), pastikan blok `location /` atau `location /api/socketio` memiliki konfigurasi WebSocket:
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

---

## 4. Prosedur Deploy Lanjutan (Update Kode dari GitHub)

Setiap kali Anda melakukan perubahan kode di komputer lokal dan mengunggahnya ke GitHub (`git push origin main`), perbarui server VPS dengan cara:

### Cara Cepat (1 Perintah):
```bash
ssh root@72.62.127.119 "cd /var/www/fastuser/data/www/bidsim.labtry.my.id && ./deploy.sh"
```

### Cara Manual:
```bash
ssh root@72.62.127.119
cd /var/www/fastuser/data/www/bidsim.labtry.my.id
git pull origin main
./deploy.sh
```

Script `deploy.sh` akan secara otomatis:
1. Menarik commit terbaru dari `origin/main`.
2. Memperbarui dependensi npm jika diperlukan.
3. Merestart service server di port 3030 tanpa jeda.
4. Memvalidasi respons server `HTTP 200 OK`.

---

## 5. Deployment Menggunakan Docker & Docker Compose (Sangat Direkomendasikan)

Jika VPS Anda mengaktifkan Docker, Anda dapat menjalankan seluruh ekosistem (PostgreSQL 16 + Redis 7 + Bid Simulator) dalam 1 perintah:

### A. Konfigurasi Environment File
Salin contoh environment dan sesuaikan kata sandi jika diperlukan:
```bash
cp .env.example .env
```

### B. Menjalankan Container Stack
```bash
# Build dan jalankan seluruh container (postgres, redis, app) di background
docker compose up -d --build
```
* Port internal 3030 otomatis diarahkan ke container aplikasi (port 3000) sehingga langsung terhubung dengan konfigurasi reverse proxy Nginx (`http://127.0.0.1:3030`).
* Database PostgreSQL dan Redis terisolasi di dalam network internal Docker (`bid-network`) dengan persistent volume (`postgres_data` dan `redis_data`).

### C. Inisialisasi Seed Data Lelang ke PostgreSQL (Opsional)
```bash
# Menjalankan seeding awal iPhone lot lelang ke container Postgres
docker compose exec bid-simulator pnpm seed
```

---

## 6. Tabel Perintah Cepat (*Cheat Sheet*)

| Kebutuhan | Perintah Docker di VPS | Perintah Non-Docker (Host Native) |
| :--- | :--- | :--- |
| **Cek Status Server** | `docker compose ps` | `./status.sh` atau `curl -I http://127.0.0.1:3030/admin` |
| **Lihat Log Server** | `docker compose logs -f bid-simulator` | `cat logs/out.log \| tail -n 20` |
| **Lihat Log Database** | `docker compose logs -f postgres` | - |
| **Restart Server** | `docker compose restart bid-simulator` | `./start.sh` atau `pm2 restart bid-simulator` |
| **Hentikan Seluruh Stack** | `docker compose down` | `./stop.sh` |
| **Update Aplikasi** | `git pull && docker compose up -d --build` | `./deploy.sh` |

---

## 7. URL Akses Aplikasi

* **Halaman Publik Lelang (Peserta)**: [https://bidsim.labtry.my.id/](https://bidsim.labtry.my.id/)
* **CMS Master Controller (Admin)**: [https://bidsim.labtry.my.id/admin](https://bidsim.labtry.my.id/admin)

*Dokumen panduan resmi diperbarui untuk arsitektur PostgreSQL 16 + Redis 7 di Hostinger VPS KVM 1.*
