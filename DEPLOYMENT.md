# 🚀 FlowSync AI — Linux Server Deployment Guide

> Step-by-step guide to deploy on a fresh Linux server (Ubuntu/Debian)

---

## Step 1: Connect to Your Server

```bash
ssh root@YOUR_SERVER_IP
```

---

## Step 2: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

---

## Step 3: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Start Docker and enable on boot
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker is installed
docker --version
```

---

## Step 4: Install Docker Compose

```bash
# Docker Compose is included with modern Docker, verify:
docker compose version

# If not available, install manually:
sudo apt install docker-compose-plugin -y
```

---

## Step 5: Install Git

```bash
sudo apt install git -y
```

---

## Step 6: Clone the Project

```bash
cd /opt
sudo git clone https://github.com/Ashokvp-05/Swot---Task.git flowsync
cd flowsync
```

---

## Step 7: Create Environment File

```bash
cp .env.example .env
nano .env
```

Edit the `.env` file with your settings:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE
POSTGRES_DB=flowsync_db
FRONTEND_URL=http://YOUR_SERVER_IP:3005
```

Save and exit: `Ctrl + X` → `Y` → `Enter`

---

## Step 8: Build and Start

```bash
docker compose up -d --build
```

This will:
1. ✅ Pull PostgreSQL 15 image
2. ✅ Build the backend (Express + Prisma)
3. ✅ Build the frontend (Next.js)
4. ✅ Start all 3 services

**First build takes 3-5 minutes. Wait for it to complete.**

---

## Step 9: Check Status

```bash
# Check all containers are running
docker compose ps

# You should see:
# flowsync-db        running (healthy)
# flowsync-backend   running (healthy)
# flowsync-frontend  running
```

If a container shows "unhealthy" or "restarting", check logs:

```bash
docker compose logs backend --tail=50
docker compose logs frontend --tail=50
docker compose logs db --tail=50
```

---

## Step 10: Open Firewall Ports

```bash
# Allow frontend port
sudo ufw allow 3005

# (Optional) Allow backend port for API debugging
sudo ufw allow 5001

# Enable firewall if not already enabled
sudo ufw enable
```

---

## Step 11: Access Your App

Open in browser:

```
http://YOUR_SERVER_IP:3005
```

Login with:
- **Username:** `Ashok`
- **Password:** `Swot@1234`

---

## 📋 Useful Commands

| Command | What It Does |
|---|---|
| `docker compose up -d` | Start all services |
| `docker compose down` | Stop all services |
| `docker compose restart` | Restart all services |
| `docker compose logs -f` | View live logs |
| `docker compose logs backend --tail=50` | View last 50 backend logs |
| `docker compose ps` | Check service status |
| `docker compose up -d --build` | Rebuild and restart |

---

## 🔄 How to Update (After Code Changes)

```bash
cd /opt/flowsync

# Pull latest code from GitHub
git pull origin main

# Rebuild and restart
docker compose up -d --build
```

---

## 🛑 How to Stop

```bash
cd /opt/flowsync
docker compose down
```

To stop AND delete all data (database):

```bash
docker compose down -v
```

---

## 💾 Backup Database

```bash
# Create backup
docker exec flowsync-db pg_dump -U postgres flowsync_db > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260516.sql | docker exec -i flowsync-db psql -U postgres flowsync_db
```
