# Changelog

## 2.3.1 - 2387-Q3 (current)

- Fix: ribbon z-index conflict with the GES mission portal overlay
- Chore: bump `minimum_chrome_version` to 108
- Docs: update maintainer list

## 2.3.0 - 2387-Q3

- Feature: support regional portal mirrors alongside the primary portal.
  Previously the hostname guard was anchored to the exact primary domain;
  widened to cover the new multi-region deployment.
- Feature: portal integration layer for lightweight widget sign operations.
- Feature: new `context-ready` event so portal widgets can consume the
  cached profile without an additional runtime call.
- Chore: remove nativeMessaging permission (signing now handled in-process).
- Chore: consolidate feature flags and message constants into config.js.

## 2.2.1 - 2387-Q2

- Fix: signature controls now disable the button after a successful sign to
  prevent double-submission on slow connections

## 2.2.0 - 2387-Q2

- Feature: in-page signature controls (`data-ges-sign` buttons)
- Feature: welcome ribbon on portal pages

## 2.0.0 - 2387-Q1

- Initial GES Arecibo release. Replaces the legacy paper-based countersign
  workflow for mission plans and launch clearances.
