import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

function loadCleaner(relativePath) {
  const fileUrl = new URL(relativePath, import.meta.url);
  const code = fs.readFileSync(fileUrl, "utf-8");
  const sandbox = { globalThis: {}, URL, Set, Array, console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.NoTrackCleaner;
}

const firefoxCleaner = loadCleaner("../firefox/url-cleaner.js");
const chromeCleaner = loadCleaner("../chrome/url-cleaner.js");

describe("NoTrack URL Cleaner", () => {
  describe("User Reported URL (HuggingFace + MagNews Hash Tracking)", () => {
    const userUrl =
      "https://huggingface.co/SupersonicLabs/Julia-1#utm_source=MagNews&utm_medium=email&utm_campaign=IA_28/09/2026&een=e69412b05a83d66051dfaa54fae52eba&seen=2&gbmlus=29ff0886bc30e389c5f284a6357cc1f6473984592925340323fcd822562e94c4";

    it("should completely clean the tracking parameters from the hash fragment", () => {
      const result = firefoxCleaner.cleanUrl(userUrl);

      assert.strictEqual(
        result.cleanedUrl,
        "https://huggingface.co/SupersonicLabs/Julia-1",
        "Hash fragment containing only tracking parameters should be completely removed"
      );
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 6);
      assert.deepStrictEqual([...result.strippedParams].sort(), [
        "een",
        "gbmlus",
        "seen",
        "utm_campaign",
        "utm_medium",
        "utm_source"
      ]);
    });
  });

  describe("Standard Query String Tracking", () => {
    it("should clean standard UTM parameters from search query", () => {
      const url = "https://example.com/blog?utm_source=newsletter&utm_medium=email&utm_campaign=summer";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/blog");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 3);
    });

    it("should preserve legitimate non-tracking parameters in search query", () => {
      const url = "https://example.com/search?q=machine+learning&utm_source=google&page=2&utm_medium=cpc";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/search?q=machine+learning&page=2");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 2);
    });

    it("should clean ad network tracking identifiers (gclid, fbclid, msclkid)", () => {
      const url = "https://example.com/shop?product=123&fbclid=fb_abc&gclid=g_xyz&msclkid=ms_789";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/shop?product=123");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 3);
    });

    it("should clean MagNews parameters when passed in the query string", () => {
      const url = "https://example.com/newsletter?een=contact123&seen=5&gbmlus=session456&subscribe=true";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/newsletter?subscribe=true");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 3);
    });
  });

  describe("URL Hash / Fragment Tracking & Anchors", () => {
    it("should preserve normal navigation anchors without tracking parameters", () => {
      const url = "https://example.com/documentation#installation-guide";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, url);
      assert.strictEqual(result.isCleaned, false);
      assert.strictEqual(result.strippedCount, 0);
    });

    it("should strip tracking parameters from SPA routing hashes", () => {
      const url = "https://example.com/app/#/dashboard?utm_source=slack&view=detailed";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/app/#/dashboard?view=detailed");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 1);
    });

    it("should remove the query portion of SPA hash when only tracking parameters were present", () => {
      const url = "https://example.com/app/#/settings?utm_source=twitter&utm_medium=social";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/app/#/settings");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 2);
    });

    it("should clean tracking parameters attached to an anchor via ampersand", () => {
      const url = "https://example.com/page#section2&utm_source=promo&seen=1";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/page#section2");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 2);
    });
  });

  describe("Simultaneous Query and Hash Tracking", () => {
    it("should clean tracking parameters from both query string and hash fragment", () => {
      const url = "https://example.com/article?utm_source=mail&keep=true#utm_medium=link&een=789";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/article?keep=true");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 3);
    });
  });

  describe("Case Insensitivity & Custom Parameters", () => {
    it("should handle tracking parameters case-insensitively", () => {
      const url = "https://example.com/test?UTM_SOURCE=Upper&Utm_Campaign=Mixed#EEN=HASH_UPPER";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, "https://example.com/test");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 3);
    });

    it("should support user-defined custom parameters", () => {
      const url = "https://example.com/deal?affiliate_partner=partner123&utm_source=web";
      const customParams = ["affiliate_partner"];
      const result = firefoxCleaner.cleanUrl(url, customParams);

      assert.strictEqual(result.cleanedUrl, "https://example.com/deal");
      assert.strictEqual(result.isCleaned, true);
      assert.strictEqual(result.strippedCount, 2);
    });
  });

  describe("Edge Cases & Graceful Degradation", () => {
    it("should return clean unchanged result when no tracking parameters exist", () => {
      const url = "https://example.com/path?foo=bar&baz=qux#heading";
      const result = firefoxCleaner.cleanUrl(url);

      assert.strictEqual(result.cleanedUrl, url);
      assert.strictEqual(result.isCleaned, false);
      assert.strictEqual(result.strippedCount, 0);
    });

    it("should handle invalid URL strings gracefully without throwing", () => {
      const invalidUrl = "not-a-valid-url";
      const result = firefoxCleaner.cleanUrl(invalidUrl);

      assert.strictEqual(result.cleanedUrl, invalidUrl);
      assert.strictEqual(result.isCleaned, false);
      assert.strictEqual(result.strippedCount, 0);
    });
  });

  describe("Parity Check (Firefox & Chrome implementations)", () => {
    it("should produce identical results between Firefox and Chrome cleaner modules", () => {
      assert.deepStrictEqual([...firefoxCleaner.DEFAULT_PARAMS], [...chromeCleaner.DEFAULT_PARAMS]);

      const testUrl = "https://example.com/?utm_source=test&een=123#utm_medium=hash";
      const ffResult = firefoxCleaner.cleanUrl(testUrl);
      const crResult = chromeCleaner.cleanUrl(testUrl);

      assert.strictEqual(ffResult.cleanedUrl, crResult.cleanedUrl);
      assert.strictEqual(ffResult.strippedCount, crResult.strippedCount);
      assert.deepStrictEqual([...ffResult.strippedParams], [...crResult.strippedParams]);
    });
  });
});
