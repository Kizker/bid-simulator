#!/usr/bin/env bash
set -e

echo "🔍 1. Memeriksa sertifikat SSL yang terpasang di server..."
certbot certificates

CERT_PATH="/etc/letsencrypt/live/bidsim.labtry.my.id/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/bidsim.labtry.my.id/privkey.pem"

if [ ! -f "$CERT_PATH" ]; then
    echo "⚠️ Sertifikat belum ditemukan di $CERT_PATH, membuat sertifikat baru..."
    mkdir -p /var/www/fastuser/data/www/bidsim.labtry.my.id/.well-known/acme-challenge
    chown -R fastuser:fastuser /var/www/fastuser/data/www/bidsim.labtry.my.id/.well-known
    certbot certonly --webroot -w /var/www/fastuser/data/www/bidsim.labtry.my.id -d bidsim.labtry.my.id --non-interactive --agree-tos -m andrichadhea@gmail.com --force-renewal
fi

echo "📝 2. Menulis konfigurasi Nginx (/etc/nginx/conf.d/bidsim.conf)..."
cat > /etc/nginx/conf.d/bidsim.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name bidsim.labtry.my.id;

    location /.well-known/acme-challenge/ {
        root /var/www/fastuser/data/www/bidsim.labtry.my.id;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name bidsim.labtry.my.id;

    ssl_certificate     /etc/letsencrypt/live/bidsim.labtry.my.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bidsim.labtry.my.id/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "🔄 3. Menguji dan mereload Nginx..."
nginx -t
nginx -s reload

echo "🎉 4. Konfigurasi selesai! Menguji respons lokal port 3030..."
curl -I http://127.0.0.1:3030/admin || true
