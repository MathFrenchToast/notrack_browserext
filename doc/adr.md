# Architecture Decision Record: Web Extension Architecture for NoTrack

## Status
Accepted

## Context
We need to build a web extension (`notrack ext`) that removes tracking query parameters from URLs (e.g., `utm_source`, `utm_medium`, `utm_campaign`, `gclid`, `fbclid`, and email tracking parameters such as `een`, `seen`, `gbmlus`) before and during page navigation.
The extension must support both Firefox and Chrome.
Historically, parameters were passed in the query string (`?param=val`), but email marketing tools (such as MagNews) and modern Single Page Applications increasingly append tracking parameters inside the URL fragment/hash (`#param=val` or `#/route?param=val`) to bypass CDN cache busting or network-level strippers.

## Decision
1. **Separation of Browser Folders**:
   - `/firefox/`: Source code tailored for Firefox (using background scripts and Gecko settings).
   - `/chrome/`: Source code tailored for Chrome (using background service workers).

2. **Hybrid Cleaning Architecture**:
   - **Network Level (`declarativeNetRequest`)**:
     - Strips tracking query parameters (`?utm_*`, `?gclid`, `?een`, etc.) at the network level before pages start loading.
     - Static rules defined in `rules.json` with dynamic rules synchronized via `storage.local`.
   - **Client-Side Fragment Level (Content Script with `history.replaceState`)**:
     - Per RFC 3986 Section 3.5, URL fragment identifiers (`#...`) are never sent in HTTP network requests to the server, and `declarativeNetRequest` does not support matching or filtering on fragments.
     - A lightweight content script runs at `document_start` (`*://*/*`) to inspect `window.location.hash`.
     - When tracking parameters are found in the hash, `window.history.replaceState` removes them silently without triggering a reload, while preserving navigation anchors.
     - Listens to `hashchange` events to protect SPA in-page navigations.

3. **Expanded Default Trackers**:
   - Standard analytics: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `utm_id`.
   - Ad platforms: `gclid`, `fbclid`, `msclkid`.
   - Email marketing & newsletters (e.g. MagNews): `een`, `seen`, `gbmlus`.

4. **Automated Unit Testing Strategy**:
   - Zero-dependency unit testing via Node.js native test runner (`node --test` and `node:assert`).
   - Shared pure module `url-cleaner.js` containing the URL parsing, query stripping, and hash normalization logic.
   - Comprehensive tests validating both query and hash formats, edge cases, and preserved user anchors.

## Consequences
- Full privacy protection covering both legacy query tracking and modern hash/fragment tracking.
- Zero latency impact: DNR handles network requests; content script cleans fragments at `document_start` without page reloads.
- High testability: pure cleaning functions are decoupled and testable in CI and local CLI.
