# NoTrack Ext

A privacy-focused browser extension that cleans tracking query parameters from URLs (such as `utm_source`, `utm_medium`, and `utm_campaign`) before the page even starts loading.

## Features

- **Performance-First Design**: Uses the native browser `declarativeNetRequest` engine for high-performance, blocking-free parameter stripping.
- **Customizable**: Allows users to dynamically add and remove custom tracking parameters via a popup interface.
- **Privacy Dashboard**: Displays stats on the total number of tracking parameters prevented from running.
- **Cross-Browser Support**: Has specialized implementations for both Firefox and Chrome.

---

## Directory Structure

```
notrack/
├── doc/
│   ├── adr.md          # Architecture Decision Record
│   └── tasks.md        # Task List & Progress Tracker
├── firefox/            # Firefox Extension Source Code (Manifest V3)
├── chrome/             # Chrome Extension Source Code (Manifest V3)
└── test.html           # Interactive parameter-stripping test suite
```

---

## Browser Status

| Browser | Status | Folder |
| --- | --- | --- |
| **Firefox** | Completed | `/firefox/` |
| **Chrome** | Completed | `/chrome/` |

---

## Local Installation & Testing

### 1. Firefox
1. Open Firefox and type `about:debugging` in the address bar.
2. Click on **"This Firefox"** in the left sidebar.
3. Click the **"Load Temporary Add-on..."** button.
4. Navigate to your extension directory, open the `firefox/` folder, and select the `manifest.json` file.

### 2. Chrome
1. Open Chrome and type `chrome://extensions` in the address bar.
2. Enable **"Developer mode"** toggle in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left corner.
4. Select the `chrome/` folder of this project.

### 3. Testing Parameter Stripping
After loading the extension:
1. Open the [test.html](test.html) dashboard in your browser.
2. Click any of the test links preloaded with tracking parameters.
3. Observe that the extension instantly intercepts the request and removes the parameters before the target page loads.
