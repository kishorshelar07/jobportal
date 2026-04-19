#!/usr/bin/env bash
# ─── JobPortal Quick Start Script ────────────────────────────────────
set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🚀 JobPortal — Quick Start              ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required. Install from https://nodejs.org"
  exit 1
fi

NODE_VER=$(node -v | cut -c2- | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo "❌ Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

# Check MongoDB
if ! command -v mongod &> /dev/null && ! mongosh --eval "db.runCommand({ping:1})" --quiet &> /dev/null 2>&1; then
  echo "⚠️  MongoDB not detected locally. Make sure MONGODB_URI in backend/.env points to a running instance."
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install --silent

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install --silent
cd ..

# Setup .env if missing
if [ ! -f backend/.env ]; then
  echo "⚙️  Creating backend/.env from .env.example..."
  cp backend/.env.example backend/.env
  echo "   → Please edit backend/.env with your MongoDB URI and SMTP credentials"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Choose an option:"
echo "  1) Start development servers (backend + frontend)"
echo "  2) Seed the database with demo data first, then start"
echo "  3) Seed only (don't start servers)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -rp "Enter choice [1/2/3]: " choice

seed() {
  echo ""
  echo "🌱 Seeding database..."
  cd backend
  node src/seed.js
  cd ..
  echo ""
}

start() {
  echo ""
  echo "✅ Starting servers..."
  echo "   Backend  → http://localhost:5000"
  echo "   Frontend → http://localhost:5173"
  echo ""
  # Start backend in background
  (cd backend && npm run dev &)
  BACKEND_PID=$!
  sleep 2
  # Start frontend
  (cd frontend && npm run dev)
}

case $choice in
  1) start ;;
  2) seed; start ;;
  3) seed ;;
  *) echo "Invalid choice. Run manually: cd backend && npm run dev"; exit 1 ;;
esac
