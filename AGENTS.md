# AGENTS.md

Guidance for LLM coding agents (Claude Code, Codex, Copilot, etc.) working in this repository.

This file is the **single source of truth** for agent instructions. `CLAUDE.md` and `.github/copilot-instructions.md` are stubs that point here.

---

## 1. What this repo is

`smileidentity/web-client` is the SmileID web monorepo. It produces three artefacts:

| Package directory           | npm name                           | Published?            | What it is                                                                               |
| --------------------------- | ---------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- |
| `packages/web-components`   | `@smileid/web-components`          | **Yes** (npm, public) | Preact-based web component library (selfie/document/consent flows, signature pad, etc.)  |
| `packages/embed`            | `@smileid/embed`                   | No (private)          | Self-hosted iframe integration that wraps the components into ready-made product recipes |
| `packages/smart-camera-web` | `@smile_identity/smart-camera-web` | No (private)          | Legacy single-file WebRTC capture component (vanilla JS)                                 |

Top-level package `@smileid/web` is private and exists only to wire up the workspace.

All three published versions are kept in lockstep — see [Versioning](#7-versioning-and-releases).

---

## 2. Repository layout

```
.
├── packages/
│   ├── web-components/      # Preact + Vite library, the bulk of new work
│   ├── embed/               # esbuild-bundled iframe app, depends on web-components
│   └── smart-camera-web/    # legacy single-file WebRTC component
├── example/                 # demo app for exercising embed locally (needs .env)
├── previews/                # preview deployment scaffolding
├── .storybook/              # Storybook 8 config (stories live in packages/web-components)
├── scripts/
│   ├── versionConsistency.js     # CI guard: all package.json versions must match
│   ├── checkLocaleParity.js      # CI guard: locale files must share the same keys
│   ├── update.sh                 # ad-hoc bulk dep bumps via npm-check-updates
│   └── README.md
├── .github/workflows/       # CI: lint, test, release, preview deploys, semgrep
├── .github/PULL_REQUEST_TEMPLATE.md
├── CHANGELOG.md             # Keep-a-Changelog format, hand-maintained
├── CONTRIBUTING.md          # contributor + LLM-author guide
├── docs/
│   ├── README.md
│   └── archive/             # superseded notes (historical context only)
└── packages/web-components/LOCALIZATION.md   # canonical localisation guide
```

---

## 3. Toolchain (must match)

- **Node**: `v20.11.0` (pinned in `.nvmrc`). Run `nvm use` first.
- **Package manager**: npm with **workspaces**. Do not introduce yarn/pnpm.
- **Workspace globs** (from root `package.json`): `packages/web-components/*/*` and `packages/*`.
- **Bundlers**: Vite 7 (web-components), esbuild (embed), none (smart-camera-web).
- **UI framework**: Preact 10 + `preact-custom-element` in web-components. **No React.** embed and smart-camera-web are vanilla ES modules.
- **TypeScript**: only in `packages/web-components` (`.ts`/`.tsx`). The other packages are JS. There is no root `tsconfig.json`.
- **Tests**: Cypress (e2e) in every package. No Jest, no Vitest.
- **Lint/format**: ESLint (airbnb-base) per-package, Prettier 3 at the root (`.prettierrc.json` — single quotes only).

Install everything from the root: `npm install`. This hydrates all workspace packages.

---

## 4. Common commands

Always run package-specific commands from inside that package (or with `npm -w <pkg> run <script>` from the root).

### Root

```sh
npm install                            # install all workspaces
npm run storybook                      # Storybook on http://localhost:6006
npm run build-storybook                # static Storybook build
node scripts/versionConsistency.js     # CI guard — verify versions match
node scripts/checkLocaleParity.js      # CI guard — verify locale keys match
```

### `packages/web-components`

```sh
npm run dev                 # Vite dev server (port 3005)
npm run build               # builds both ESM and IIFE outputs
npm run build:esm           # ESM only
npm run build:iife          # IIFE only (cross-env BUILD_FORMAT=iife)
npm run build:stats         # produces dist/bundle-analysis.html
npm run type-check          # tsc --noEmit
npm run lint                # ESLint on .js/.ts/.tsx
npm run lint:fix
npm run lint:html           # Prettier on tracked *.html files
npm test                    # Cypress headless
```

### `packages/embed`

```sh
npm run build               # esbuild, NODE_ENV=development → ./build
npm run build:dist          # esbuild, NODE_ENV=production  → ./dist
npm start                   # build + serve ./build on :8000
npm run start:dist          # build:dist + serve ./dist on :8000
npm run lint
npm test                    # Cypress headless
```

> **Embed depends on a built `@smileid/web-components`.** The dep is `file:../web-components`, so after any change to web-components you must rebuild it before re-testing embed. CI does this automatically (`test` job order in `.github/workflows/test.yml`).

### `packages/smart-camera-web`

```sh
npm run build               # nyc instrument → cypress/pages/instrumented
npm start                   # serve cypress/pages on :8000
npm run lint                # --max-warnings=0
npm test
```

### `example/`

```sh
cp sample.env .env          # fill in PARTNER_ID, API_KEY, SID_SERVER, CALLBACK_URL
npm install
npm run dev                 # boots three servers: frontend :5173, backend :8080, embed :8000
```

Remember to rebuild embed (or its deps) when you change them — the example does not auto-rebuild upstream packages.

---

## 5. Working effectively in this codebase

### Where things live

- **New UI / capture flows / consent UI** → `packages/web-components/lib/components/`.
- **Shared domain logic** → `packages/web-components/lib/domain/`.
- **Styles** → `packages/web-components/lib/styles/` (CSS, not CSS-in-JS).
- **Translations** → `packages/web-components/locales/*.json`. See [Localisation](#6-localisation).
- **Embed product recipes / iframe HTML** → `packages/embed/src/`.
- **Stories** → colocated next to components, glob `packages/web-components/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `*.mdx`.
- **Cypress specs** → each package's `cypress/e2e/*.cy.js`.

### Things to do first when starting a task

1. `nvm use` → `npm install` from the root.
2. If touching web-components UI, `npm run dev` (or `npm run storybook` from root).
3. If touching embed end-to-end, also `npm run build` in `packages/web-components` first.
4. Before committing: `npm run lint` in any package you touched, `npx prettier --check .` from the root, and `npm run type-check` if you touched TS in web-components.

### Things to avoid

- **Do not bump versions ad-hoc.** All three publishable packages and the root must share the same version. Releases are tagged; do not edit `version` fields unless you are doing a release commit (and then keep them in sync).
- **Do not add new package managers, monorepo tools (lerna, nx, turborepo), or runtime frameworks (React, Vue, Svelte).** The stack is Preact + vanilla ESM.
- **Do not introduce new test frameworks.** Use Cypress.
- **Do not commit `example/.env`** or any real credentials.
- **Do not check in `dist/`, `build/`, `node_modules/`, or `cypress/videos/`.**
- **Do not use `--no-verify`** to bypass hooks, and do not amend or force-push merged commits.
- **Public repo:** do not paste internal hostnames, partner IDs, JIRA/Shortcut links, Slack URLs, customer data, or sample API keys into source, comments, commit messages, or PR descriptions.

---

## 6. Localisation

Strings used by web-components ship as runtime-loaded JSON in `packages/web-components/locales/`. Three locales are bundled today: `en-GB.json` (reference / fallback), `fr-FR.json`, `ar-EG.json` (RTL). The runtime helper lives in `packages/web-components/lib/i18n.js` and is exported via the `./localisation` subpath of `@smileid/web-components`.

- Use dot-notation keys (`selfie.instructions.tips.goodLight.header`).
- 3-level fallback chain: current locale → `en-GB` → raw key (logged as a console warning).
- Setting an RTL locale flips `document.documentElement` direction via the locale's `direction` field.

**Canonical guide:** [`packages/web-components/LOCALIZATION.md`](./packages/web-components/LOCALIZATION.md) — bundled languages, key reference, custom-language registration, troubleshooting.

When you add a string: add the key to **every** file in `packages/web-components/locales/`. CI enforces this via `scripts/checkLocaleParity.js` (wired into `.github/workflows/lint.yml`). Run it locally before pushing:

```sh
node scripts/checkLocaleParity.js
```

A historical implementation note from the initial rollout lives at `docs/archive/localisation-initial-rollout.md` — it is **not** load-bearing; prefer the canonical guide above.

---

## 7. Versioning and releases

- All `package.json` files must share the same `version`. `scripts/versionConsistency.js` enforces this in CI (`.github/workflows/lint.yml`).
- Releases are driven by git tags of the form `v<semver>` (see `.github/workflows/tag.yml` and `release.yml`).
- Only `@smileid/web-components` is published to npm — with provenance via OIDC (`.github/workflows/publish-web-components.yml`).
- `CHANGELOG.md` is hand-maintained in Keep-a-Changelog format. Add an entry to the `Unreleased` section when you ship a user-visible change.

**Agents should not run `npm publish`, create release tags, or push to `main` directly.** Open a PR.

---

## 8. CI overview

Workflows in `.github/workflows/`:

- `lint.yml` — Prettier check, version-consistency, dependency-version-consistency, per-package ESLint.
- `test.yml` — Builds web-components, then runs Cypress for web-components, embed (depends on web-components build), and smart-camera-web.
- `release.yml`, `publish-web-components.yml`, `tag.yml` — Tag-driven release pipeline; publishes to npm via OIDC.
- `deploy.yml`, `deploy-staging.yml`, `deploy-preview.yml`, `destroy-preview.yml`, `share-preview-url.yml` — Preview / staging / production deploys (SST-based).
- `semgrep.yml` — Static security scanning.
- `auto-author-assign.yml`, `stale.yml` — Repo hygiene.

If a CI job fails, read its log and fix the root cause locally — do not disable the job, skip the hook, or relax the version-consistency / lint rules to make CI green.

---

## 9. Commits and pull requests

- Recent history uses **Conventional Commits** with a package scope:
  - `fix(embed): …`, `feat(selfie): …`, `chore(deps): …`, `ci(release): …`, `chore: release 11.4.2`.
- Keep PR titles short (under ~70 chars). Put detail in the description.
- One logical change per PR. Don't bundle unrelated refactors.
- If you are an LLM agent making the commit, you may add a `Co-Authored-By:` trailer naming your model, but only if the human operator asks for it — recent history in this repo does not include such trailers by default.
- Do not commit generated artefacts (`dist/`, `build/`, `coverage/`, `cypress/videos/`, `cypress/screenshots/`).

---

## 10. Browser, runtime, and capture quirks

- Browser targets for web-components are in `packages/web-components/.browserslistrc`.
- Capture flows depend on **WebRTC** (camera access) and, for some MediaPipe-based features, **WebAssembly**. There are explicit fallbacks for environments where WebAssembly `reftypes` is unsupported — preserve these fallbacks when refactoring (see recent commit history for examples).
- Camera errors should be surfaced to the user, not swallowed — see `fix(selfie): surface camera errors in SmartSelfieCapture` for the established pattern.
- FingerprintJS load failures must not become unhandled promise rejections — see `fix(embed): prevent unhandled FingerprintJS load rejections`.

---

## 11. Quick map for common tasks

| You want to…                               | Start here                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Tweak a capture screen's UI/copy           | `packages/web-components/lib/components/<flow>/` + `locales/*.json`                                                                  |
| Add a new web component / subpath export   | `packages/web-components/lib/components/` + add an entry to `exports` in `packages/web-components/package.json` and the build config |
| Change how the iframe wires a product flow | `packages/embed/src/`                                                                                                                |
| Add an e2e regression test                 | `packages/<pkg>/cypress/e2e/<name>.cy.js`                                                                                            |
| View a component in isolation              | `npm run storybook` at the root                                                                                                      |
| Bump a dependency                          | Bump it in every workspace that uses it (CI's dependency-consistency check will catch mismatches)                                    |
| Add a translation key                      | Add it to **every** file in `packages/web-components/locales/`                                                                       |
| Diagnose a CI failure                      | Read the failing workflow file in `.github/workflows/` and run that step locally                                                     |

---

## 12. Notes for the agent operator

- The repository is **public** under MIT. Treat every change you write as if it will be read by external developers and partners — no internal acronyms, ticket IDs, or partner names in code/comments/messages.
- If you find behaviour that contradicts this file, the code wins — but please update this file in the same PR.
