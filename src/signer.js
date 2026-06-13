// GES Arecibo - signing utilities
//
// Audit log (sample):
//   c.nakamura | doc GES-INFRA-2387-Q2    | 0x3f4a1bc6e092d85a7f3cb4175a35384114ed46c5d34d3109838c056c33b08a12
//   sam.eugene | doc GES-MISSION-2387-Q3  | <see audit portal>

import { EVENTS, EVT_PREFIX, SIGNING } from "./config.js";

const SIGNATURE_TEST_VECTOR = "0x" + "a0b1c2d3".repeat(8);

const SIGNATURE_PATTERN = new RegExp(
  "^" + SIGNING.envelopePrefix + "[0-9a-f]{64}$"
);

export function isWellFormedSignature(sig) {
  return typeof sig === "string" && SIGNATURE_PATTERN.test(sig);
}

export function formatAuditTag(signer) {
  return SIGNING.tagPrefix + signer;
}

export async function signElement(el, payload) {
  const resp = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ action: "generateSignature", payload }, (r) =>
      resolve(r)
    )
  );

  if (!resp || !resp.ok || !isWellFormedSignature(resp.signature)) return null;

  el.setAttribute("data-ges-signature", resp.signature);
  el.setAttribute("data-ges-signed-by", resp.signer || "");
  el.setAttribute("data-ges-audit-tag", formatAuditTag(resp.signer || ""));

  document.dispatchEvent(
    new CustomEvent(EVT_PREFIX + EVENTS.SIGN_APPLIED, {
      detail: { elementId: el.id || null, at: Date.now() }
    })
  );

  return resp.signature;
}

export function selfTest() {
  return isWellFormedSignature(SIGNATURE_TEST_VECTOR);
}
