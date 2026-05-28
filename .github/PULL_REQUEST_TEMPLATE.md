<!--
Thanks for the contribution! A few quick notes before you submit:

- This repo is PUBLIC. Don't paste internal hostnames, partner IDs, ticket
  links, customer data, or sample API keys anywhere in this PR.
- One logical change per PR. Open separate PRs for unrelated refactors.
- See CONTRIBUTING.md for the dev loop and AGENTS.md for the toolchain pins.
-->

## Summary

<!-- One or two sentences on what changed and why. -->

## Affected packages

<!-- Tick all that apply. Helps reviewers and CI consumers. -->

- [ ] `packages/web-components`
- [ ] `packages/embed`
- [ ] `packages/smart-camera-web`
- [ ] `example/`
- [ ] Tooling / CI / docs

## Test plan

<!--
How did you verify this works? Be specific. For UI changes, list the flows you
exercised and the browsers you tried. For bug fixes, describe how you reproduced
the bug before the fix.
-->

- [ ] `npx prettier --check .` (root)
- [ ] `npm run lint` in each touched package
- [ ] `npm run type-check` in `packages/web-components` (if TS changed)
- [ ] `npm test` in each touched package
- [ ] Manually exercised the change in the example app / Storybook (if UI)

## Changelog

<!--
For any user-visible change, add a bullet to the `Unreleased` section of
CHANGELOG.md. Paste the entry below.
-->

`Unreleased` entry:

```
-
```

## Screenshots / recordings

<!-- For UI changes. Drag-and-drop or paste a link. Strip any sensitive data. -->

## Notes for reviewers

<!--
Anything else worth flagging — risky areas, follow-ups intentionally deferred,
deps you bumped, etc.
-->

## LLM authorship (optional)

<!--
If an LLM agent wrote part or all of this PR, you can mention it here. The human
submitter is still responsible for the diff. See CONTRIBUTING.md.
-->
