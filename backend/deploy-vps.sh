#!/bin/bash
# ==============================================================================
# Stocketics Apex CRM — 1-Click PocketBase VPS Installer (Ubuntu / Debian Linux)
# ==============================================================================
set -e

APP_DIR="/var/www/apex-backend"
PB_VERSION="0.25.9"

echo "=== 1. Installing Prerequisites ==="
sudo apt-get update -y
sudo apt-get install -y unzip curl ufw

echo "=== 2. Creating Application Directory ==="
sudo mkdir -p "$APP_DIR/pb_data"
cd "$APP_DIR"

echo "=== 3. Downloading PocketBase v${PB_VERSION} for Linux ==="
sudo curl -sL "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -o pb.zip
sudo unzip -o pb.zip
sudo rm -f pb.zip
sudo chmod +x pocketbase

echo "=== 4. Extracting Database Data ==="
if [ -f "/tmp/pb_data_export.zip" ]; then
    echo "Found /tmp/pb_data_export.zip. Unpacking into pb_data..."
    sudo unzip -o /tmp/pb_data_export.zip -d "$APP_DIR/pb_data"
elif [ -f "$APP_DIR/pb_data_export.zip" ]; then
    echo "Found $APP_DIR/pb_data_export.zip. Unpacking into pb_data..."
    sudo unzip -o "$APP_DIR/pb_data_export.zip" -d "$APP_DIR/pb_data"
else
    echo "Note: No pb_data_export.zip found in /tmp. Starting with clean/existing database."
fi

# Ensure correct permissions
sudo chown -R root:root "$APP_DIR"
sudo chmod -R 755 "$APP_DIR"

echo "=== 5. Setting up Systemd Service (Auto-restart 24/7) ==="
cat << 'EOF' | sudo tee /etc/systemd/system/pocketbase.service > /dev/null
[Unit]
Description=PocketBase Apex CRM Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/apex-backend
ExecStart=/var/www/apex-backend/pocketbase serve --http=0.0.0.0:8090
Restart=always
RestartSec=5s
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

echo "=== 6. Configuring Firewall for Port 8090 ==="
sudo ufw allow 8090/tcp || true

echo "=== 7. Starting PocketBase Service ==="
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase
sudo systemctl restart pocketbase

SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo ""
echo "=================================================================="
echo "  POCKETBASE APEX CRM IS NOW LIVE ON YOUR SERVER!"
echo "=================================================================="
echo "  REST API:   http://${SERVER_IP}:8090/api/"
echo "  Dashboard:  http://${SERVER_IP}:8090/_/"
echo "  Login:      admin@stocketics.com / Stocketics@2026"
echo "=================================================================="
echo "Now update your local Apex CRM .env file with:"
echo "VITE_POCKETBASE_URL=http://${SERVER_IP}:8090"
echo "=================================================================="
