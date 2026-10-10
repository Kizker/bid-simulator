# PANDUAN RESMI DEPLOYMENT SISTEM
## BidPulse — Real-Time Live Auction Simulator & CMS Controller

Dokumen ini berisi panduan komprehensif untuk setup awal dan pembaruan (*deploy update*) aplikasi **BidPulse Auction Simulator** pada server hosting target:

* **Domain**: `https://simbid.labtry.my.id`
* **Koneksi SSH**: `ssh -p 65002 u141095167@46.202.138.88`
* **Direktori Server**: `~/domains/simbid.labtry.my.id/public_html`
* **Repository GitHub**: `https://github.com/Kizker/bid-simulator.git`
* **Port Internal**: `3000`

---

## 1. Arsitektur & Persiapan

Aplikasi dibangun menggunakan **Next.js App Router** dengan custom server Node.js **Socket.io** (`server.ts`) dan database **SQLite** (`@libsql/client`).
* Database tersimpan secara lokal dan persisten di `./data/simulator.db`.
* Disediakan 2 metode eksekusi:
  1. **Metode A: Docker & Docker Compose** (Rekomendasi jika VPS mendukung Docker).
  2. **Metode B: Node.js v20 & PM2** (Rekomendasi untuk Hostinger Cloud/Web Hosting cPanel).

---

## 2. Panduan Setup Awal (First-Time Setup)

### Langkah 1: Akses Server Hosting via SSH
Buka terminal dan login ke server hosting:
```bash
ssh -p 65002 u141095167@46.202.138.88
```
*(Masukkan password SSH hosting saat diminta)*

### Langkah 2: Masuk ke Folder Target Domain
```bash
cd ~/domains/simbid.labtry.my.id/public_html

# Hapus file default bawaan hosting jika ada (misal: default.php)
rm -f default.php index.html
```

### Langkah 3: Clone Source Code dari GitHub
```bash
git clone https://github.com/Kizker/bid-simulator.git .
```

### Langkah 4: Setup Environment & Folder Data
```bash
cp .env.example .env
mkdir -p data logs
```

---

## 3. Eksekusi Menjalankan Aplikasi

Pilih salah satu metode berikut sesuai lingkungan server Anda:

### PILIHAN A: Menggunakan Docker & Docker Compose
Jika Docker terpasang di server:
```bash
# Build dan jalankan container di background
docker compose up -d --build

# Periksa status container
docker compose ps

# Cek log aplikasi
docker compose logs -f
```

### PILIHAN B: Menggunakan Node.js & PM2
Jika server tidak memiliki Docker (Hostinger Cloud/Web Hosting standar):
```bash
# 1. Pastikan pnpm dan pm2 terinstal
npm install -g pnpm@12.6.0 pm2

# 2. Instal dependensi
pnpm install --frozen-lockfile

# 3. Build Next.js
pnpm build

# 4. Jalankan aplikasi via PM2
pm2 start ecosystem.config.cjs

# 5. Simpan service PM2
pm2 save
pm2 startup
```

---

## 4. Konfigurasi Reverse Proxy (.htaccess)

Agar domain `https://simbid.labtry.my.id` meneruskan traffic HTTP dan WebSocket ke port `3000`, pasang file `.htaccess`:
```bash
cp .htaccess.example .htaccess
```

Isi konfigurasi `.htaccess`:
* Meneruskan seluruh request web ke `http://127.0.0.1:3000`.
* Meneruskan protokol WebSocket (`ws://` dan `wss://`) ke port 3000.
* Memastikan header proteksi `X-Robots-Tag: noindex, nofollow` selalu aktif.

---

## 5. Prosedur Deploy Lanjutan (Update / Perbaikan Kode)

Setiap kali ada perbaikan kode yang sudah di-push ke GitHub, lakukan pembaruan di server:

### Opsi 1: Otomatis 1-Klik menggunakan `deploy.sh` (Paling Cepat)
```bash
ssh -p 65002 u141095167@46.202.138.88
cd ~/domains/simbid.labtry.my.id/public_html
./deploy.sh
```

### Opsi 2: Update Manual
* **Untuk Pengguna Docker:**
  ```bash
  git pull origin main
  docker compose build
  docker compose up -d
  ```
* **Untuk Pengguna PM2:**
  ```bash
  git pull origin main
  pnpm install
  pnpm build
  pm2 reload bid-simulator
  ```

---

## 6. Manajemen Database SQLite & Backup

* Database berada di `data/simulator.db`.
* Database **TIDAK AKAN TERHAPUS** saat melakukan update kode.
* Untuk melakukan backup berkala:
  ```bash
  cp data/simulator.db data/simulator_backup_$(date +%Y%m%d_%H%M%S).db
  ```

---

## 7. Monitoring & Troubleshooting

| Kebutuhan | Perintah Docker | Perintah PM2 |
| :--- | :--- | :--- |
| **Cek Status** | `docker compose ps` | `pm2 status` |
| **Cek Log Real-Time** | `docker compose logs -f --tail=50` | `pm2 logs bid-simulator` |
| **Restart Service** | `docker compose restart` | `pm2 restart bid-simulator` |
| **Hentikan Service** | `docker compose down` | `pm2 stop bid-simulator` |

---

*Panduan ini dibuat secara resmi untuk deployment `simbid.labtry.my.id`.*
