# Contributing

Thanks for your interest in contributing to `smileidentity/web-client`. This guide is for both human and LLM contributors. Agents should also read [`AGENTS.md`](./AGENTS.md) — it has the toolchain pins, the "don'ts," and the package map.

## Prerequisites

- Node `v20.11.0` (use `nvm use` — the version is pinned in `.nvmrc`).
- npm (workspaces). Do not introduce yarn / pnpm.
- A modern Chromium-based browser for Cypress.

## First-time setup

```sh
nvm use
npm install            # hydrates all workspaces from the root
```

Optional, for the example app:

```sh
cp example/sample.env example/.env
# fill in PARTNER_ID, API_KEY, SID_SERVER, CALLBACK_URL — never commit this file
```

## Working on a change

1. Branch from `main`.
2. Make the change in the smallest applicable workspace:
   - UI components, capture flows, translations → `packages/web-components/`
   - Iframe / product recipes → `packages/embed/`
   - Legacy single-file capture → `packages/smart-camera-web/`
3. Run the dev loop:
   - `npm run storybook` from the root for isolated component work
   - `npm run dev` inside `packages/web-components/` for the package dev server (port 3005)
   - For end-to-end embed work: build `web-components` first, then `npm start` inside `packages/embed/`
4. Before pushing:
   - `npx prettier --check .` from the root
   - `npm run lint` inside any package you touched
   - `npm run type-check` inside `packages/web-components/` if you touched `.ts`/`.tsx`
   - `npm test` inside any package whose behaviour you changed
   - `node scripts/versionConsistency.js` from the root (only relevant if you touched any `package.json`)
   - `node scripts/checkLocaleParity.js` from the root if you touched `packages/web-components/locales/`

## Commit messages

Use Conventional Commits with a package scope. Recent history follows this style:

```
fix(embed): prevent unhandled FingerprintJS load rejections
feat(selfie): surface camera errors in SmartSelfieCapture
chore(deps): bump @sentry/browser
ci(release): inline web-components publish job for npm OIDC
chore: release 11.4.2
```

Keep the subject under ~70 characters. Put detail in the body.

## Pull requests

- One logical change per PR. Don't bundle unrelated refactors.
- Fill in [the PR template](.github/PULL_REQUEST_TEMPLATE.md): summary, test plan, changelog entry.
- Add a line under `Unreleased` in [`CHANGELOG.md`](./CHANGELOG.md) for any user-visible change.
- Do not bump any `package.json` `version` field in a feature PR — releases are tag-driven and all versions must stay in lockstep (see [Releases](#releases)).
- CI runs lint, version-consistency, locale-parity, semgrep, and Cypress across all three packages — these are blocking. `check-dependency-version-consistency` also runs but is currently informational only (it is wired with `|| true` and `main` has some known drifts). Fix the root cause of any failing blocking check locally — do not disable a check or use `--no-verify` to bypass hooks.

### LLM-authored PRs

If an LLM wrote part or all of the change, that's fine — but:

- The human submitter is responsible for the diff. Read it before opening the PR.
- Do not paste internal hostnames, partner IDs, ticket links, customer data, or API keys into code, comments, commit messages, or PR descriptions. **This repo is public.**
- A `Co-Authored-By:` trailer naming the model is optional. Recent history does not include it by default.

## Adding a translation key

1. Add the key to **every** file in `packages/web-components/locales/` (`en-GB.json`, `fr-FR.json`, `ar-EG.json`). `en-GB` is the fallback locale.
2. Use dot-notation keys grouped by feature (`selfie.instructions.title`, `document.capture.retry`).
3. Run `node scripts/checkLocaleParity.js` from the root — CI will fail if locales drift.
4. The user-facing guide for the i18n system is [`packages/web-components/LOCALIZATION.md`](./packages/web-components/LOCALIZATION.md).

## Adding a new web component

1. Create the component under `packages/web-components/lib/components/<name>/`.
2. If it should be importable as a subpath (`@smileid/web-components/<name>`), add an entry to:
   - `exports` in `packages/web-components/package.json`
   - the relevant Vite build inputs / dts config
3. Add a `*.stories.@(js|jsx|ts|tsx)` or `*.mdx` next to the component so it appears in Storybook.
4. Add a Cypress spec under `packages/web-components/cypress/e2e/`.

## Releases

Releases are tag-driven and handled by maintainers, not contributors.

- All `package.json` versions across the repo must share the same value. `scripts/versionConsistency.js` enforces this in CI.
- Only `@smileid/web-components` publishes to npm — with provenance via OIDC (`.github/workflows/publish-web-components.yml`).
- `CHANGELOG.md` is hand-maintained in Keep-a-Changelog format. Move entries from `Unreleased` into the new version section at release time.

## Reporting bugs / asking questions

- Bugs / feature requests: open a GitHub issue.
- Security issues: do not file a public issue. See the contact details on [usesmileid.com](https://usesmileid.com).

## Code of conduct

Be kind. Assume good faith. We follow standard open-source norms — harassment of any kind is not tolerated.
