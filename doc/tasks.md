# NoTrack Extension Development Tasks

## Progress Legend
- [ ] Todo
- [/] In Progress
- [x] Done

## Phase 1: Firefox Implementation (Primary)
- [x] Project planning & ADR initialization (Separated folders, Firefox-first) <!-- id: 0 -->
- [x] Create `/firefox/manifest.json` (Firefox Manifest V3) <!-- id: 1 -->
- [x] Define static redirect ruleset in `/firefox/rules.json` to block default parameters (`utm_source`, `utm_medium`, `utm_campaign`) <!-- id: 2 -->
- [x] Create `/firefox/background.js` (Firefox background event script for stats & dynamic rule tracking) <!-- id: 3 -->
- [x] Design and implement the Firefox Popup UI (`/firefox/popup.html` & `/firefox/popup.css`) <!-- id: 4 -->
  - Modern dark mode with glassmorphic cards and subtle color accents
  - Typography using modern Inter/Outfit fonts
  - Counter for cleaned parameters, extension toggle, and custom parameter management
- [x] Implement Popup behavior (`/firefox/popup.js`) with dynamic rules API (`browser.declarativeNetRequest.updateDynamicRules`) <!-- id: 5 -->
- [x] Generate Firefox icons (in `/firefox/icons/`) <!-- id: 6 -->

## Phase 2: Firefox Testing & Polish
- [x] Create a local mock test page (`test.html` or similar) to check query parameter cleaning before loading <!-- id: 7 -->
- [/] Manually verify parameter cleaning in Firefox Developer Mode <!-- id: 8 -->

## Phase 3: Chrome Implementation (Porting)
- [x] Copy core components to `/chrome/` directory <!-- id: 9 -->
- [x] Adapt `/chrome/manifest.json` for Chrome (Service Worker background system, remove Firefox-specific properties) <!-- id: 10 -->
- [x] Adapt background and popup files for Chrome (if any API mappings require changes) <!-- id: 11 -->
- [ ] Verify functionality in Chrome Developer Mode <!-- id: 12 -->
