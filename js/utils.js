// ─────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Shorthand for document.getElementById
 * @param {string} x
 * @returns {HTMLElement}
 */
function id(x) { return document.getElementById(x); }

/**
 * updateCount — syncs approved file count to:
 *   #fileCount      → dashboard stats row
 *   #loginFileCount → login page left panel
 */
function updateCount() {
  const n = files.filter(f => f.status === "approved").length;
  id("fileCount").textContent = n;
  const loginEl = id("loginFileCount");
  if (loginEl) loginEl.textContent = n;
}

/**
 * showMsg — displays a styled inline alert box.
 * @param {string} elId
 * @param {string} text
 * @param {string} type — "success" | "error"
 */
function showMsg(elId, text, type) {
  const e = id(elId);
  e.textContent   = text;
  e.className     = "info-box " + type;
  e.style.display = "block";
}

/**
 * hideMsg — hides an inline alert box.
 * @param {string} elId
 */
function hideMsg(elId) { id(elId).style.display = "none"; }

/**
 * showToast — briefly shows the bottom-right toast notification.
 * Auto-dismisses after 2.8 seconds.
 * @param {string} msg
 * @param {string} type — "success" | "danger"
 */
function showToast(msg, type = "success") {
  id("toastMsg").textContent      = msg;
  id("toastDot").style.background = type === "danger" ? "var(--danger)" : "var(--success)";
  id("toast").classList.add("show");
  setTimeout(() => id("toast").classList.remove("show"), 2800);
}
