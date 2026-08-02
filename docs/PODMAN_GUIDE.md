# Podman Container Deployment Guide

Nucleus is fully optimized for **Podman** (Pod Manager), providing daemonless, rootless container execution with enhanced enterprise security.

---

## 🚀 Running Nucleus with Podman Compose

### 1. Prerequisites
Ensure `podman` and `podman-compose` are installed on your host system:

```bash
# RHEL / Fedora / CentOS
sudo dnf install -y podman podman-compose

# macOS (via Homebrew)
brew install podman podman-compose
podman machine init
podman machine start
```

---

### 2. Build & Launch Containers

Spin up the entire Data Plane stack (PostgreSQL + pgvector, Redis, Data Plane Gateway, Control Plane):

```bash
podman-compose up --build -d
```

### 3. Verify Container Status

```bash
podman ps
```

Expected running containers:
- `nucleus_data_plane`: Port 8000
- `nucleus_control_plane`: Port 8001
- `nucleus_postgres`: Port 5432
- `nucleus_redis`: Port 6379

---

### 4. Interactive Web Search Portal

Open your web browser and navigate to:
```text
http://localhost:8000/portal
```

---

## 🛠️ Rootless Podman Pod Execution (Alternative)

To deploy as a native rootless Podman Pod:

```bash
# Create Podman pod
podman pod create --name nucleus-pod -p 8000:8000 -p 8001:8001 -p 5432:5432

# Run Postgres pgvector container in pod
podman run -d --pod nucleus-pod --name nucleus_postgres \
  -e POSTGRES_USER=nucleus \
  -e POSTGRES_PASSWORD=nucleus_secret \
  -e POSTGRES_DB=nucleus_db \
  docker.io/pgvector/pgvector:pg16

# Run Data Plane API in pod
podman run -d --pod nucleus-pod --name nucleus_data_plane \
  -e DATABASE_URL=postgresql+asyncpg://nucleus:nucleus_secret@127.0.0.1:5432/nucleus_db \
  Containerfile.api
```
