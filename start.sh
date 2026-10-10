#!/usr/bin/env bash
# =========================================================================
# Ultra-lightweight runner for Shared Hosting (CloudLinux / cPanel)
# Menghindari overhead PM2 daemon dan limit nproc (Resource temporarily unavailable)
# =========================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🛑 Menghentikan proses server lama jika ada..."
pkill -f "dist/server.cjs" || true
sleep 1

mkdir -p "$DIR/logs"

echo "🚀 Menyalakan Bid Simulator di background (Single-process, UV_THREADPOOL=1)..."
nohup env NODE_ENV=production PORT=3000 UV_THREADPOOL_SIZE=1 node dist/server.cjs > "$DIR/logs/out.log" 2> "$DIR/logs/err.log" &
SERVER_PID=$!

echo "✅ Server berjalan dengan PID: $SERVER_PID"
echo "⏳ Menunggu 2 detik untuk inisialisasi..."
sleep 2

echo "🔍 Memeriksa koneksi server..."
curl -I http://127.0.0.1:3000/admin || true
