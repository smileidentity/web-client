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
#   1. Starts the embed dev server on http://localhost:${EMBED_PORT:-8000}
#   2. Opens a Cloudflare quick tunnel to EMBED_PORT → public HTTPS URL
#   3. Opens a Cloudflare quick tunnel to APP_PORT (Remix/Vite) → public HTTPS URL
#   4. Exports EmbedUrl=<embed tunnel URL> and runs `sst dev`
#
# Stop with Ctrl+C — all child processes are killed.

set -euo pipefail

PREVIEWS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$PREVIEWS_DIR/.." && pwd)"
EMBED_DIR="$REPO_ROOT/packages/embed"
WEB_COMPONENTS_DIR="$REPO_ROOT/packages/web-components"

# Optionally load local defaults from previews/.env.
# Explicitly exported environment variables still take precedence.
if [ -f "$PREVIEWS_DIR/.env" ]; then
  if [ "${EMBED_PORT+x}" = "x" ]; then
    EMBED_PORT_OVERRIDE="$EMBED_PORT"
  fi
  if [ "${APP_PORT+x}" = "x" ]; then
    APP_PORT_OVERRIDE="$APP_PORT"
  fi

  set -a
  # shellcheck disable=SC1091
  . "$PREVIEWS_DIR/.env"
  set +a

  if [ "${EMBED_PORT_OVERRIDE+x}" = "x" ]; then
    EMBED_PORT="$EMBED_PORT_OVERRIDE"
  fi
  if [ "${APP_PORT_OVERRIDE+x}" = "x" ]; then
    APP_PORT="$APP_PORT_OVERRIDE"
  fi
fi

EMBED_PORT="${EMBED_PORT:-8000}"
APP_PORT="${APP_PORT:-5173}"

if ! [[ "$EMBED_PORT" =~ ^[0-9]+$ ]] || ! [[ "$APP_PORT" =~ ^[0-9]+$ ]]; then
  echo "❌ EMBED_PORT and APP_PORT must be numeric."
  echo "   Example: EMBED_PORT=8001 APP_PORT=5174 npm run dev:mobile"
  exit 1
fi

is_port_in_use() {
  lsof -n -P -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

if is_port_in_use "$EMBED_PORT"; then
  echo "❌ EMBED_PORT $EMBED_PORT is already in use."
  echo "   Retry with a different port, for example: EMBED_PORT=8001 npm run dev:mobile"
  exit 1
fi

if is_port_in_use "$APP_PORT"; then
  echo "❌ APP_PORT $APP_PORT is already in use."
  echo "   Retry with a different port, for example: APP_PORT=5174 npm run dev:mobile"
  exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "❌ cloudflared not found. Install it first:"
  echo "   brew install cloudflared"
  exit 1
fi

if [ ! -d "$EMBED_DIR" ]; then
  echo "❌ Embed package not found at $EMBED_DIR"
  exit 1
fi

if [ ! -d "$WEB_COMPONENTS_DIR" ]; then
  echo "❌ web-components package not found at $WEB_COMPONENTS_DIR"
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

echo "📦 Building @smileid/web-components (embed depends on its dist/ output)..."
# Workspace deps live at $REPO_ROOT/node_modules; only run an install if the
# root install hasn't happened yet. Stream build output to the terminal so
# failures are immediately visible.
# SMILE_DEBUG_BUILD=true compiles the document-capture debug tooling (TuningPanel
# / ROI overlay) into this local build — same flag the preview deploy sets — so
# the embed shown via the tunnel has the debug panel. Production builds omit it.
(
  cd "$REPO_ROOT"
  if [ ! -d node_modules ]; then
    npm ci
  fi
  SMILE_DEBUG_BUILD=true npm run build --workspace=@smileid/web-components
) || {
  echo "❌ web-components build failed; aborting." >&2
  exit 1
}

echo "📦 Starting embed dev server (port $EMBED_PORT)..."
(cd "$EMBED_DIR" && npm run build && npx serve -p "$EMBED_PORT" build) > "$EMBED_LOG" 2>&1 &
PIDS+=($!)

echo "🌩  Opening Cloudflare tunnel for embed (port $EMBED_PORT)..."
cloudflared tunnel --url "http://localhost:$EMBED_PORT" --no-autoupdate > "$EMBED_TUNNEL_LOG" 2>&1 &
PIDS+=($!)

EMBED_TUNNEL_URL=$(wait_for_tunnel_url "$EMBED_TUNNEL_LOG" "embed")
echo "   Embed:  $EMBED_TUNNEL_URL"

echo "🌩  Opening Cloudflare tunnel for previews app (port $APP_PORT)..."
cloudflared tunnel --url "http://localhost:$APP_PORT" --no-autoupdate > "$APP_TUNNEL_LOG" 2>&1 &
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
echo "🚀 Starting sst dev with EmbedUrl=$EMBED_TUNNEL_URL on APP_PORT=$APP_PORT"
echo ""
sleep 3

cd "$PREVIEWS_DIR"
EmbedUrl="$EMBED_TUNNEL_URL" npx sst dev remix vite:dev -- --port "$APP_PORT"
