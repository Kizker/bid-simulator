#!/usr/bin/env bash
set -e

echo "📦 Memulai migrasi & seeding data local ke database live server..."

if [ ! -f "data/seed_data.sql" ]; then
    echo "❌ Error: File data/seed_data.sql tidak ditemukan!"
    exit 1
fi

# Pastikan container bid-postgres sedang berjalan
if ! docker compose ps --services --filter "status=running" | grep -q "bid-postgres"; then
    echo "⏳ Menyalakan database PostgreSQL..."
    docker compose up -d bid-postgres
    sleep 3
fi

echo "🚀 Mengimpor 336 lot lelang, user, bot, dan bids..."
docker compose exec -T bid-postgres psql -U bid_user -d bid_simulator < data/seed_data.sql

echo "🔄 Merestart container bid-simulator agar state room langsung aktif..."
docker compose restart bid-simulator

echo ""
echo "🎉 Sukses! Database berhasil dimigrasikan dan disinkronkan ke live server."
