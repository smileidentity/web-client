# GitHub Copilot Instructions

This repository uses a single agent-instruction file for all LLM coding agents
(Claude Code, Codex, Copilot, etc.).

**See [`AGENTS.md`](../AGENTS.md) at the repository root.**

Highlights for Copilot:

- Node `v20.11.0` (see `.nvmrc`); npm workspaces; do not introduce yarn/pnpm/lerna.
- UI framework is **Preact** in `packages/web-components`. Do not introduce React.
- Tests are **Cypress** (e2e) in each package. Do not introduce Jest/Vitest.
- Prettier 3 (single quotes), ESLint airbnb-base per package, TypeScript only inside `packages/web-components`.
- All `package.json` versions must stay in lockstep — `scripts/versionConsistency.js` enforces this in CI.
- Public repo: never echo internal hostnames, partner IDs, ticket links, or sample credentials into code or commit messages.

For everything else — directory layout, commands, release flow, localisation — read `AGENTS.md`.
