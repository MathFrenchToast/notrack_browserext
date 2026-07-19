# Architecture Decision Record: Web Extension Architecture for NoTrack

## Status
Proposed

## Context
We need to build a web extension (`notrack ext`) that removes tracking query parameters from URLs (e.g., `utm_source`, `utm_medium`, `utm_campaign`) before the browser loads the page. The extension must support both Firefox and Chrome. Firefox is the primary target and browser of trust, currently "in progress," while Chrome is "todo."

## Decision
We will separate the source code into two target folders to handle browser-specific differences in Manifest V3 (MV3):
- `/firefox/`: Source code tailored for Firefox (using background scripts).
- `/chrome/`: Source code tailored for Chrome (using background service workers).

Both extensions will use **Manifest V3 (MV3)** and the **`declarativeNetRequest`** API for query parameter removal, ensuring excellent performance and privacy.

### Core Architecture Components for Firefox (`/firefox/`):
1. **Manifest V3 Configuration**:
   - Declares the required permissions (`declarativeNetRequest`, `storage`, and `declarativeNetRequestFeedback`).
   - Uses `"browser_specific_settings"` to specify the extension ID for Firefox.
   - Declares background scripts via `"background": { "scripts": ["background.js"] }` (non-persistent event pages, as Firefox does not support/require Service Workers for MV3 in the same way Chrome does).
2. **`rules.json`**:
   - Defines static rules for removing default parameters (`utm_source`, `utm_medium`, `utm_campaign`) globally.
3. **`background.js`**:
   - Coordinates state (enable/disable status) and accumulates counter statistics using `browser.storage.local`.
4. **Popup UI (`popup.html`, `popup.css`, `popup.js`)**:
   - Interactive, beautiful dark-themed interface built using CSS styling and modern typography.
   - Provides controls to toggle extension state, list default blocked parameters, and add/remove custom tracking parameters.

## Consequences
- Clean separation of concerns between Firefox and Chrome implementations, avoiding build tools or complex conditional compilations.
- Complete adherence to Firefox MV3 guidelines.
