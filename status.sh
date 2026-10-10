#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🔍 Memeriksa status proses server..."
PID=$(pgrep -f "dist/server.cjs" | head -n 1)

if [ -n "$PID" ]; then
    echo "✅ Server AKTIF dengan PID: $PID"
    echo "📊 Menguji respons HTTP port 3030..."
    curl -I http://127.0.0.1:3030/admin || true
else
    echo "❌ Server TIDAK AKTIF (tidak ada proses dist/server.cjs)"
fi
