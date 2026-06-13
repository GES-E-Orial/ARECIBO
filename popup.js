const STORAGE_KEYS = {
  PROFILE: "employeeProfile",
  AUTH_TOKEN: "authToken",
  SIGN_COUNT: "signaturesApplied",
  LAST_SIGN: "lastSignedAt"
};

function formatTime(ts) {
  if (!ts) return "-";
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return new Date(ts).toLocaleDateString();
}

async function render() {
  const data = await chrome.storage.local.get([
    STORAGE_KEYS.PROFILE,
    STORAGE_KEYS.SIGN_COUNT,
    STORAGE_KEYS.LAST_SIGN
  ]);

  const profile = data[STORAGE_KEYS.PROFILE];
  document.getElementById("emp-name").textContent =
    profile ? profile.displayName || profile.employeeId : "-";
  document.getElementById("emp-role").textContent =
    profile ? (profile.department || "") + (profile.role ? " · " + profile.role : "") : "-";
  document.getElementById("sig-count").textContent = data[STORAGE_KEYS.SIGN_COUNT] || 0;
  document.getElementById("last-sign").textContent = formatTime(data[STORAGE_KEYS.LAST_SIGN]);
  document.getElementById("ver-label").textContent =
    "v" + chrome.runtime.getManifest().version;
}

document.getElementById("sign-btn").addEventListener("click", async () => {
  const btn = document.getElementById("sign-btn");
  btn.textContent = "Generating…";
  btn.disabled = true;

  chrome.runtime.sendMessage({ action: "generateSignature" }, (resp) => {
    btn.textContent = "Generate Signature";
    btn.disabled = false;

    if (!resp || !resp.ok) return;

    const out = document.getElementById("sig-output");
    document.getElementById("sig-value").textContent = resp.signature;
    out.style.display = "block";

    render();
  });
});

document.getElementById("copy-btn").addEventListener("click", () => {
  const val = document.getElementById("sig-value").textContent;
  navigator.clipboard.writeText(val).then(() => {
    const btn = document.getElementById("copy-btn");
    btn.textContent = "Copied";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 1500);
  });
});

render();
