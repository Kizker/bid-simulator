#!/usr/bin/env bash
set -e

echo "📦 Memulai migrasi & seeding data local ke database live server..."

if [ ! -f "data/seed_data.sql" ]; then
    echo "❌ Error: File data/seed_data.sql tidak ditemukan!"
    exit 1
fi

# 1. Pastikan container bid-postgres sedang berjalan
if ! docker ps --format '{{.Names}}' | grep -q "^bid-postgres$"; then
    echo "⏳ Menyalakan service database postgres via docker compose..."
    docker compose up -d postgres
    echo "⏳ Menunggu database PostgreSQL siap..."
    sleep 4
fi

echo "🚀 Mengimpor 336 lot lelang, user, bot, dan bids ke database PostgreSQL..."
if docker ps --format '{{.Names}}' | grep -q "^bid-postgres$"; then
    docker exec -i bid-postgres psql -U bid_user -d bid_simulator < data/seed_data.sql
else
    docker compose exec -T postgres psql -U bid_user -d bid_simulator < data/seed_data.sql
fi

echo "🔄 Merestart container bid-simulator agar state room langsung aktif..."
docker compose restart bid-simulator 2>/dev/null || true

echo ""
echo "🎉 Sukses! Database berhasil dimigrasikan dan disinkronkan ke live server."
