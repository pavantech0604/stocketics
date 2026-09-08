# Stocketics Apex CRM — Backend & Database Deployment Guide

This guide explains in detail **where the database is stored**, **how it works**, and **how to host PocketBase on a separate IP address** (either on your local network or a dedicated remote cloud server).

---

## 1. Where the Backend and Database Are Stored

PocketBase uses an embedded, high-performance SQLite engine running in **WAL mode (Write-Ahead Logging)**. Unlike MySQL or Postgres, it does **not** require running a heavy background database service daemon.

Everything is stored inside your project at:
```
e:\Apex\backend\
├── pocketbase.exe          <- The standalone web server & database engine
├── start-backend.bat       <- One-click launch script
└── pb_data\                <- ALL DATABASE & USER DATA LIVES HERE
    ├── data.db             <- The primary SQLite database (tables, users, records)
    ├── data.db-wal         <- Write-Ahead Log for high-concurrency writes
    ├── data.db-shm         <- Shared memory index
    ├── auxiliary.db        <- Audit logs, request history, API query logs
    └── storage\            <- File storage (uploaded documents, client KYC, avatars)
```

### What is stored inside `data.db`?
- **Collections & Schemas**: `employees`, `leaves`, `leads`, `confirmed_payments`, `attendance`, `kyc_records`, `call_logs`.
- **User & Admin Accounts**: `admin@stocketics.com` superuser credentials and hashed passwords.
- **Application Records**: All live data created by your team.

### How to Backup or Restore:
To back up your entire database, simply copy the `pb_data\` folder to an external drive or cloud storage. That's it! To restore, paste it back into `backend\`.

---

## 2. Option A: Host on Your Local Network (LAN / Wi-Fi)

PocketBase is now configured to listen on `0.0.0.0:8090`, meaning it accepts connections on all network interfaces.

### Your Current Machine IP:
- **IPv4 Address**: `192.168.1.5`
- **Port**: `8090`
- **Dashboard**: `http://192.168.1.5:8090/_/`
- **REST API**: `http://192.168.1.5:8090/api/`

### Step 1: Open Port 8090 in Windows Firewall (Run in Admin PowerShell)
To allow other laptops or PCs on the office Wi-Fi to reach port 8090:
```powershell
New-NetFirewallRule -DisplayName "PocketBase Apex CRM" -Direction Inbound -LocalPort 8090 -Protocol TCP -Action Allow
```

### Step 2: Update Frontend `.env`
On any other computer running the frontend, update [e:\Apex\.env](file:///e:/Apex/.env):
```env
VITE_POCKETBASE_URL=http://192.168.1.5:8090
```

---

## 3. Option B: Host on a Dedicated Remote Server / Cloud VPS (Public IP)

If you have a dedicated server with a static public IP (e.g. AWS EC2, DigitalOcean, Linode, Hetzner, or On-Premise Server with IP `103.xxx.xxx.xxx`):

### Step 1: Transfer Your Database to the Server
Upload your existing `pb_data` folder from `e:\Apex\backend\pb_data\` to your remote server at `/var/www/apex-backend/pb_data`. This ensures **all your existing data, records, and admin accounts carry over completely**.

### Step 2: Download PocketBase on the Linux Server
```bash
# Create directory
mkdir -p /var/www/apex-backend && cd /var/www/apex-backend

# Download the latest Linux 64-bit binary
wget https://github.com/pocketbase/pocketbase/releases/download/v0.25.9/pocketbase_0.25.9_linux_amd64.zip

# Unzip and set execute permissions
unzip pocketbase_0.25.9_linux_amd64.zip
chmod +x pocketbase
```

### Step 3: Run as a 24/7 Background Service (`systemd`)
Create a systemd service so PocketBase automatically starts on server boot:
```bash
sudo nano /etc/systemd/system/pocketbase.service
```

Paste the following configuration:
```ini
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

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase
sudo systemctl status pocketbase
```

### Step 4: Open Port 8090 in the Linux Firewall
```bash
sudo ufw allow 8090/tcp
sudo ufw reload
```

### Step 5: Connect Apex CRM Frontend to the Dedicated IP
In your frontend `.env`:
```env
VITE_POCKETBASE_URL=http://<YOUR_SERVER_PUBLIC_IP>:8090
```
*(Replace `<YOUR_SERVER_PUBLIC_IP>` with your dedicated IP address, e.g. `http://103.21.54.12:8090`)*

---

## 4. Summary Checklist

| Task | Command / Action |
| :--- | :--- |
| **Start Backend Locally** | `npm run backend` or [`backend\start-backend.bat`](file:///e:/Apex/backend/start-backend.bat) |
| **Current LAN Endpoint** | `http://192.168.1.5:8090` |
| **Admin Dashboard** | `http://<SERVER_IP>:8090/_/` (`admin@stocketics.com` / `Stocketics@2026`) |
| **Database File** | [`backend\pb_data\data.db`](file:///e:/Apex/backend/pb_data/data.db) |
| **Backup Command** | Copy the `pb_data` directory |
