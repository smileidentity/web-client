// Unit tests for the pure helpers behind dev-mobile.sh.
//
// These cover the string-handling that has no business failing in front of a
// contributor: env-file parsing, port validation, and the regexes that decide
// whether an `sst dev` deploy is ready, broken, or still going. Everything that
// needs a real process, port or tunnel is deliberately out of scope — mocking
// cloudflared and sst would cost more than it protects.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS_DIR = dirname(fileURLToPath(import.meta.url));
const LIB = join(SCRIPTS_DIR, 'lib', 'dev-mobile-lib.sh');

// Run a snippet with the library sourced. Extra args land as $2, $3, … so test
// data never has to survive a round trip through shell quoting.
function sh(snippet, args = []) {
  const argv = [
    '-c',
    `set -euo pipefail; source "$1"; ${snippet}`,
    '_',
    LIB,
    ...args,
  ];
  try {
    return {
      stdout: execFileSync('bash', argv, { encoding: 'utf8' }),
      status: 0,
    };
  } catch (error) {
    return { stdout: error.stdout ?? '', status: error.status };
  }
}

// Exit status as a boolean, for the predicate helpers.
function ok(snippet, args = []) {
  return sh(snippet, args).status === 0;
}

function withTempFile(contents, run) {
  const dir = mkdtempSync(join(tmpdir(), 'dev-mobile-test-'));
  try {
    const file = join(dir, 'fixture');
    writeFileSync(file, contents);
    return run(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('sst_log_has_error ignores app log lines that merely mention an error', () => {
  // Regression: `|` binds looser than `^`, so anchoring only the first group
  // left these matching mid-line and aborting healthy deploys. `sst dev`
  // streams function logs into the very file this predicate scans.
  const healthy = [
    'INFO  lookup failed: user does not exist',
    'log: partner record does not exist, creating',
    'GET /api/token 200 - token expired token refresh ok',
    'handler: ExpiredTokenException handled gracefully downstream',
  ];
  for (const line of healthy) {
    assert.equal(
      ok('sst_log_has_error "$2"', [line]),
      false,
      `should not match: ${line}`,
    );
  }
});

test('sst_log_has_error catches genuine sst failures', () => {
  const failures = [
    '✕  Failed',
    '   ✕  Failed to deploy',
    'Error: Could not find an sst dev session',
    'ExpiredToken: The security token included in the request is expired',
    '  Error: stage does not exist',
  ];
  for (const line of failures) {
    assert.equal(
      ok('sst_log_has_error "$2"', [line]),
      true,
      `should match: ${line}`,
    );
  }
});

test('sst_log_has_error finds a failure anywhere in a multi-line log', () => {
  const log = [
    'building...',
    'uploading assets',
    '✕  Failed',
    'see above',
  ].join('\n');
  assert.equal(ok('sst_log_has_error "$2"', [log]), true);
});

test('sst_log_is_ready requires the line to end at Complete', () => {
  assert.equal(ok('sst_log_is_ready "$2"', ['|  Complete']), true);
  assert.equal(ok('sst_log_is_ready "$2"', ['Complete']), true);
  // Starting the react-router client early leaves it unbound, so a progress
  // line about copying files must not read as ready.
  assert.equal(ok('sst_log_is_ready "$2"', ['Completed 3 files']), false);
  assert.equal(ok('sst_log_is_ready "$2"', ['Incomplete']), false);
});

test('sst_log_is_ready finds the line inside a longer log', () => {
  const log = [
    'deploying',
    'PreviewApp sst:aws:React',
    '|  Complete',
    '   url: https://x',
  ].join('\n');
  assert.equal(ok('sst_log_is_ready "$2"', [log]), true);
});

test('sst_log_plain strips ANSI escapes, carriage returns and trailing space', () => {
  // A colorized, CR-redrawn "Complete" line: unnormalized it defeats the
  // end-of-line anchor that sst_log_is_ready relies on.
  const raw = 'building\rdeploying\r\x1b[32m|  Complete\x1b[0m   \n';
  withTempFile(raw, (file) => {
    const { stdout } = sh('sst_log_plain "$2"', [file]);
    assert.ok(!stdout.includes('\x1b'), 'ANSI escapes should be gone');
    assert.ok(!stdout.includes('\r'), 'carriage returns should be gone');
    assert.ok(
      stdout.split('\n').some((line) => line === '|  Complete'),
      `expected a bare "|  Complete" line, got ${JSON.stringify(stdout)}`,
    );
  });
});

test('sst_log_plain output is what makes a redrawn ready line detectable', () => {
  const raw = 'progress\r\x1b[32m|  Complete\x1b[0m  \n';
  withTempFile(raw, (file) => {
    const { stdout } = sh('sst_log_plain "$2"', [file]);
    assert.equal(ok('sst_log_is_ready "$2"', [stdout]), true);
  });
});

test('env_file_default reads plain and exported assignments', () => {
  withTempFile('EMBED_PORT=9000\n', (file) => {
    assert.equal(sh('env_file_default EMBED_PORT "$2"', [file]).stdout, '9000');
  });
  withTempFile('export APP_PORT = "5180"\n', (file) => {
    assert.equal(sh('env_file_default APP_PORT "$2"', [file]).stdout, '5180');
  });
  withTempFile("  EMBED_PORT  =  '8123'  \n", (file) => {
    assert.equal(sh('env_file_default EMBED_PORT "$2"', [file]).stdout, '8123');
  });
});

test('env_file_default takes the last assignment', () => {
  withTempFile('EMBED_PORT=8000\nEMBED_PORT=8001\n', (file) => {
    assert.equal(sh('env_file_default EMBED_PORT "$2"', [file]).stdout, '8001');
  });
});

test('env_file_default returns empty for an absent key, file or commented line', () => {
  withTempFile('APP_PORT=5173\n', (file) => {
    assert.equal(sh('env_file_default EMBED_PORT "$2"', [file]).stdout, '');
  });
  withTempFile('# EMBED_PORT=9000\n', (file) => {
    assert.equal(sh('env_file_default EMBED_PORT "$2"', [file]).stdout, '');
  });
  const missing = join(tmpdir(), 'dev-mobile-test-does-not-exist');
  assert.equal(sh('env_file_default EMBED_PORT "$2"', [missing]).stdout, '');
});

test('env_file_default does not match a key that merely shares a prefix', () => {
  withTempFile('EMBED_PORT_OLD=1234\n', (file) => {
    // A prefix hit would return "_OLD=1234" stripped to junk, which
    // is_valid_port then rejects — surfacing as a confusing failure.
    const value = sh('env_file_default EMBED_PORT "$2"', [file]).stdout;
    assert.equal(ok('is_valid_port "$2"', [value]) && value !== '', false);
  });
});

test('is_valid_port accepts digits only', () => {
  for (const good of ['8000', '5173', '0', '65535']) {
    assert.equal(
      ok('is_valid_port "$2"', [good]),
      true,
      `should accept ${good}`,
    );
  }
  for (const bad of ['abc', '80a0', '', '-1', '80.5', '8000 ']) {
    assert.equal(
      ok('is_valid_port "$2"', [bad]),
      false,
      `should reject ${JSON.stringify(bad)}`,
    );
  }
});

test('extract_tunnel_url returns the first quick-tunnel URL', () => {
  const log = [
    'INF Requesting new quick tunnel',
    '|  https://mild-tapir-quiet.trycloudflare.com                                  |',
    '|  https://second-one-here.trycloudflare.com                                   |',
  ].join('\n');
  withTempFile(log, (file) => {
    assert.equal(
      sh('extract_tunnel_url "$2"', [file]).stdout.trim(),
      'https://mild-tapir-quiet.trycloudflare.com',
    );
  });
});

test('extract_tunnel_url is quiet and successful when no URL has appeared yet', () => {
  withTempFile('INF Starting tunnel\n', (file) => {
    const { stdout, status } = sh('extract_tunnel_url "$2"', [file]);
    assert.equal(stdout.trim(), '');
    // Must not fail: the caller polls this in a loop under `set -o pipefail`,
    // so a non-zero exit before the URL lands would kill the script.
    assert.equal(status, 0);
  });
});
