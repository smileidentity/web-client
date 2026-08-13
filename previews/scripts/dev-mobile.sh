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
#   4. Exports EmbedUrl, starts the `sst dev` server, and runs the previews app on
#      APP_PORT (see the client/server note below the tunnels for why both steps).
#
# Stop with Ctrl+C — all child processes are killed.

set -euo pipefail

PREVIEWS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$PREVIEWS_DIR/.." && pwd)"
EMBED_DIR="$REPO_ROOT/packages/embed"
WEB_COMPONENTS_DIR="$REPO_ROOT/packages/web-components"

# Optionally read port defaults from previews/.env (gitignored).
# Only these two keys are read — the file is deliberately not sourced: sourcing
# it under `set -e` lets any line that returns non-zero abort the script with no
# diagnostic, and would export every variable in it (PATH, NODE_ENV,
# AWS_PROFILE, …) into the environment of `sst dev`.
# Explicitly exported environment variables still take precedence.
env_file_default() {
  local key=$1 file="$PREVIEWS_DIR/.env" value
  [ -f "$file" ] || return 0
  value=$(grep -E "^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*=" "$file" | tail -1 || true)
  [ -n "$value" ] || return 0
  value=${value#*=}
  # Ports carry no internal whitespace, so stripping it wholesale is safe;
  # anything left that isn't numeric is rejected by the check below.
  value=$(printf '%s' "$value" | tr -d '[:space:]')
  value=${value//\"/}
  value=${value//\'/}
  printf '%s' "$value"
}

if [ -z "${EMBED_PORT:-}" ]; then
  EMBED_PORT="$(env_file_default EMBED_PORT)"
fi
if [ -z "${APP_PORT:-}" ]; then
  APP_PORT="$(env_file_default APP_PORT)"
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

CHILD_PIDS=()

# Launch "$@" in the background in its own process group, and record it for
# cleanup. `set -m` (job control) makes the job a process-group leader, so
# cleanup can signal it *and its descendants* with `kill -- -PID` without
# signaling this shell, the parent `npm run dev:mobile`, or its siblings.
# Job control is switched back off immediately: leaving it on would put the
# final foreground command in its own group too, and bash then defers the INT
# trap until that command exits — which hangs Ctrl+C.
LAST_BG_PID=""
start_bg() {
  set -m
  "$@" &
  LAST_BG_PID=$!
  set +m
  CHILD_PIDS+=("$LAST_BG_PID")
}

cleanup() {
  local status=$?
  trap - EXIT INT TERM
  echo ""
  echo "🛑 Shutting down..."
  # Kill each background job's whole process group, so the descendants go too
  # (the serve subshell's node child, cloudflared's workers). Fall back to a
  # plain PID kill in case a job never became a group leader.
  local pid
  for pid in "${CHILD_PIDS[@]:-}"; do
    [ -n "$pid" ] || continue
    kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  rm -rf "$LOG_DIR"
  # Preserve the status we were called with: signaling our own group here would
  # report 143 to the caller on every `exit 1` error path below.
  exit "$status"
}
trap cleanup EXIT INT TERM

wait_for_tunnel_url() {
  local log_file=$1
  local label=$2
  local pid=$3
  local url=""
  for _ in $(seq 1 60); do
    # Fail fast if cloudflared died rather than waiting out the full timeout.
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "❌ cloudflared exited before publishing the $label tunnel URL. Logs:" >&2
      cat "$log_file" >&2
      return 1
    fi
    url=$(grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$log_file" | head -1 || true)
    if [ -n "$url" ]; then
      echo "$url"
      return 0
    fi
    sleep 1
  done
  # Dump the log rather than pointing at it: cleanup removes $LOG_DIR on the way
  # out, so the path in a "see $log_file" message is already gone by the time
  # anyone reads it.
  echo "❌ Timed out waiting for $label tunnel URL. Logs:" >&2
  cat "$log_file" >&2
  return 1
}

# The tunnel publishes a URL whether or not anything is listening behind it, so
# an unnoticed `npx serve` failure (offline package fetch, port taken between the
# preflight check and launch) would hand the contributor URLs that 502 on the
# device. Probe the port before going further.
wait_for_embed_server() {
  local pid=$1
  for _ in $(seq 1 30); do
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "❌ embed static server exited. Logs:" >&2
      cat "$EMBED_LOG" >&2
      return 1
    fi
    # -s: connection refused is the expected state while serve is still booting.
    if curl -sf -o /dev/null --max-time 2 "http://localhost:$EMBED_PORT/"; then
      return 0
    fi
    sleep 1
  done
  echo "❌ Timed out waiting for the embed static server on port $EMBED_PORT. Logs:" >&2
  cat "$EMBED_LOG" >&2
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
# `exec` so the recorded PID is serve itself, making the liveness check meaningful.
# Paths are passed as positional args, not interpolated into the -c string, so a
# checkout path containing spaces or quotes can't break the command.
# shellcheck disable=SC2016  # $1/$2 are the inner shell's args, by design
start_bg bash -c 'cd "$1" && exec npx --yes serve -p "$2" build >"$3" 2>&1' \
  _ "$EMBED_DIR" "$EMBED_PORT" "$EMBED_LOG"
EMBED_SERVE_PID="$LAST_BG_PID"

if command -v curl >/dev/null 2>&1; then
  wait_for_embed_server "$EMBED_SERVE_PID" || exit 1
  echo "   Embed served on http://localhost:$EMBED_PORT"
else
  echo "⚠️  curl not found — skipping the embed server readiness probe."
fi

echo "🌩  Opening Cloudflare tunnel for embed (port $EMBED_PORT)..."
# shellcheck disable=SC2016  # $1/$2 are the inner shell's args, by design
start_bg bash -c 'exec cloudflared tunnel --url "$1" --no-autoupdate >"$2" 2>&1' \
  _ "http://localhost:$EMBED_PORT" "$EMBED_TUNNEL_LOG"
EMBED_TUNNEL_PID="$LAST_BG_PID"

EMBED_TUNNEL_URL=$(wait_for_tunnel_url "$EMBED_TUNNEL_LOG" "embed" "$EMBED_TUNNEL_PID")
echo "   Embed:  $EMBED_TUNNEL_URL"

echo "🌩  Opening Cloudflare tunnel for previews app (port $APP_PORT)..."
# shellcheck disable=SC2016  # $1/$2 are the inner shell's args, by design
start_bg bash -c 'exec cloudflared tunnel --url "$1" --no-autoupdate >"$2" 2>&1' \
  _ "http://localhost:$APP_PORT" "$APP_TUNNEL_LOG"
APP_TUNNEL_PID="$LAST_BG_PID"

APP_TUNNEL_URL=$(wait_for_tunnel_url "$APP_TUNNEL_LOG" "previews app" "$APP_TUNNEL_PID")
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

# sst dev is a client/server split (see README.md → "Method 1"): --mode=basic runs
# the server (deploys the dev stack + hosts the session); `sst dev <command>` is a
# client that fails with "Could not find an sst dev session" if none is running.
# So: start the server, wait for its deploy, then run the client.
echo "🚀 Starting sst dev server (mode=basic) with EmbedUrl=$EMBED_TUNNEL_URL..."
# shellcheck disable=SC2016  # $1 is the inner shell's arg, by design
start_bg env EmbedUrl="$EMBED_TUNNEL_URL" \
  bash -c 'exec npx sst dev --mode=basic >"$1" 2>&1' _ "$SST_SERVER_LOG"
SST_SERVER_PID="$LAST_BG_PID"

# Readiness is detected by scraping the log, so normalize it first: SST colorizes
# its output and redraws progress with carriage returns even when writing to a
# pipe, which leaves ANSI escapes and overwritten lines that defeat an
# end-of-line anchor. Strip the escapes, turn CRs into newlines, drop trailing
# whitespace. (`\033` rather than `\x1b` — BSD sed on macOS doesn't grok \x.)
sst_log_plain() {
  sed -E $'s/\r/\\\n/g; s/\033\\[[0-9;]*[a-zA-Z]//g; s/[[:space:]]+$//' "$SST_SERVER_LOG" 2>/dev/null
}

echo "   Waiting for the dev stack to finish deploying..."
sst_ready=""
for _ in $(seq 1 150); do
  # Fail fast if the server process died, instead of waiting out the full timeout.
  if ! kill -0 "$SST_SERVER_PID" 2>/dev/null; then
    echo "❌ sst dev server exited before it was ready. Logs:" >&2
    cat "$SST_SERVER_LOG" >&2
    exit 1
  fi
  # Normalize once per iteration into a variable rather than piping into
  # `grep -q`: grep exits as soon as it matches, sed then takes a SIGPIPE, and
  # `set -o pipefail` would report 141 — reading a ready log as not-ready and
  # waiting out the whole timeout. `sst dev` streams function logs in here, so
  # the log does get big enough for that race to land.
  sst_log=$(sst_log_plain || true)
  # Wait for SST's "Complete" line (deploy done). The line must *end* at
  # "Complete", so "Completed 3 files" doesn't count as ready — starting the
  # client early leaves react-router unbound.
  if grep -qE '(^|[[:space:]])Complete$' <<<"$sst_log"; then
    sst_ready=1
    break
  fi
  # Match case-sensitively and only at the start of a line: `sst dev` streams
  # function logs into this file too, and an unanchored match would abort a
  # healthy deploy on any app log line that merely mentions an error.
  # Every alternative lives inside the group — `|` binds looser than the `^`
  # anchor, so hoisting any of them out would leave it matching mid-line.
  if grep -qE '^[[:space:]]*(✕|Error:|does not exist|[Ee]xpired [Tt]oken|ExpiredToken)' <<<"$sst_log"; then
    echo "❌ sst dev server failed to start. Logs:" >&2
    cat "$SST_SERVER_LOG" >&2
    exit 1
  fi
  sleep 2
done

if [ -z "$sst_ready" ]; then
  echo "❌ Timed out waiting for the sst dev server to deploy. Logs:" >&2
  cat "$SST_SERVER_LOG" >&2
  exit 1
fi

echo "   sst dev server ready. Launching previews app on APP_PORT=$APP_PORT..."
echo ""
EmbedUrl="$EMBED_TUNNEL_URL" npx sst dev -- react-router dev --port "$APP_PORT"
