// ─────────────────────────────────────────────────────────────
// ADMIN PANEL
// Only reachable by admin users (nav item hidden for students)
//
// NOTE FOR BACKEND INTEGRATION:
// showAdmin → GET /api/files?status=pending
// ─────────────────────────────────────────────────────────────

/**
 * showAdmin — renders all pending files across every subject/folder
 * with approve / reject controls.
 */
function showAdmin() {
  id("statsRow").style.display = "none";
  view = "admin";
  setActive("navAdmin");
  setTitle("Admin Panel", [
    { label: "CS Portal",   action: null },
    { label: "Admin Panel", action: null }
  ]);

  const pending = files.filter(f => f.status === "pending");

  let h = `
    <div class="pending-header">
      <div class="section-title">Pending Approvals</div>
      <span class="pending-count">${pending.length} pending</span>
    </div>
    <div class="file-list">`;

  if (!pending.length) {
    h += `<div class="empty"><div class="empty-icon">✓</div><div class="empty-text">No pending files</div></div>`;
  }

  pending.forEach(f => {
    const idx = files.indexOf(f);
    h += `
      <div class="file-row">
        <div class="file-type-icon" style="background:rgba(251,191,36,0.12)">📄</div>
        <div class="file-info">
          <div class="file-name">${f.name}</div>
          <div class="file-meta">${f.user} · ${f.subject} / ${f.folder}</div>
        </div>
        <span class="file-status status-pending">Pending</span>
        <div class="file-actions">
          <button class="btn btn-success btn-sm" onclick="approveAdmin(${idx})">✓ Approve</button>
          <button class="btn btn-danger  btn-sm" onclick="rejectAdmin(${idx})">✕ Reject</button>
        </div>
      </div>`;
  });

  id("content").innerHTML = h + "</div>";
}
