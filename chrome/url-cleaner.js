const DEFAULT_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "een",
  "seen",
  "gbmlus"
];

/**
 * Nettoie le fragment / hash de l'URL s'il contient des paramètres de tracking.
 * Préserve les ancres légitimes (#introduction) et les routes SPA (#/page?param=val).
 *
 * @param {string} rawHash - Le hash brut de l'URL (ex: "#utm_source=x&een=y" ou "#anchor")
 * @param {Set<string>} paramsToRemoveSet - L'ensemble des clés en minuscules à supprimer
 * @returns {{ cleanedHash: string, strippedCount: number, strippedParams: string[] }}
 */
function cleanHash(rawHash, paramsToRemoveSet) {
  if (!rawHash || rawHash === "#") {
    return { cleanedHash: "", strippedCount: 0, strippedParams: [] };
  }

  const hashContent = rawHash.slice(1);
  let strippedCount = 0;
  const strippedParams = [];

  // Cas 1 : Le hash contient un séparateur explicite de requête '?' (ex: "#/route?utm_source=x&view=1" ou "#section?utm_source=x")
  if (hashContent.includes("?")) {
    const questionIndex = hashContent.indexOf("?");
    const prefix = hashContent.slice(0, questionIndex);
    const queryString = hashContent.slice(questionIndex + 1);

    const segments = queryString.split("&");
    const remainingSegments = [];

    for (const segment of segments) {
      if (!segment) continue;
      const eqIndex = segment.indexOf("=");
      const key = eqIndex !== -1 ? segment.slice(0, eqIndex).trim() : segment.trim();

      if (paramsToRemoveSet.has(key.toLowerCase())) {
        strippedCount++;
        strippedParams.push(key);
      } else {
        remainingSegments.push(segment);
      }
    }

    if (remainingSegments.length > 0) {
      return {
        cleanedHash: `#${prefix}?${remainingSegments.join("&")}`,
        strippedCount,
        strippedParams
      };
    } else {
      return {
        cleanedHash: prefix ? `#${prefix}` : "",
        strippedCount,
        strippedParams
      };
    }
  }

  // Cas 2 : Le hash ne contient pas de '?' (ex: "#utm_source=x&een=y", "#section&utm_source=x", ou ancre pure "#heading-1")
  const segments = hashContent.split("&");
  const remainingSegments = [];

  for (const segment of segments) {
    if (!segment) continue;
    const eqIndex = segment.indexOf("=");
    const key = eqIndex !== -1 ? segment.slice(0, eqIndex).trim() : segment.trim();

    if (paramsToRemoveSet.has(key.toLowerCase())) {
      strippedCount++;
      strippedParams.push(key);
    } else {
      remainingSegments.push(segment);
    }
  }

  // Si aucun tracker n'a été trouvé, on laisse le hash intact
  if (strippedCount === 0) {
    return { cleanedHash: rawHash, strippedCount: 0, strippedParams: [] };
  }

  // Si tous les segments étaient des trackers, le hash devient complètement vide
  if (remainingSegments.length === 0) {
    return { cleanedHash: "", strippedCount, strippedParams };
  }

  return {
    cleanedHash: `#${remainingSegments.join("&")}`,
    strippedCount,
    strippedParams
  };
}

/**
 * Nettoie une URL en supprimant les paramètres de tracking connus (query + hash).
 *
 * @param {string} inputUrl - L'URL à nettoyer
 * @param {string[]} customParams - Paramètres additionnels définis par l'utilisateur
 * @returns {{ cleanedUrl: string, isCleaned: boolean, strippedCount: number, strippedParams: string[] }}
 */
function cleanUrl(inputUrl, customParams = []) {
  try {
    const url = new URL(inputUrl);
    const allParams = [...DEFAULT_PARAMS, ...customParams];
    const paramsSet = new Set(allParams.map((p) => p.toLowerCase()));

    let strippedCount = 0;
    const strippedParams = [];

    // 1. Nettoyage de la query string (?searchParams)
    for (const param of allParams) {
      const lower = param.toLowerCase();
      const matchingKeys = [];
      for (const key of url.searchParams.keys()) {
        if (key.toLowerCase() === lower) {
          matchingKeys.push(key);
        }
      }
      for (const key of matchingKeys) {
        url.searchParams.delete(key);
        strippedCount++;
        strippedParams.push(key);
      }
    }

    // 2. Nettoyage du hash / fragment (#...)
    if (url.hash) {
      const hashResult = cleanHash(url.hash, paramsSet);
      if (hashResult.strippedCount > 0) {
        url.hash = hashResult.cleanedHash;
        strippedCount += hashResult.strippedCount;
        strippedParams.push(...hashResult.strippedParams);
      }
    }

    return {
      cleanedUrl: url.toString(),
      isCleaned: strippedCount > 0,
      strippedCount,
      strippedParams
    };
  } catch {
    return {
      cleanedUrl: inputUrl,
      isCleaned: false,
      strippedCount: 0,
      strippedParams: []
    };
  }
}

// Compatibilité UMD : Navigateur (globalThis.NoTrackCleaner) et Node.js (module.exports)
if (typeof globalThis !== "undefined") {
  globalThis.NoTrackCleaner = {
    DEFAULT_PARAMS,
    cleanHash,
    cleanUrl
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DEFAULT_PARAMS,
    cleanHash,
    cleanUrl
  };
}
