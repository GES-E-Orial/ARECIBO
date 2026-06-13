// GES Arecibo - background service worker

import { SIGNING, STORAGE_KEYS } from "./config.js";

async function sha256hex(message) {
  const data = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildSignature(employeeId, authToken) {
  const payload = SIGNING.salt + ":" + employeeId + ":" + authToken;
  return SIGNING.envelopePrefix + (await sha256hex(payload));
}

chrome.runtime.onInstalled.addListener(async () => {
  const current = await chrome.storage.local.get(STORAGE_KEYS.PROFILE);
  if (!current[STORAGE_KEYS.PROFILE]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.PROFILE]: {
        employeeId: "sam.eugene",
        displayName: "Sam Eugène",
        department: "Mission Planning",
        role: "Senior Mission Analyst"
      },
      [STORAGE_KEYS.AUTH_TOKEN]: "ges-auth-se-7f3b1c9a2d48e6f0",
      [STORAGE_KEYS.SIGN_COUNT]: 0
    });
    console.info("[ARECIBO] demo session seeded for sam.eugene");
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;

  if (msg.action === "generateSignature") {
    chrome.storage.local.get(
      [STORAGE_KEYS.PROFILE, STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.SIGN_COUNT],
      async (data) => {
        const profile = data[STORAGE_KEYS.PROFILE];
        const token = data[STORAGE_KEYS.AUTH_TOKEN];

        if (!profile || !token) {
          sendResponse({ ok: false, error: "not authenticated" });
          return;
        }

        const signature = await buildSignature(profile.employeeId, token);
        const count = (data[STORAGE_KEYS.SIGN_COUNT] || 0) + 1;

        await chrome.storage.local.set({
          [STORAGE_KEYS.SIGN_COUNT]: count,
          [STORAGE_KEYS.LAST_SIGN]: Date.now()
        });

        sendResponse({ ok: true, signature, signer: profile.displayName });
      }
    );
    return true; // keep channel open for async sendResponse
  }

  if (msg.action === "getProfile") {
    chrome.storage.local.get(STORAGE_KEYS.PROFILE, (data) => {
      sendResponse({ ok: true, profile: data[STORAGE_KEYS.PROFILE] || null });
    });
    return true;
  }

  if (msg.action === "getStats") {
    chrome.storage.local.get(
      [STORAGE_KEYS.SIGN_COUNT, STORAGE_KEYS.LAST_SIGN],
      (data) => {
        sendResponse({
          ok: true,
          count: data[STORAGE_KEYS.SIGN_COUNT] || 0,
          lastSign: data[STORAGE_KEYS.LAST_SIGN] || null
        });
      }
    );
    return true;
  }
});
