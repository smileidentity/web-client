#!/usr/bin/env bash
# Pure helpers for dev-mobile.sh.
#
# These live here rather than inline so they can be unit-tested from
# previews/scripts/dev-mobile.test.mjs. dev-mobile.sh itself cannot be sourced
# for that purpose: its top-level code runs port preflight, `mktemp -d` and
# eventually a full build + tunnel + `sst dev` the moment the file is read.
#
# Everything in here must stay side-effect free — no globals read, no processes
# started, no files written. Inputs arrive as arguments; results come back on
# stdout or as an exit status. That property is what makes the tests cheap, so
# please keep new helpers to the same standard.

# Read one key's value out of an env file, without sourcing it.
#
# Sourcing is deliberately avoided: under `set -e` any line in the file that
# returns non-zero aborts the caller with no diagnostic, and it would export
# every variable in the file (PATH, NODE_ENV, AWS_PROFILE, …) into the
# environment of whatever runs next.
#
# Accepts `KEY=value` and `export KEY = "value"`, with surrounding whitespace
# and quotes. The last assignment wins. Prints nothing if the file or key is
# absent, so callers can fall back with `${VAR:-default}`.
env_file_default() {
  local key=$1 file=$2 value
  [ -f "$file" ] || return 0
  value=$(grep -E "^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*=" "$file" | tail -1 || true)
  [ -n "$value" ] || return 0
  value=${value#*=}
  # Ports carry no internal whitespace, so stripping it wholesale is safe;
  # anything left that isn't numeric is rejected by is_valid_port.
  value=$(printf '%s' "$value" | tr -d '[:space:]')
  value=${value//\"/}
  value=${value//\'/}
  printf '%s' "$value"
}

is_valid_port() {
  [[ "$1" =~ ^[0-9]+$ ]]
}

# First cloudflare quick-tunnel URL published into a log, if any.
extract_tunnel_url() {
  grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' "$1" | head -1 || true
}

# Normalize an sst log for scraping. SST colorizes its output and redraws
# progress with carriage returns even when writing to a pipe, which leaves ANSI
# escapes and overwritten lines that defeat an end-of-line anchor. Strip the
# escapes, turn CRs into newlines, drop trailing whitespace. (`\033` rather
# than `\x1b` — BSD sed on macOS doesn't grok \x.)
sst_log_plain() {
  sed -E $'s/\r/\\\n/g; s/\033\\[[0-9;]*[a-zA-Z]//g; s/[[:space:]]+$//' "$1" 2>/dev/null
}

# Deploy finished. The line must *end* at "Complete", so "Completed 3 files"
# doesn't count as ready — starting the client early leaves react-router
# unbound.
sst_log_is_ready() {
  grep -qE '(^|[[:space:]])Complete$' <<<"$1"
}

# Deploy failed. Match case-sensitively and only at the start of a line: `sst
# dev` streams function logs into the same file, so an unanchored match would
# abort a healthy deploy on any app log line that merely mentions an error.
#
# Every alternative lives inside the group — `|` binds looser than the `^`
# anchor, so hoisting any of them out would leave it matching mid-line. That is
# exactly the bug the tests for this function pin down; don't "simplify" it.
sst_log_has_error() {
  grep -qE '^[[:space:]]*(✕|Error:|does not exist|[Ee]xpired [Tt]oken|ExpiredToken)' <<<"$1"
}
