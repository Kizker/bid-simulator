#!/usr/bin/env bash
# =========================================================================
# Automatic Deployment Script for BidPulse Live Auction Simulator
# Server VPS: bidsim.labtry.my.id (72.62.127.119)
# Path: /var/www/fastuser/data/www/bidsim.labtry.my.id
# Port: 3030
# =========================================================================

set -e

echo "🚀 [Deploy] Memulai proses deployment BidPulse Simulator di VPS..."

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# 1. Update source code dari GitHub
echo "📥 [Deploy] Mengambil update source code dari GitHub..."
git fetch origin main
git reset --hard origin/main

# 2. Setup permissions untuk FASTPANEL user jika tersedia
if id "fastuser" &>/dev/null; then
    chown -R fastuser:fastuser "$DIR"
fi

# 3. Pastikan folder data dan logs tersedia
mkdir -p data logs

# 4. Install dependencies jika ada perubahan
echo "📦 [Deploy] Memeriksa dan menginstal dependencies..."
npm install --omit=dev

# 5. Restart service via PM2 jika tersedia, atau runner start.sh
if command -v pm2 &> /dev/null; then
    echo "🔄 [Deploy] Merestart service via PM2..."
    pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
    pm2 save
elif [ -f "./start.sh" ]; then
    echo "🔄 [Deploy] Menjalankan server via start.sh..."
    ./start.sh
else
    echo "⚠️ [Deploy] Menjalankan di background dengan nohup..."
    pkill -f "dist/server.cjs" || true
    nohup env NODE_ENV=production PORT=3030 node dist/server.cjs > logs/out.log 2> logs/err.log &
fi

echo "⏳ Menunggu inisialisasi server..."
sleep 2

# 6. Uji kesehatan server lokal
echo "🔍 [Deploy] Menguji respons server lokal (port 3030)..."
curl -I http://127.0.0.1:3030/admin || true

echo "========================================================"
echo "🎉 Deployment selesai untuk: https://bidsim.labtry.my.id"
echo "========================================================"
