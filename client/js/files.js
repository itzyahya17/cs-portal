// ─────────────────────────────────────────────────────────────
// FILE MANAGEMENT — upload, drag-drop, approve, reject, delete, rename
// ─────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 50 * 1024 * 1024;

// Track if uploading to course or exam section
window._uploadSection = 'course';

function triggerUpload() {
  const inp = id('globalFileInput');
  inp.value = '';
  inp.click();
}

function handleFileSelect() {
  const files = id('globalFileInput').files;
  if (files.length > 0) uploadFile(files[0]);
}

function uploadFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    showToast(`File too large (${formatSize(file.size)}). Max: 50 MB`, 'danger');
    return;
  }

  const section = window._uploadSection || 'course';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('subject', currentSubject);
  formData.append('folder', currentFolder);
  formData.append('section', section);
  formData.append('semester', currentSemester);

  const progressWrap = id('uploadProgress');
  const progressFill = id('progressFill');
  const progressText = id('progressText');
  if (progressWrap) progressWrap.style.display = 'block';

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', e => {
    if (e.lengthComputable) {
      const pct = Math.round((e.loaded / e.total) * 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (progressText) progressText.textContent = `Uploading... ${pct}% (${formatSize(e.loaded)} / ${formatSize(e.total)})`;
    }
  });

  xhr.addEventListener('load', () => {
    if (progressWrap) progressWrap.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
    if (xhr.status >= 200 && xhr.status < 300) {
      const data = JSON.parse(xhr.responseText);
      showToast(data.message || 'Upload complete!', 'success');
      if (view === 'exam-files') renderExamFiles();
      else renderFiles();
      loadPendingBadge();
    } else {
      try { showToast(JSON.parse(xhr.responseText).error || 'Upload failed', 'danger'); }
      catch { showToast('Upload failed', 'danger'); }
    }
  });

  xhr.addEventListener('error', () => {
    if (progressWrap) progressWrap.style.display = 'none';
    if (progressFill) progressFill.style.width = '0%';
    showToast('Connection error', 'danger');
  });

  xhr.open('POST', API_URL + '/files/upload');
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.send(formData);
}

function setupDragDrop() {
  const zone = id('dropZone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', e => { e.preventDefault(); zone.classList.remove('drag-over'); });
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) uploadFile(e.dataTransfer.files[0]);
  });
}

// ─── Approve / Reject / Delete / Rename ──────────────────────

async function approveFile(fileId) {
  try {
    await api(`/files/${fileId}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) });
    showToast('File approved!', 'success');
    if (view === 'admin') showAdmin();
    else if (view === 'exam-files') renderExamFiles();
    else renderFiles();
    loadPendingBadge();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function rejectFile(fileId) {
  const yes = await showModal('Reject File', 'This will remove the file. Are you sure?', 'Reject', true);
  if (!yes) return;
  try {
    await api(`/files/${fileId}`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) });
    showToast('File rejected', 'warning');
    if (view === 'admin') showAdmin();
    else if (view === 'exam-files') renderExamFiles();
    else renderFiles();
    loadPendingBadge();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function deleteFile(fileId) {
  const yes = await showModal('Delete File', 'Permanently delete this file from Google Drive and the portal?', 'Delete Permanently', true);
  if (!yes) return;
  try {
    await api(`/files/${fileId}`, { method: 'DELETE' });
    showToast('File deleted', 'warning');
    if (view === 'exam-files') renderExamFiles();
    else renderFiles();
    loadPendingBadge();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function renameFile(fileId, currentName) {
  const newName = prompt('Rename file:', currentName);
  if (!newName || newName.trim() === currentName) return;
  try {
    await api(`/files/${fileId}/rename`, { method: 'PATCH', body: JSON.stringify({ name: newName.trim() }) });
    showToast('File renamed', 'success');
    if (view === 'exam-files') renderExamFiles();
    else renderFiles();
  } catch (err) { showToast(err.message, 'danger'); }
}

// Backward-compat
function approve(fId) { approveFile(fId); }
function reject(fId)  { rejectFile(fId); }
