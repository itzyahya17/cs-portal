// ─────────────────────────────────────────────────────────────
// NAVIGATION
// goHome, goBack, breadcrumbs, sidebar active state
// ─────────────────────────────────────────────────────────────

/** Navigate to the subjects home view */
function goHome() {
  currentSubject = null;
  currentFolder  = null;
  view = "subjects";
  id("statsRow").style.display = "grid";
  id("backBtn").style.display  = "none";
  setActive("navHome");
  renderSubjects();
}

/**
 * goBack — context-sensitive:
 *   files view   → returns to folder list of current subject
 *   folders view → returns to subjects home
 */
function goBack() {
  if (view === "files") {
    currentFolder = null;
    view = "folders";
    id("statsRow").style.display = "none";
    id("backBtn").style.display  = "block";
    openSubject(currentSubject);
  } else {
    goHome();
  }
}

/**
 * setActive — highlights the correct sidebar nav item.
 * @param {string} elId
 */
function setActive(elId) {
  document.querySelectorAll(".nav-item").forEach(e => e.classList.remove("active"));
  const el = id(elId);
  if (el) el.classList.add("active");
}

/** toggleUserMenu — opens or closes the logout dropdown */
function toggleUserMenu() {
  const m    = id("userMenu");
  const open = m.style.display === "block";
  m.style.display             = open ? "none" : "block";
  id("menuArrow").textContent = open ? "▲" : "▼";
}

/**
 * buildBreadcrumb — renders a clickable breadcrumb trail.
 * @param {Array<{label: string, action: string|null}>} crumbs
 */
function buildBreadcrumb(crumbs) {
  let html = "";
  crumbs.forEach((c, i) => {
    if (i > 0) html += `<span class="bc-sep">/</span>`;
    html += c.action
      ? `<span class="bc-link" onclick="${c.action}">${c.label}</span>`
      : `<span class="bc-current">${c.label}</span>`;
  });
  id("breadcrumb").innerHTML = html;
}

/**
 * setTitle — updates page heading and breadcrumb together.
 * @param {string} t
 * @param {Array}  crumbs
 */
function setTitle(t, crumbs) {
  id("pageTitle").textContent = t;
  buildBreadcrumb(crumbs);
}
