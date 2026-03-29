// ─────────────────────────────────────────────────────────────
// RENDERING
// Functions that build and inject HTML into #content
// ─────────────────────────────────────────────────────────────

/** renderSubjects — builds the subject card grid on the home view */
function renderSubjects() {
  view = "subjects";
  setTitle("All Subjects", [
    { label: "CS Portal", action: null },
    { label: "Subjects",  action: null }
  ]);
  updateCount();

  let h = `
    <div style="margin-bottom:20px">
      <div class="section-header">
        <div>
          <div class="section-title">Your Subjects</div>
          <div class="section-sub">Select a subject to browse resources</div>
        </div>
      </div>
    </div>
    <div class="grid">`;

  subjects.forEach((s, i) => {
    const n = files.filter(f => f.subject === s.name && f.status === "approved").length;
    h += `
      <div class="sub-card" onclick="openSubject('${s.name}')" style="animation-delay:${i * 40}ms">
        <div class="sub-icon" style="background:${s.color}">${s.icon}</div>
        <div class="sub-name">${s.name}</div>
        <div class="sub-meta">${n} resource${n !== 1 ? "s" : ""}</div>
      </div>`;
  });

  id("content").innerHTML = h + "</div>";
}

/**
 * openSubject — opens a subject's folder grid.
 * @param {string} name
 */
function openSubject(name) {
  currentSubject = name;
  view = "folders";
  id("statsRow").style.display = "none";
  id("backBtn").style.display  = "block";
  setTitle(name, [
    { label: "CS Portal", action: "goHome()" },
    { label: "Subjects",  action: "goHome()" },
    { label: name,        action: null }
  ]);

  let h = '<div class="grid">';
  folders.forEach((f, i) => {
    const n = files.filter(x => x.subject === name && x.folder === f.name && x.status === "approved").length;
    h += `
      <div class="folder-card" onclick="openFolder('${f.name}')" style="animation-delay:${i * 50}ms">
        <div class="folder-icon">${f.icon}</div>
        <div class="folder-name">${f.name}</div>
        <div class="sub-meta" style="margin-top:6px;font-size:11px;">${n} file${n !== 1 ? "s" : ""}</div>
      </div>`;
  });

  id("content").innerHTML = h + "</div>";
}

/** openFolder — sets currentFolder and triggers the file list view */
function openFolder(name) {
  currentFolder = name;
  view = "files";
  renderFiles();
}

/**
 * renderFiles — renders the file list for current subject + folder.
 *
 * Layout:
 *   1. Upload zone
 *   2. Approval-workflow notice
 *   3. Approved files (all users)
 *   4. Pending files (admin only, with approve/reject buttons)
 *
 * TODO: replace files[] filter with GET /api/files?subject=&folder=
 */
function renderFiles() {
  setTitle(currentFolder, [
    { label: "CS Portal",    action: "goHome()" },
    { label: "Subjects",     action: "goHome()" },
    { label: currentSubject, action: `openSubject('${currentSubject}')` },
    { label: currentFolder,  action: null }
  ]);

  const approved  = files.filter(f => f.subject === currentSubject && f.folder === currentFolder && f.status === "approved");
  const pending   = files.filter(f => f.subject === currentSubject && f.folder === currentFolder && f.status === "pending");
  const myPending = pending.filter(f => f.user === user).length;

  let h = `
    <div class="upload-zone" onclick="triggerUpload()">
      <div class="upload-icon">⬆</div>
      <div class="upload-text"><strong>Click to upload</strong> a file</div>
    </div>
    <div class="upload-notice">
      <div class="upload-notice-dot"></div>
      Uploaded files are sent for admin review before becoming visible to others
      ${myPending > 0
        ? ` &nbsp;·&nbsp; <strong style="color:#fbbf24">${myPending} of your file${myPending > 1 ? "s" : ""} pending approval</strong>`
        : ""}
    </div>
    <div class="file-list">`;

  if (!approved.length && !(isAdmin && pending.length)) {
    h += `<div class="empty"><div class="empty-icon">📂</div><div class="empty-text">No files yet</div></div>`;
  }

  approved.forEach(f => {
    h += `
      <div class="file-row">
        <div class="file-type-icon">📄</div>
        <div class="file-info">
          <div class="file-name">${f.name}</div>
          <div class="file-meta">By ${f.user}</div>
        </div>
        <span class="file-status status-approved">✓ Approved</span>
      </div>`;
  });

  if (isAdmin && pending.length) {
    h += `<div style="margin:16px 0 10px;font-size:12px;color:var(--muted);font-weight:600;letter-spacing:.05em;text-transform:uppercase;">Pending Review</div>`;
    pending.forEach(f => {
      const idx = files.indexOf(f);
      h += `
        <div class="file-row">
          <div class="file-type-icon" style="background:rgba(251,191,36,0.12)">📄</div>
          <div class="file-info">
            <div class="file-name">${f.name}</div>
            <div class="file-meta">By ${f.user}</div>
          </div>
          <span class="file-status status-pending">Pending</span>
          <div class="file-actions">
            <button class="btn btn-success btn-sm" onclick="approve(${idx})">✓</button>
            <button class="btn btn-danger  btn-sm" onclick="reject(${idx})">✕</button>
          </div>
        </div>`;
    });
  }

  id("content").innerHTML = h + "</div>";
}

/**
 * searchFiles — filters approved files by name (case-insensitive).
 * TODO: replace with GET /api/files/search?q=
 * @param {string} q
 */
function searchFiles(q) {
  if (!q) {
    if (view === "subjects") renderSubjects();
    return;
  }
  q = q.toLowerCase();
  setTitle("Search Results", [
    { label: "CS Portal",      action: "goHome()" },
    { label: "Search Results", action: null }
  ]);
  id("statsRow").style.display = "none";

  const res = files.filter(f => f.name.toLowerCase().includes(q) && f.status === "approved");

  let h = '<div class="file-list">';
  if (!res.length) {
    h += `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-text">No results for "${q}"</div></div>`;
  }
  res.forEach(f => {
    h += `
      <div class="file-row">
        <div class="file-type-icon">📄</div>
        <div class="file-info">
          <div class="file-name">${f.name}</div>
          <div class="file-meta">${f.subject} · ${f.folder}</div>
        </div>
        <span class="file-status status-approved">✓</span>
      </div>`;
  });

  id("content").innerHTML = h + "</div>";
}
