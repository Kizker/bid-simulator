#!/usr/bin/env bash
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🛑 Menghentikan server Bid Simulator..."
pkill -f "dist/server.cjs" || true
pm2 kill 2>/dev/null || true
echo "✅ Server dihentikan."
