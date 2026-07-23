#!/usr/bin/env bash
#
# dev-mobile.sh — run the previews app + embed locally and expose both via
# Cloudflare quick tunnels (HTTPS) so they can be tested on a mobile device.
#
# Requirements:
#   - cloudflared (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
#   - The embed package (we run `npm run build` in packages/embed, then serve its build/ output with `npx serve`)
#
# What it does:
#   1. Builds the embed and serves it on http://localhost:${EMBED_PORT:-8000}
#   2. Opens a Cloudflare quick tunnel to EMBED_PORT → public HTTPS URL
#   3. Opens a Cloudflare quick tunnel to APP_PORT (React Router/Vite) → public HTTPS URL
#   4. Exports EmbedUrl=<embed tunnel URL>, starts the `sst dev` server (mode=basic),
#      and once its dev stack is deployed, runs the previews app on APP_PORT
#      (see the "sst dev is a client/server split" note lower down for why both steps
#      are needed).
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

if command -v lsof >/dev/null 2>&1; then
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
else
  echo "⚠️  lsof not found — skipping port-in-use preflight checks."
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
SST_SERVER_LOG="$LOG_DIR/sst-server.log"

cleanup() {
  trap - EXIT INT TERM
  echo ""
  echo "🛑 Shutting down..."
  rm -rf "$LOG_DIR"
  # Kill this script's entire process group: the background jobs (cloudflared,
  # npx serve, the `sst dev` server) and all their descendants share the group
  # because the script runs without job control. Killing only the recorded PIDs
  # would leave the serve subshell's node child running. Must be the last line —
  # it also signals this shell (and the parent `npm run dev:mobile` wrapper).
  kill -- 0 2>/dev/null || true
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

echo "📦 Building embed package..."
(cd "$EMBED_DIR" && npm run build) || {
  echo "❌ embed build failed; aborting." >&2
  exit 1
}

echo "📦 Serving embed build (port $EMBED_PORT)..."
(cd "$EMBED_DIR" && npx --yes serve -p "$EMBED_PORT" build) > "$EMBED_LOG" 2>&1 &

echo "🌩  Opening Cloudflare tunnel for embed (port $EMBED_PORT)..."
cloudflared tunnel --url "http://localhost:$EMBED_PORT" --no-autoupdate > "$EMBED_TUNNEL_LOG" 2>&1 &

EMBED_TUNNEL_URL=$(wait_for_tunnel_url "$EMBED_TUNNEL_LOG" "embed")
echo "   Embed:  $EMBED_TUNNEL_URL"

echo "🌩  Opening Cloudflare tunnel for previews app (port $APP_PORT)..."
cloudflared tunnel --url "http://localhost:$APP_PORT" --no-autoupdate > "$APP_TUNNEL_LOG" 2>&1 &

APP_TUNNEL_URL=$(wait_for_tunnel_url "$APP_TUNNEL_LOG" "previews app")
echo "   App:    $APP_TUNNEL_URL"

# Persist URLs to a file so they're recoverable once the sst dev logs scroll past.
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

cd "$PREVIEWS_DIR"

# sst dev is a client/server split (see previews/README.md → "Method 1"):
#   - `sst dev --mode=basic` runs the multiplexer *server*: it deploys the dev
#     stack and hosts the linked-resource session, without taking over the TTY.
#   - `sst dev <command>` is a *client* that attaches to that server to run a
#     process (here: react-router on APP_PORT). On its own it fails with
#     "Could not find an `sst dev` session to connect to" — it never starts a
#     server itself. So we start the server, wait for its deploy to complete,
#     then run the client.
echo "🚀 Starting sst dev server (mode=basic) with EmbedUrl=$EMBED_TUNNEL_URL..."
EmbedUrl="$EMBED_TUNNEL_URL" npx sst dev --mode=basic > "$SST_SERVER_LOG" 2>&1 &

echo "   Waiting for the dev stack to finish deploying..."
sst_ready=""
for _ in $(seq 1 150); do
  # SST prints "Complete" once the dev stack is deployed and the session is
  # ready to accept client commands; starting the client before this leaves
  # react-router stuck without ever binding APP_PORT.
  if grep -qa "Complete" "$SST_SERVER_LOG" 2>/dev/null; then
    sst_ready=1
    break
  fi
  if grep -qaiE "^ *Error|✕|does not exist|expired token" "$SST_SERVER_LOG" 2>/dev/null; then
    echo "❌ sst dev server failed to start. Logs:" >&2
    cat "$SST_SERVER_LOG" >&2
    exit 1
  fi
  sleep 2
done

if [ -z "$sst_ready" ]; then
  echo "❌ Timed out waiting for the sst dev server to deploy. Logs: $SST_SERVER_LOG" >&2
  cat "$SST_SERVER_LOG" >&2
  exit 1
fi

echo "   sst dev server ready. Launching previews app on APP_PORT=$APP_PORT..."
echo ""
EmbedUrl="$EMBED_TUNNEL_URL" npx sst dev -- react-router dev --port "$APP_PORT"
