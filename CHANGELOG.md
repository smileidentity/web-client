# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2024-06-27

### Added

- Added a new versioning strategy to enforce consistency across all packages.
- Added a new CI action to publish a git tag when the version changes.
- Updated GitHub Actions:
  - Modified `lint.yml` to include a step for running `versionConsistency.js` to check version consistency.
  - Created a new `tag.yml` workflow to automate git tagging when `package.json` versions are updated.
- Introduced a `CHANGELOG.md` file to track all notable changes in the project.
- Updated README with details on the versioning strategy and the new CI action for tagging.

### Changed

- Updated all `package.json` files in the monorepo to version `1.3.0` to maintain consistency.
