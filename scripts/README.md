# scripts/

Repo-level helper scripts. Most are wired into CI via [`.github/workflows/lint.yml`](../.github/workflows/lint.yml). All assume the repository root as the working directory.

| Script                  | Purpose                                                                                                                                                                                                                                                                                              | Run locally                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `versionConsistency.js` | Verifies every `package.json` under `packages/` shares the same `version`. The root and all three workspaces (`@smileid/web-components`, `@smileid/embed`, `@smile_identity/smart-camera-web`) must be in lockstep — releases are tag-driven and the publish workflow refuses to ship if they drift. | `node scripts/versionConsistency.js` |
| `checkLocaleParity.js`  | Verifies that every locale file in `packages/web-components/locales/` contains the same set of translation keys as the reference locale (`en-GB.json`). Fails CI if any locale is missing keys or introduces extras.                                                                                 | `node scripts/checkLocaleParity.js`  |
| `update.sh`             | Convenience script for bumping all workspace dependencies with `npm-check-updates` (skips `eslint` and `signature_pad`). Not run in CI — intended for ad-hoc maintenance. Installs `npm-check-updates` globally if missing.                                                                          | `bash scripts/update.sh`             |

## Conventions for scripts in this directory

- Plain Node (CommonJS) or POSIX bash — no TypeScript build step.
- Exit `0` on success, non-zero on failure. Print a human-readable diff on failure so CI logs are useful.
- No external runtime dependencies — these run on a stock CI image with `npm ci` only.
- If you add a new script, also:
  1. Add a row to the table above.
  2. Add a step to the `main` job in `.github/workflows/lint.yml` if it should run in CI.
  3. Mention it in `CONTRIBUTING.md` if contributors should run it locally.
