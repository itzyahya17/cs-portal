// ─────────────────────────────────────────────────────────────
// EXAM CENTRE — separate section for past papers & exam prep
// ─────────────────────────────────────────────────────────────

async function showExamCentre() {
  view = 'exam';
  id('statsRow').style.display = 'none';
  id('backBtn').style.display  = 'block';
  setActive('navExam');
  setTitle('Exam Centre', [
    { label: 'CS Portal',     action: 'goHome()' },
    { label: 'Exam Centre',   action: null },
  ]);

  const subjects = getSubjects();
  if (!subjects.length) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">🔒</div><div class="empty-text">No subjects available this semester</div></div>`;
    return;
  }

  id('content').innerHTML = skeletonCards(subjects.length);

  try {
    const stats = await api(`/files/stats?semester=${currentSemester}`);

    let h = `
      <div style="margin-bottom:20px">
        <div class="section-header">
          <div>
            <div class="section-title">📝 Exam Centre</div>
            <div class="section-sub">Past papers, solved papers, and exam preparation materials</div>
          </div>
        </div>
      </div>
      <div class="grid">`;

    subjects.forEach((s, i) => {
      const n = stats.bySubject[s.name] || 0;
      h += `
        <div class="sub-card" onclick="openExamSubject('${s.code}')" style="animation-delay:${i * 50}ms">
          <div class="sub-icon" style="background:${s.color}">${s.icon}</div>
          <div class="sub-code">${s.code}</div>
          <div class="sub-name">${s.name}</div>
          <div class="sub-meta">
            <span>${s.credits} CH</span>
            <span class="sub-dot">·</span>
            <span>Exam materials</span>
          </div>
        </div>`;
    });

    id('content').innerHTML = h + '</div>';
  } catch (err) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

async function openExamSubject(code) {
  const sub = getSubjects().find(s => s.code === code);
  if (!sub) return;
  currentSubject = sub.name;
  view = 'exam-folders';
  setTitle(sub.name + ' — Exam Centre', [
    { label: 'CS Portal',    action: 'goHome()' },
    { label: 'Exam Centre',  action: 'showExamCentre()' },
    { label: sub.code,       action: null },
  ]);

  id('content').innerHTML = skeletonCards(5);

  try {
    const files = await api(`/files?subject=${encodeURIComponent(sub.name)}&section=exam&semester=${currentSemester}`);

    let h = `
      <div class="subject-banner" style="border-left: 3px solid ${sub.accent}">
        <div class="subject-banner-icon" style="background:${sub.color}">${sub.icon}</div>
        <div>
          <div class="subject-banner-title">${sub.name} — Exam Centre</div>
          <div class="subject-banner-meta">${sub.code} · ${sub.credits} CH · ${sub.teacher}</div>
        </div>
      </div>
      <div class="grid">`;

    examFolders.forEach((f, i) => {
      const n = files.filter(x => x.folder === f.name && x.status === 'approved').length;
      h += `
        <div class="folder-card" onclick="openExamFolder('${f.name}')" style="animation-delay:${i * 50}ms">
          <div class="folder-icon">${f.icon}</div>
          <div class="folder-name">${f.name}</div>
          <div class="sub-meta" style="margin-top:6px">${n} file${n !== 1 ? 's' : ''}</div>
        </div>`;
    });

    id('content').innerHTML = h + '</div>';
  } catch (err) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

function openExamFolder(name) {
  currentFolder = name;
  view = 'exam-files';
  renderExamFiles();
}

async function renderExamFiles() {
  const sub = getSubjects().find(s => s.name === currentSubject);
  setTitle(currentFolder, [
    { label: 'CS Portal',     action: 'goHome()' },
    { label: 'Exam Centre',   action: 'showExamCentre()' },
    { label: sub ? sub.code : currentSubject, action: `openExamSubject('${sub?.code}')` },
    { label: currentFolder,   action: null },
  ]);

  id('content').innerHTML = skeletonList(4);

  try {
    const files = await api(`/files?subject=${encodeURIComponent(currentSubject)}&folder=${encodeURIComponent(currentFolder)}&section=exam&semester=${currentSemester}`);

    const approved = files.filter(f => f.status === 'approved');
    const pending  = files.filter(f => f.status === 'pending');

    let h = `
      <div class="upload-zone" id="dropZone" onclick="triggerExamUpload()">
        <div class="upload-icon">⬆</div>
        <div class="upload-text"><strong>Click or drag & drop</strong> to upload exam materials</div>
        <div style="font-size:11px;color:var(--muted);margin-top:6px">Max 50 MB per file</div>
      </div>
      <div id="uploadProgress" class="upload-progress-wrap" style="display:none">
        <div class="upload-progress-bar"><div class="upload-progress-fill" id="progressFill"></div></div>
        <div class="upload-progress-text" id="progressText">Uploading...</div>
      </div>`;

    if (currentUser.role === 'student') {
      h += `<div class="upload-notice"><div class="upload-notice-dot"></div>Exam materials you upload will be reviewed by an admin</div>`;
    }

    h += '<div class="file-list">';

    if (!approved.length && !pending.length) {
      h += `<div class="empty"><div class="empty-icon">📂</div><div class="empty-text">No exam materials yet</div><div style="margin-top:8px;font-size:12px;color:var(--muted)">Upload past papers to help your classmates!</div></div>`;
    }

    approved.forEach((f, i) => {
      const uploaderName = f.uploader?.full_name || 'Unknown';
      h += `
        <div class="file-row" style="animation-delay:${i * 40}ms">
          ${f.pinned ? '<div class="pin-badge">📌</div>' : ''}
          <div class="file-type-icon" style="background:${fileColor(f.name)}">${fileIcon(f.name)}</div>
          <div class="file-info">
            <div class="file-name">${f.name}</div>
            <div class="file-meta">${formatSize(f.file_size)} · ${uploaderName} · ${timeAgo(f.created_at)}</div>
          </div>
          <a href="${f.drive_url}" target="_blank" class="btn btn-ghost btn-sm file-view-btn">View ↗</a>
          ${currentUser.role === 'admin' ? `<button class="btn btn-danger btn-sm" onclick="deleteFile('${f.id}')">✕</button>` : ''}
        </div>`;
    });

    if (pending.length) {
      h += `<div class="file-section-label">⏳ Pending Review (${pending.length})</div>`;
      pending.forEach((f, i) => {
        h += `
          <div class="file-row file-row-pending" style="animation-delay:${(approved.length + i) * 40}ms">
            <div class="file-type-icon" style="background:rgba(251,191,36,0.12)">${fileIcon(f.name)}</div>
            <div class="file-info">
              <div class="file-name">${f.name}</div>
              <div class="file-meta">${formatSize(f.file_size)} · ${timeAgo(f.created_at)}</div>
            </div>
            ${statusBadge('pending')}
            ${currentUser.role === 'admin' ? `
              <div class="file-actions">
                <button class="btn btn-success btn-sm" onclick="approveFile('${f.id}')">✓</button>
                <button class="btn btn-danger btn-sm" onclick="rejectFile('${f.id}')">✕</button>
              </div>` : ''}
          </div>`;
      });
    }

    id('content').innerHTML = h + '</div>';
    setupDragDrop();
  } catch (err) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

function triggerExamUpload() {
  // Mark that the next upload is for exam section
  window._uploadSection = 'exam';
  triggerUpload();
}
