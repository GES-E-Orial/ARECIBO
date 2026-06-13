// GES Arecibo - content script

import {
  EVENTS,
  EVT_PREFIX,
  FLAGS,
  MSG,
  ORG,
  PORTAL,
  STORAGE_KEYS
} from "./config.js";
import { selfTest, signElement } from "./signer.js";

// ---------------------------------------------------------------------------
// Portal guard
//
// manifest.json uses <all_urls> to cover staging and qa environments without
// a per-cohort build. Gating is performed here against the portal pattern.
// ---------------------------------------------------------------------------

function buildPortalPattern() {
  return new RegExp(
    PORTAL.subdomain + "\\." + ORG.host + "\\." + ORG.tld,
    "i"
  );
}

const PORTAL_PATTERN = buildPortalPattern();

function isGESPortal(hostname) {
  return PORTAL_PATTERN.test(hostname);
}

if (!isGESPortal(window.location.hostname)) {
  // Not a GES portal - bail out silently.
} else {
  bootstrap();
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

function bootstrap() {
  console.debug("[ARECIBO] activating on " + window.location.hostname);

  if (!selfTest()) {
    console.error("[ARECIBO] self-test failed - aborting");
    return;
  }

  if (FLAGS.enableRibbon) installRibbon();
  if (FLAGS.enableSignControls) wireSignatureControls();
  if (FLAGS.enableContextBroadcast) broadcastUserContext();
  if (FLAGS.enablePortalBridge) wirePortalBridge();
}

// ---------------------------------------------------------------------------
// Ribbon
// ---------------------------------------------------------------------------

function installRibbon() {
  const ribbon = document.createElement("div");
  ribbon.id = "ges-arecibo-ribbon";
  ribbon.setAttribute("data-ges", "ribbon");
  ribbon.style.cssText =
    "position:fixed;top:0;left:0;right:0;height:22px;" +
    "background:#0d1f3c;color:#7dd3fc;font:11px/22px monospace;" +
    "text-align:center;z-index:2147483647;letter-spacing:0.06em;";
  ribbon.textContent = "GES Arecibo - internal session active";
  document.documentElement.appendChild(ribbon);

  document.dispatchEvent(
    new CustomEvent(EVT_PREFIX + EVENTS.RIBBON_SHOWN, {
      detail: { at: Date.now() }
    })
  );
}

// ---------------------------------------------------------------------------
// Document signing controls
//
// Elements marked with data-ges-sign trigger a signature request on click.
// ---------------------------------------------------------------------------

function wireSignatureControls() {
  const controls = document.querySelectorAll("[data-ges-sign]");
  controls.forEach((el) => {
    el.addEventListener("click", async () => {
      const payload = el.getAttribute("data-ges-sign");
      if (!payload) return;

      const sig = await signElement(el, payload);
      if (sig) {
        el.textContent = "Signed";
        el.disabled = true;
      }
    });
  });
}

// ---------------------------------------------------------------------------
// User-context broadcast
//
// Surfaces the cached profile via a DOM event so portal widgets can render
// personalized content without an additional runtime call.
// ---------------------------------------------------------------------------

async function broadcastUserContext() {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.PROFILE,
    STORAGE_KEYS.AUTH_TOKEN
  ]);

  const profile = data[STORAGE_KEYS.PROFILE];
  const token = data[STORAGE_KEYS.AUTH_TOKEN];
  if (!profile || !token) return;

  document.dispatchEvent(
    new CustomEvent(EVT_PREFIX + EVENTS.CONTEXT, {
      detail: { profile, token, emittedAt: Date.now() }
    })
  );
}

// ---------------------------------------------------------------------------
// Portal bridge
// ---------------------------------------------------------------------------

function wirePortalBridge() {
  const MSG_SIGN_REQUEST = MSG.NS + "_" + MSG.SIGN_REQUEST;
  const MSG_SIGN_RESPONSE = MSG.NS + "_" + MSG.SIGN_RESPONSE;

  window.addEventListener("message", function handlePortalMessage(event) {
    if (!event.data || event.data.type !== MSG_SIGN_REQUEST) return;

    chrome.runtime.sendMessage({ action: "generateSignature" }, function (resp) {
      if (!resp || !resp.ok) return;

      window.postMessage(
        {
          type: MSG_SIGN_RESPONSE,
          signature: resp.signature,
          signer: resp.signer
        },
        "*"
      );
    });
  });
}
