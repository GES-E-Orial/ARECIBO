// GES Arecibo - configuration
// IT Security Division, Good Enough Space

export const ORG = {
  shortName: "GES",
  name: "Good Enough Space",
  host: "goodenoughspace",
  tld: "com"
};

export const PORTAL = {
  subdomain: "sign"
};

export const MSG = {
  NS: "GES",
  SIGN_REQUEST: "SIGN_REQUEST",
  SIGN_RESPONSE: "SIGN_RESPONSE"
};

export const BUILD = {
  channel: "stable",
  flavor: "prod"
};

export const SIGNING = {
  salt: "ges-secure-sign-v2",
  envelopePrefix: "0x",
  tagPrefix: "#"
};

export const STORAGE_KEYS = {
  PROFILE: "employeeProfile",
  AUTH_TOKEN: "authToken",
  SIGN_COUNT: "signaturesApplied",
  LAST_SIGN: "lastSignedAt"
};

export const EVENTS = {
  RIBBON_SHOWN: "ribbon-shown",
  SIGN_APPLIED: "signature-applied",
  CONTEXT: "context-ready"
};

export const EVT_PREFIX = "ges:";

export const FLAGS = {
  enableRibbon: true,
  enableSignControls: true,
  enableContextBroadcast: true,
  enablePortalBridge: true
};
