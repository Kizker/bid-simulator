#!/usr/bin/env bash
# =========================================================================
# Automatic Deployment Script for BidPulse Live Auction Simulator
# Server: simbid.labtry.my.id
# =========================================================================

set -e

echo "🚀 [Deploy] Memulai proses deployment BidPulse Simulator..."

# 1. Pastikan branch main terupdate
echo "📥 [Deploy] Mengambil update source code dari GitHub..."
git fetch origin main
git reset --hard origin/main

# 2. Cek apakah Docker Compose tersedia
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    echo "🐳 [Deploy] Menggunakan Docker Compose..."
    docker compose down || true
    docker compose build --no-cache
    docker compose up -d
    echo "✅ [Deploy] Container Docker berhasil dijalankan di background!"
    docker compose ps
else
    echo "⚡ [Deploy] Docker tidak terdeteksi. Menggunakan Node.js native..."
    
    # Enable pnpm jika belum ada
    if ! command -v pnpm &> /dev/null; then
        npm install -g pnpm@12.6.0
    fi

    echo "📦 [Deploy] Menginstal dependencies..."
    pnpm install --frozen-lockfile

    echo "🔨 [Deploy] Melakukan build production..."
    pnpm build

    # Restart via PM2 jika ada, atau fallback
    if command -v pm2 &> /dev/null; then
        echo "🔄 [Deploy] Merestart service via PM2..."
        pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
        pm2 save
    else
        echo "⚠️ [Deploy] PM2 belum terinstal. Menjalankan via nohup..."
        pkill -f "tsx server.ts" || true
        nohup pnpm start > app.log 2>&1 &
    fi
    echo "✅ [Deploy] Aplikasi Node.js berhasil diperbarui dan berjalan!"
fi

echo "========================================================"
echo "🎉 Deployment selesai untuk: https://simbid.labtry.my.id"
echo "========================================================"
