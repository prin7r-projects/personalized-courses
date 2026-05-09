#!/bin/bash
# Curriculum7 deploy script for storage-contabo
# Run from /opt/prin7r-deploys/personalized-courses

set -euo pipefail

echo "=== Curriculum7 Deploy ==="
echo ""

# 1. Pull latest code
echo "[1/5] Pulling latest code..."
git pull origin main

# 2. Check .env exists
if [ ! -f .env ]; then
  echo ""
  echo "ERROR: .env file not found."
  echo "  cp .env.example .env"
  echo "  Edit .env and fill in:"
  echo "    - NOWPAYMENTS_API_KEY (from /Users/keer/.nth-kir-keys.env)"
  echo "    - NOWPAYMENTS_IPN_SECRET"
  echo "    - AUTH_SECRET (generate: openssl rand -hex 32)"
  echo "    - POSTMARK_SERVER_TOKEN"
  echo "    - ANTHROPIC_API_KEY"
  echo "    - POSTGRES_PASSWORD (change default!)"
  exit 1
fi

# 3. Generate AUTH_SECRET if not set
if ! grep -q "^AUTH_SECRET=.\+" .env 2>/dev/null; then
  echo "[2/5] Generating AUTH_SECRET..."
  echo "AUTH_SECRET=$(openssl rand -hex 32)" >> .env
else
  echo "[2/5] AUTH_SECRET already set"
fi

# 4. Build images
echo "[3/5] Building Docker images..."
docker compose build --pull

# 5. Run database migrations (after container is up)
echo "[4/5] Starting services..."
docker compose up -d postgres
sleep 3

echo "[5/5] Starting app + landing..."
docker compose up -d

echo ""
echo "=== Deploy complete ==="
echo ""
echo "Verify:"
echo "  curl -sI https://personalized-courses.prin7r.com/       | head -1"
echo "  curl -sI https://personalized-courses.prin7r.com/app    | head -1"
echo "  curl -s  https://personalized-courses.prin7r.com/app/api/healthz"
echo ""
echo "Logs:"
echo "  docker compose logs -f app"
echo "  docker compose logs -f landing"
