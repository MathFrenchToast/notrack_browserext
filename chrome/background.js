const DEFAULT_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid"
];

// Function to synchronize declarativeNetRequest rules with extension storage state
async function syncRules() {
  console.log("NoTrack: Starting rules synchronization...");
  try {
    const data = await chrome.storage.local.get({
      enabled: true,
      customParams: []
    });

    if (data.enabled) {
      console.log("NoTrack: Extension is enabled. Enabling static ruleset 'ruleset_1'...");
      // 1. Enable static ruleset
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ["ruleset_1"]
      });

      // 2. Add or update dynamic ruleset for custom parameters
      if (data.customParams.length > 0) {
        console.log("NoTrack: Found custom parameters:", data.customParams);
        const rule = {
          id: 10001,
          priority: 1,
          action: {
            type: "redirect",
            redirect: {
              transform: {
                queryTransform: {
                  removeParams: data.customParams
                }
              }
            }
          },
          condition: {
            resourceTypes: ["main_frame"]
          }
        };

        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: [rule],
          removeRuleIds: [10001] // Overwrite existing dynamic rule
        });
      } else {
        console.log("NoTrack: No custom parameters. Clearing dynamic rule 10001...");
        // No custom parameters, remove dynamic rules if any exist
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: [10001]
        });
      }
    } else {
      console.log("NoTrack: Extension is disabled. Deactivating all rules...");
      // Extension disabled: Deactivate static rules and remove dynamic rules
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ["ruleset_1"]
      });

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [10001]
      });
    }
    console.log("NoTrack: Rules synchronized successfully.");
  } catch (err) {
    console.error("NoTrack: Failed to synchronize rules:", err);
  }
}

// Initialize on installation or startup
chrome.runtime.onInstalled.addListener(async () => {
  // Ensure default stats and states are set up in storage
  const defaults = await chrome.storage.local.get({
    enabled: true,
    customParams: [],
    cleanCount: 0
  });
  await chrome.storage.local.set(defaults);

  await syncRules();
});

chrome.runtime.onStartup.addListener(async () => {
  await syncRules();
});

// React to changes in user options (e.g. extension toggling or custom parameters edit)
chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.enabled || changes.customParams) {
    await syncRules();
  }
});

// Heuristically count the tracking parameters that are about to be cleaned on main frame navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only process main frame navigations

  console.log("NoTrack: onBeforeNavigate triggered for URL:", details.url);

  const data = await chrome.storage.local.get({
    enabled: true,
    customParams: []
  });

  if (!data.enabled) return;

  try {
    const url = new URL(details.url);
    const activeParams = [...DEFAULT_PARAMS, ...data.customParams];
    let strippedCount = 0;

    for (const param of activeParams) {
      if (url.searchParams.has(param)) {
        strippedCount++;
      }
    }

    if (strippedCount > 0) {
      const stats = await chrome.storage.local.get({ cleanCount: 0 });
      await chrome.storage.local.set({ cleanCount: stats.cleanCount + strippedCount });
    }
  } catch (error) {
    console.error("NoTrack: Error parsing navigation URL:", error);
  }
});

// Run initial synchronization on background script startup/reload
syncRules();
