(() => {
  const api = typeof browser !== "undefined" ? browser : chrome;
  const cleaner = globalThis.NoTrackCleaner;

  if (!cleaner) {
    return;
  }

  let customParams = [];

  function cleanCurrentLocation() {
    const currentUrl = window.location.href;
    const result = cleaner.cleanUrl(currentUrl, customParams);

    if (result.isCleaned && result.cleanedUrl !== currentUrl) {
      try {
        window.history.replaceState(window.history.state, document.title, result.cleanedUrl);
        // Notifier le script d'arrière-plan pour incrémenter le compteur de stats
        if (api && api.runtime && api.runtime.sendMessage) {
          api.runtime.sendMessage({
            type: "TRACKERS_CLEANED",
            count: result.strippedCount
          }).catch(() => {
            // Ignorer silencieusement si le background script est inactif
          });
        }
      } catch (err) {
        console.warn("NoTrack: Failed to replace URL state:", err);
      }
    }
  }

  // 1. Nettoyage immédiat à document_start avec les paramètres par défaut
  cleanCurrentLocation();

  // 2. Écoute des changements dynamiques de fragment (SPAs / navigation in-page)
  window.addEventListener("hashchange", () => {
    cleanCurrentLocation();
  });

  // 3. Récupération des paramètres personnalisés depuis le storage
  try {
    if (api && api.storage && api.storage.local) {
      api.storage.local.get({ enabled: true, customParams: [] }).then((data) => {
        if (!data.enabled) return;
        if (Array.isArray(data.customParams) && data.customParams.length > 0) {
          customParams = data.customParams;
          // Re-vérifier l'URL au cas où un paramètre personnalisé soit présent
          cleanCurrentLocation();
        }
      }).catch(() => {});
    }
  } catch {
    // Environnement sans storage direct
  }
})();
