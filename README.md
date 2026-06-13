# GES Arecibo

Identity-linked document signing for Good Enough Space personnel. Employees
use **Arecibo** to countersign mission plans, launch clearances, and resource
allocation forms directly from the GES portal.

**Audience:** GES employees (Mission Planning, Launch Operations, Resource
Allocation). Distributed via the corporate Chrome managed-policy channel.

## Features

- Signature controls for portal documents - click to countersign, the
  envelope is stamped onto the element and recorded in the audit log
- Welcome ribbon on GES portal pages
- User-context helpers for portal widgets

## Architecture

```
manifest.json         -> MV3 manifest
src/config.js         -> centralized configuration
src/background.js     -> service worker; authentication and signing
src/content.js        -> portal gating and feature wiring
src/signer.js         -> envelope validation and element stamping
popup.html / popup.js -> toolbar UI
```

The extension stores the employee profile and auth token in
`chrome.storage.local`. The background worker derives the signature envelope
from these on demand; no external service is contacted.

## Host scope

The MV3 `matches` declaration is `<all_urls>` to support staging, qa, and
regional portal mirrors without a new build per environment. Actual gating
is performed in `content.js` against the configured portal pattern.

## Maintainers

- C. Nakamura - IT Security Division (lead)
- B. Santos - Platform Engineering
