#!/usr/bin/env bash
#
# dev-mobile.sh — run the previews app + embed locally and expose both via
# Cloudflare quick tunnels (HTTPS) so they can be tested on a mobile device.
#
# Requirements:
#   - cloudflared (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
#   - The embed package built (we'll run `npm start` in packages/embed which builds + serves it)
#
# What it does:
#   1. Starts the embed dev server on http://localhost:8000
#   2. Opens a Cloudflare quick tunnel to port 8000 → public HTTPS URL
#   3. Opens a Cloudflare quick tunnel to port 5173 (Remix/Vite) → public HTTPS URL
#   4. Exports EmbedUrl=<embed tunnel URL> and runs `sst dev`
#
# Stop with Ctrl+C — all child processes are killed.

set -euo pipefail

PREVIEWS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$PREVIEWS_DIR/.." && pwd)"
EMBED_DIR="$REPO_ROOT/packages/embed"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "❌ cloudflared not found. Install it first:"
  echo "   brew install cloudflared"
  exit 1
fi

if [ ! -d "$EMBED_DIR" ]; then
  echo "❌ Embed package not found at $EMBED_DIR"
  exit 1
fi

LOG_DIR="$(mktemp -d)"
EMBED_LOG="$LOG_DIR/embed.log"
EMBED_TUNNEL_LOG="$LOG_DIR/embed-tunnel.log"
APP_TUNNEL_LOG="$LOG_DIR/app-tunnel.log"

PIDS=()
cleanup() {
  echo ""
  echo "🛑 Shutting down..."
  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  rm -rf "$LOG_DIR"
}
trap cleanup EXIT INT TERM

wait_for_tunnel_url() {
  local log_file=$1
  local label=$2
  local url=""
  for _ in $(seq 1 60); do
    url=$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$log_file" | head -1 || true)
    if [ -n "$url" ]; then
      echo "$url"
      return 0
    fi
    sleep 1
  done
  echo "❌ Timed out waiting for $label tunnel URL. Logs: $log_file" >&2
  return 1
}

echo "📦 Starting embed dev server (port 8000)..."
(cd "$EMBED_DIR" && npm start) > "$EMBED_LOG" 2>&1 &
PIDS+=($!)

echo "🌩  Opening Cloudflare tunnel for embed (port 8000)..."
cloudflared tunnel --url http://localhost:8000 --no-autoupdate > "$EMBED_TUNNEL_LOG" 2>&1 &
PIDS+=($!)

EMBED_TUNNEL_URL=$(wait_for_tunnel_url "$EMBED_TUNNEL_LOG" "embed")
echo "   Embed:  $EMBED_TUNNEL_URL"

echo "🌩  Opening Cloudflare tunnel for previews app (port 5173)..."
cloudflared tunnel --url http://localhost:5173 --no-autoupdate > "$APP_TUNNEL_LOG" 2>&1 &
PIDS+=($!)

APP_TUNNEL_URL=$(wait_for_tunnel_url "$APP_TUNNEL_LOG" "previews app")
echo "   App:    $APP_TUNNEL_URL"

# Persist URLs to a file so they're recoverable after sst dev takes over the TTY.
URLS_FILE="$PREVIEWS_DIR/.dev-mobile-urls.txt"
cat > "$URLS_FILE" <<EOF
Embed: $EMBED_TUNNEL_URL
App:   $APP_TUNNEL_URL
EOF

# Copy the app URL to the clipboard so it's easy to share to a phone.
CLIPBOARD_NOTE=""
if command -v pbcopy >/dev/null 2>&1; then
  printf '%s' "$APP_TUNNEL_URL" | pbcopy
  CLIPBOARD_NOTE=" (copied to clipboard)"
elif command -v xclip >/dev/null 2>&1; then
  printf '%s' "$APP_TUNNEL_URL" | xclip -selection clipboard
  CLIPBOARD_NOTE=" (copied to clipboard)"
elif command -v wl-copy >/dev/null 2>&1; then
  printf '%s' "$APP_TUNNEL_URL" | wl-copy
  CLIPBOARD_NOTE=" (copied to clipboard)"
fi

echo ""
echo "📱 Open this URL on your phone${CLIPBOARD_NOTE}:"
echo "   $APP_TUNNEL_URL"
echo ""

# Print a QR code for easy mobile scanning. Uses npx qrcode-terminal which
# works cross-platform without requiring a separate install (Node already
# required by this project).
if command -v npx >/dev/null 2>&1; then
  echo "📷 Scan with your phone camera:"
  npx --yes qrcode-terminal "$APP_TUNNEL_URL" 2>/dev/null || \
    echo "   (QR code generation skipped — could not run npx qrcode-terminal)"
  echo ""
fi

echo "💾 URLs saved to: $URLS_FILE"
echo "   Recover any time with:  cat $URLS_FILE"
echo ""
echo "🚀 Starting sst dev with EmbedUrl=$EMBED_TUNNEL_URL"
echo ""
sleep 3

cd "$PREVIEWS_DIR"
EmbedUrl="$EMBED_TUNNEL_URL" npx sst dev
