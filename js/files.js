// ─────────────────────────────────────────────────────────────
// FILE MANAGEMENT
// Upload, approve, reject
//
// NOTE FOR BACKEND INTEGRATION:
// triggerUpload / upload → POST /api/files/upload (multipart/form-data)
// approve / reject       → PATCH /api/files/:id/status
// ─────────────────────────────────────────────────────────────

/**
 * triggerUpload — opens the file picker.
 * Input value reset so same file can be re-selected.
 */
function triggerUpload() {
  id("globalFileInput").value = "";
  id("globalFileInput").click();
}

/**
 * upload — fires when user selects a file.
 * Adds to in-memory store with status "pending".
 * TODO: swap files.push() for a fetch() POST to backend,
 *       then refresh file list from API response.
 */
function upload() {
  const f = id("globalFileInput").files[0];
  if (!f) return;
  files.push({
    name:    f.name,
    user:    user,
    subject: currentSubject,
    folder:  currentFolder,
    status:  "pending"
  });
  showToast("Uploaded! Awaiting admin approval.");
  renderFiles();
  updateCount();
}

/**
 * approve / reject — used inside the folder file list (admin only).
 * Re-renders the file list after status change.
 * TODO: swap in-memory mutation for PATCH /api/files/:id/status
 * @param {number} i — index in files[]
 */
function approve(i) { files[i].status = "approved"; showToast("Approved!");           updateCount(); renderFiles(); }
function reject(i)  { files[i].status = "rejected"; showToast("Rejected.", "danger");                renderFiles(); }

/**
 * approveAdmin / rejectAdmin — used inside the Admin Panel view.
 * Same as above but re-renders the admin panel instead.
 * @param {number} i — index in files[]
 */
function approveAdmin(i) { files[i].status = "approved"; showToast("Approved!");           updateCount(); showAdmin(); }
function rejectAdmin(i)  { files[i].status = "rejected"; showToast("Rejected.", "danger");                showAdmin(); }
