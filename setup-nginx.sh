#!/usr/bin/env bash
set -e

echo "============================================================"
echo "🚀 KONFIGURASI OTOMATIS NGINX & SSL (BID-SIMULATOR)"
echo "============================================================"

# 1. Deteksi IP Publik Server yang digunakan oleh FASTPANEL
DETECTED_IP=$(grep -hoE "listen\s+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+):(80|443)" /etc/nginx/ 2>/dev/null | head -n 1 | cut -d: -f1 | awk '{print $2}' || true)
if [ -n "$DETECTED_IP" ]; then
    SERVER_IP="$DETECTED_IP"
else
    SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
    [ -z "$SERVER_IP" ] && SERVER_IP="72.62.127.119"
fi
echo "📍 IP Publik Server: $SERVER_IP"

# 2. Periksa Sertifikat SSL Let's Encrypt
CERT_PATH="/etc/letsencrypt/live/bidsim.labtry.my.id/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/bidsim.labtry.my.id/privkey.pem"

if [ ! -f "$CERT_PATH" ]; then
    echo "⚠️ Sertifikat belum ditemukan di $CERT_PATH, menerbitkan sertifikat Let's Encrypt..."
    mkdir -p /var/www/fastuser/data/www/bidsim.labtry.my.id/.well-known/acme-challenge
    chown -R fastuser:fastuser /var/www/fastuser/data/www/bidsim.labtry.my.id/.well-known 2>/dev/null || true
    certbot certonly --webroot -w /var/www/fastuser/data/www/bidsim.labtry.my.id -d bidsim.labtry.my.id --non-interactive --agree-tos -m andrichadhea@gmail.com --force-renewal
else
    echo "✅ Sertifikat SSL valid ditemukan: $CERT_PATH"
fi

# 3. Nonaktifkan vhost duplikat/bawaan FASTPANEL yang membajak domain ini
echo "🔍 Memeriksa konflik konfigurasi domain bidsim.labtry.my.id di /etc/nginx/..."
for conf_file in $(grep -rl "bidsim.labtry.my.id" /etc/nginx/ 2>/dev/null || true); do
    if [ "$conf_file" != "/etc/nginx/conf.d/bidsim.conf" ]; then
        echo "📦 Menonaktifkan file konflik: $conf_file -> ${conf_file}.bak"
        mv -f "$conf_file" "${conf_file}.bak"
    fi
done

# Hapus config lama bidsim.conf agar ditulis ulang secara bersih
rm -f /etc/nginx/conf.d/bidsim.conf

# 4. Tulis konfigurasi Nginx baru yang mengikat ke IP Server ($SERVER_IP)
echo "📝 Menulis konfigurasi Nginx (/etc/nginx/conf.d/bidsim.conf)..."
cat > /etc/nginx/conf.d/bidsim.conf << EOF
# 1. HTTP Port 80 (Redirect ke HTTPS & Validasi Let's Encrypt)
server {
    listen $SERVER_IP:80;
    server_name bidsim.labtry.my.id;

    location /.well-known/acme-challenge/ {
        root /var/www/fastuser/data/www/bidsim.labtry.my.id;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# 2. HTTPS Port 443 (Reverse Proxy ke Node.js Port 3030)
server {
    listen $SERVER_IP:443 ssl;
    server_name bidsim.labtry.my.id;

    ssl_certificate     $CERT_PATH;
    ssl_certificate_key $KEY_PATH;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Anti-indexing headers
    add_header X-Robots-Tag "noindex, nofollow, noarchive, nosnippet" always;

    location / {
        proxy_pass http://127.0.0.1:3030;
        proxy_http_version 1.1;

        # WebSocket Socket.IO headers
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";

        # Standard proxy headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket timeouts
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

# 5. Uji sintaks Nginx
echo "🔄 Menguji sintaks konfigurasi Nginx..."
nginx -t

# 6. Reload Nginx
echo "🚀 Mereload Nginx..."
nginx -s reload

# 7. Verifikasi
echo "============================================================"
echo "📊 HASIL VERIFIKASI AKHIR:"
echo "------------------------------------------------------------"
echo "1. Port 3030 (Aplikasi Lokal):"
curl -s -I http://127.0.0.1:3030/admin | head -n 4 || true
echo "------------------------------------------------------------"
echo "2. HTTPS Publik (bidsim.labtry.my.id):"
curl -s -Iv https://bidsim.labtry.my.id/admin 2>&1 | grep -E "(CN=|HTTP\/|< HTTP|SSL certificate)" | head -n 10 || true
echo "============================================================"
echo "🎉 SELESAI! Silakan buka di browser Anda:"
echo "👉 https://bidsim.labtry.my.id/admin"
echo "👉 https://bidsim.labtry.my.id/simulator"

