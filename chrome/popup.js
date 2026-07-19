// DOM Elements
const toggleExtension = document.getElementById("toggle-extension");
const cleanCountEl = document.getElementById("clean-count");
const customListEl = document.getElementById("custom-list");
const noCustomTextEl = document.getElementById("no-custom-text");
const addParamForm = document.getElementById("add-param-form");
const newParamInput = document.getElementById("new-param-input");
const btnReset = document.getElementById("btn-reset");

// Load and render current state from storage
async function initializePopup() {
  const data = await chrome.storage.local.get({
    enabled: true,
    customParams: [],
    cleanCount: 0
  });

  // Set initial toggle state
  toggleExtension.checked = data.enabled;
  updateUIVisibility(data.enabled);

  // Set initial counter
  animateCounter(0, data.cleanCount);

  // Render custom params list
  renderCustomParams(data.customParams);
}

// Update UI styling depending on enabled state
function updateUIVisibility(isEnabled) {
  const appContainer = document.querySelector(".app-container");
  if (isEnabled) {
    appContainer.classList.remove("extension-disabled");
    document.querySelector(".counter-circle").style.opacity = "1";
    document.querySelector(".glow-ring").style.display = "block";
  } else {
    appContainer.classList.add("extension-disabled");
    document.querySelector(".counter-circle").style.opacity = "0.5";
    document.querySelector(".glow-ring").style.display = "none";
  }
}

// Animate counting numbers for a satisfying counter effect
function animateCounter(start, end) {
  if (start === end) {
    cleanCountEl.textContent = end.toLocaleString();
    return;
  }

  const duration = 400; // ms
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out quad
    const easeProgress = progress * (2 - progress);
    const currentValue = Math.floor(start + easeProgress * (end - start));
    
    cleanCountEl.textContent = currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      cleanCountEl.textContent = end.toLocaleString();
    }
  }

  requestAnimationFrame(updateCount);
}

// Render custom parameters in list
function renderCustomParams(params) {
  customListEl.innerHTML = "";

  if (params.length === 0) {
    noCustomTextEl.style.display = "block";
    return;
  }

  noCustomTextEl.style.display = "none";

  params.forEach((param) => {
    const li = document.createElement("li");
    
    const paramName = document.createElement("span");
    paramName.textContent = param;
    li.appendChild(paramName);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.setAttribute("aria-label", `Delete parameter ${param}`);
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;

    deleteBtn.addEventListener("click", () => deleteParam(param));
    li.appendChild(deleteBtn);
    customListEl.appendChild(li);
  });
}

// Delete a custom parameter
async function deleteParam(paramToDelete) {
  const data = await chrome.storage.local.get({ customParams: [] });
  const updatedParams = data.customParams.filter(p => p !== paramToDelete);
  
  await chrome.storage.local.set({ customParams: updatedParams });
  renderCustomParams(updatedParams);
}

// Toggle overall enabled status
toggleExtension.addEventListener("change", async (e) => {
  const isEnabled = e.target.checked;
  await chrome.storage.local.set({ enabled: isEnabled });
  updateUIVisibility(isEnabled);
});

// Add custom parameter
addParamForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newParam = newParamInput.value.trim().toLowerCase();
  
  if (!newParam) return;

  const data = await chrome.storage.local.get({ customParams: [] });
  
  // Prevent duplicates
  if (data.customParams.includes(newParam)) {
    newParamInput.value = "";
    return;
  }

  // Prevent default parameters from being duplicate added
  const defaultParams = [
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
  if (defaultParams.includes(newParam)) {
    newParamInput.value = "";
    return;
  }

  const updatedParams = [...data.customParams, newParam];
  await chrome.storage.local.set({ customParams: updatedParams });
  
  renderCustomParams(updatedParams);
  newParamInput.value = "";
});

// Reset stats
btnReset.addEventListener("click", async () => {
  const currentCount = parseInt(cleanCountEl.textContent.replace(/,/g, "")) || 0;
  await chrome.storage.local.set({ cleanCount: 0 });
  animateCounter(currentCount, 0);
});

// Listen to storage changes to update stats/state dynamically
chrome.storage.onChanged.addListener((changes) => {
  if (changes.cleanCount) {
    const oldVal = changes.cleanCount.oldValue || 0;
    const newVal = changes.cleanCount.newValue || 0;
    animateCounter(oldVal, newVal);
  }
  if (changes.enabled) {
    toggleExtension.checked = changes.enabled.newValue;
    updateUIVisibility(changes.enabled.newValue);
  }
  if (changes.customParams) {
    renderCustomParams(changes.customParams.newValue || []);
  }
});

// Start popup
document.addEventListener("DOMContentLoaded", initializePopup);
