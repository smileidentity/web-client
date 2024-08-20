# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added new designs to smart selfie authentication

## [1.3.8] - 2024-08-15

### Changed

- Updated the button in id types selection screen to use the theme color provided

## [1.3.7] - 2024-08-14

### Changed

- Improved document capture UI - margin and capture review improvement
- When `theme_color` is provided, it will now be used to style header texts and buttons
- Fix an issue where we couldn't display both Identity card and green book

## [1.3.6] - 2024-08-01

### Changed

- Added green book document to document verification

## [1.3.5] - 2024-07-12

### Changed

- Updated Storybook from 7.6.15 to 8.1.11
- Updated readme with instructions on how to run the example app in development
- Fixed the example app environment/endpoints
- Fixed biometric verification requiring id images
- Fixed error capture

## [1.3.4] - 2024-07-01

### Added

- Added workflow_dispatch to deploy

### Changed

- Updated Sentry to only capture web embed errors
- Updated Sentry dependency to major version

## [1.3.3] - 2024-06-28

### Changed

- Version bump: from 1.3.0 to 1.3.3. (Commit: 2488832)

## [1.3.0] - 2024-06-27

### Added

- Added a new versioning strategy to enforce consistency across all packages.
- Added a new CI action to publish a git tag when the version changes.
- Updated GitHub Actions:
  - Modified `lint.yml` to include a step for running `versionConsistency.js` to check version consistency.
  - Created a new `tag.yml` workflow to automate git tagging when `package.json` versions are updated.
- Introduced a `CHANGELOG.md` file to track all notable changes in the project.
- Updated README with details on the versioning strategy and the new CI action for tagging.
- Added a new `update.sh` script to update all packages to the latest version.

### Changed

- Updated all `package.json` files in the monorepo to version `1.3.0` to maintain consistency.
- Updated dependencies in `package.json` files to the latest minor and patch versions.
