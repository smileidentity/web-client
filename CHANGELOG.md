# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added `id_info` config option to pre-fill ID information fields (country, ID type, field values) across all products
  - Supports biometric KYC, enhanced KYC, basic KYC, document verification, and enhanced document verification
  - When exactly 1 country and 1 ID type are provided, the selection screen is automatically skipped
  - When all required fields are provided and valid, the input screen is also skipped
  - Valid pre-filled fields are locked (read-only), while missing or invalid fields remain editable
  - Takes precedence over `id_selection` when both are provided
- Added `strict` option within `id_info` to control validation behavior
  - `strict: true` (default): shows the input form when fields fail validation, allowing the user to correct them
  - `strict: false`: skips the input screen when all fields are provided but some are invalid (e.g. regex mismatch); missing fields still require user input

## [11.2.0] - 2026-02-13

### Added

- Added `allow-legacy-selfie-fallback` attribute to control fallback to legacy selfie capture when Mediapipe fails to load
- Added `allow_legacy_selfie_fallback` config option to embed for enabling legacy selfie fallback
- Added locale parameter to `/v1/services` and `/v1/valid_documents` API endpoints for localized label responses

### Changed

- Legacy selfie capture fallback is now opt-in (default: disabled)
- Increased Mediapipe loading timeout from 20 seconds to 90 seconds
- When Mediapipe fails and legacy fallback is disabled, shows "Internet connection error, check your connection and retry" message
- API calls now resolve short locale codes (e.g., 'en' → 'en-GB') before sending to backend

## [11.1.0] - 2026-01-20

### Changed

- Improve capture quality by setting image quality to 0.92
- Fixed error reporting issue

### Added

- Added language translation support for web components with locale customization

## [11.0.3] - 2025-11-24

### Changed

- Fixed submission issue on Huawei browser
- Fixed submission issue on Xaomi (MI) browser

## [11.0.2] - 2025-11-03

### Changed

- Fixed face detection glitches for Samsung S25 devices

## [11.0.1] - 2025-10-16

### Changed

- Fixed events not sent to parent window when presented in an iframe

## [11.0.0] - 2025-09-04

### Changed

- Payload signing on more endpoints

## [10.0.7] - 2025-08-29

### Changed

- Payload signing
- Collect more metadata for fraud analysis
- Fixed DocV form submission

## [10.0.6] - 2025-07-30

### Changed

- Support older browsers (ES6) in IIFE builds
- Improve face detection prompt timings

## [10.0.5] - 2025-07-23

### Changed

- Fixed agent mode when face detection is in use
- Responsive styling update
- Improve face detection support on older mobile devices
- Remove neutral expression checks
- Update selfie capture text prompts

## [10.0.4] - 2025-07-09

### Changed

- Styling update
- Show loading message for face detection
- Update big smile prompt to make it clearer

## [10.0.3] - 2025-07-09

### Changed

- Fix selfie capture image composition
- Mirror selfie capture image preview

## [10.0.2] - 2025-07-08

### Changed

- Increase mediapipe loading grace period.

## [10.0.1] - 2025-07-08

### Changed

- Fix external modules not being bundled in IIFE.
- Avoid zooming out captured selfies on low-res webcams.
- Fix selfie capture fallback when mediapipe fails to load.

## [10.0.0] - 2025-07-08

### Added

- Add face detection for selfie capture

## [2.0.2] - 2025-05-28

### Changed

- Improve selfie capture UI, with clearer instructions to smile

## [2.0.1] - 2025-05-20

### Added

- Add major‐version alias for frequent updates

### Changed

- Fix embed(hosted web) deployment path

## [2.0.0] - 2025-05-19

### Changed

- Improve web-components build process
- Use new designs for smart camera web cdn
- Deprecate version smart-camera-web v1
- Some bug fixes and improvements

## [1.5.1] - 2025-04-22

### Changed

- Bump selfie capture minimum resolution to 480 x 640
- Bump proof of liveness capture minimum resolution to 240 x 320

## [1.5.0] - 2025-03-24

### Changed

- Fix abort error when access biometric kyc page
- Collect additional metadata for biometric kyc, SmartSelfie auth, docv, and enhanced docv

## [1.4.7] - 2024-12-23

### Added

- Added support for both `hide-back-to-host` and `hide-back` to web components (selfie capture instructions and smart camera web)

## Changed

- Change embed to use the latest web components via file dependency
- Added support for both `hide-back-to-host` and `hide-back` to web components (selfie capture instructions and smart camera web)

## [1.4.6] - 2024-12-19

### Changed

- Fixed selfie import

## [1.4.5] - 2024-12-16

### Changed

- Handle errors gracefully
- Fixed document capture not hidden when `hide_attribution` is specified
- Cancel button on the selfie capture instructions screen will now be hidden when back button is hidden

## [1.4.4] - 2024-10-15

### Changed

- Fixed an issue where some grandparents of the hosted web client do not receive error callbacks
- Update dependencies

## [1.4.3] - 2024-09-30

### Changed

- Fixed an issue where grandparents of the hosted web client do not receive callbacks

## [1.4.2] - 2024-09-05

### Changed

- Fix: Agent mode displaying when config is not enabled

## [1.4.1] - 2024-09-03

### Changed

- Fix: Hide the document video when checking permission
- Update dev dependencies

## [1.4.0] - 2024-08-30

### Added

- Added new Agent mode

## [1.3.10] - 2024-08-29

### Added

- Added `hide_attribute` config to web embed

## [1.3.9] - 2024-08-28

### Added

- Added new designs to smart selfie authentication

### Changed

- Fix theme color not affecting biometric and smart selfie authentication

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
