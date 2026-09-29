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
- [x] Manually verify parameter cleaning in Firefox Developer Mode <!-- id: 8 -->

## Phase 3: Chrome Implementation (Porting)
- [x] Copy core components to `/chrome/` directory <!-- id: 9 -->
- [x] Adapt `/chrome/manifest.json` for Chrome (Service Worker background system, remove Firefox-specific properties) <!-- id: 10 -->
- [x] Adapt background and popup files for Chrome (if any API mappings require changes) <!-- id: 11 -->
- [x] Verify functionality in Chrome Developer Mode <!-- id: 12 -->

## Phase 4: Extended Trackers & Fragment Cleaning
- [x] Add MagNews tracking parameters (`een`, `seen`, `gbmlus`) to `DEFAULT_PARAMS` and `rules.json` (Firefox & Chrome) <!-- id: 13 -->
- [x] Implement pure URL cleaner module (`url-cleaner.js`) handling query strings and URL hash fragments <!-- id: 14 -->
- [x] Add content script (`content.js`) with `document_start` and `history.replaceState` for in-page hash cleaning <!-- id: 15 -->
- [x] Update `test.html` to showcase both query and hash tracking parameters <!-- id: 16 -->

## Phase 5: Automated Unit Testing & CI
- [x] Setup Node.js native test runner (`node --test`) with zero external runtime dependencies <!-- id: 17 -->
- [x] Write comprehensive unit test suite in `test/url-cleaner.test.js` covering standard UTMs, MagNews trackers, query params, hash fragments, and preserved anchors <!-- id: 18 -->
- [x] Add test step to GitHub Actions CI workflow <!-- id: 19 -->
