// ─────────────────────────────────────────────────────────────
// RENDERING — subjects, folders, files, search
// ─────────────────────────────────────────────────────────────

async function renderSubjects() {
  view = 'subjects';
  id('statsRow').style.display = 'grid';
  id('backBtn').style.display  = 'none';
  setActive('navHome');
  const sem = getSemester();
  setTitle(sem.name, [
    { label: 'CS Portal',  action: null },
    { label: sem.name,     action: null },
  ]);

  id('content').innerHTML = skeletonCards(8);

  try {
    const stats = await api(`/files/stats?semester=${currentSemester}`);

    animateCounter(id('statSubjects'), getSubjects().length);
    animateCounter(id('statCredits'), getTotalCredits());
    animateCounter(id('statFiles'), stats.total);

    // Build announcement widget
    const announcementWidget = await renderAnnouncementWidget();

    const subjects = getSubjects();
    let h = renderSemesterSelector();

    h += announcementWidget;

    if (!subjects.length) {
      h += `<div class="empty" style="margin-top:40px"><div class="empty-icon">🔒</div><div class="empty-text">This semester is not yet available</div><div style="margin-top:8px;font-size:12px;color:var(--muted)">Subjects will be added when the semester begins</div></div>`;
    } else {
      h += `
        <div style="margin-bottom:20px;margin-top:8px">
          <div class="section-header">
            <div>
              <div class="section-title">Your Subjects</div>
              <div class="section-sub">${sem.period} · ${subjects.length} courses · ${getTotalCredits()} credit hours</div>
            </div>
          </div>
        </div>
        <div class="grid">`;

      subjects.forEach((s, i) => {
        const n = stats.bySubject[s.name] || 0;
        h += `
          <div class="sub-card" onclick="openSubject('${s.code}')" style="animation-delay:${i * 50}ms">
            <div class="sub-icon" style="background:${s.color}">${s.icon}</div>
            <div class="sub-code">${s.code}</div>
            <div class="sub-name">${s.name}</div>
            <div class="sub-meta">
              <span>${s.credits} CH</span>
              <span class="sub-dot">·</span>
              <span>${n} file${n !== 1 ? 's' : ''}</span>
            </div>
            <div class="sub-teacher">${s.teacher}</div>
          </div>`;
      });
      h += '</div>';
    }

    id('content').innerHTML = h;
  } catch (err) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

async function openSubject(code) {
  const sub = getSubjects().find(s => s.code === code);
  if (!sub) return;
  currentSubject = sub.name;
  view = 'folders';
  id('statsRow').style.display = 'none';
  id('backBtn').style.display  = 'block';
  setTitle(sub.name, [
    { label: 'CS Portal', action: 'goHome()' },
    { label: getSemester().name, action: 'goHome()' },
    { label: sub.code,    action: null },
  ]);

  id('content').innerHTML = skeletonCards(6);

  try {
    const files = await api(`/files?subject=${encodeURIComponent(sub.name)}&section=course&semester=${currentSemester}`);

    let h = `
      <div class="subject-banner" style="border-left: 3px solid ${sub.accent}">
        <div class="subject-banner-icon" style="background:${sub.color}">${sub.icon}</div>
        <div>
          <div class="subject-banner-title">${sub.name}</div>
          <div class="subject-banner-meta">${sub.code} · ${sub.credits} Credit Hours · ${sub.teacher}</div>
        </div>
      </div>
      <div class="grid">`;

    folders.forEach((f, i) => {
      const n = files.filter(x => x.folder === f.name && x.status === 'approved').length;
      h += `
        <div class="folder-card" onclick="openFolder('${f.name}')" style="animation-delay:${i * 50}ms">
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

function openFolder(name) {
  currentFolder = name;
  view = 'files';
  window._uploadSection = 'course';
  renderFiles();
}

async function renderFiles() {
  const sub = getSubjects().find(s => s.name === currentSubject);
  setTitle(currentFolder, [
    { label: 'CS Portal',    action: 'goHome()' },
    { label: getSemester().name, action: 'goHome()' },
    { label: sub ? sub.code : currentSubject, action: `openSubject('${sub?.code}')` },
    { label: currentFolder,  action: null },
  ]);

  id('content').innerHTML = skeletonList(4);

  try {
    const files = await api(`/files?subject=${encodeURIComponent(currentSubject)}&folder=${encodeURIComponent(currentFolder)}&section=course&semester=${currentSemester}`);

    const approved = files.filter(f => f.status === 'approved');
    const pending  = files.filter(f => f.status === 'pending');

    let h = `
      <div class="upload-zone" id="dropZone" onclick="triggerUpload()">
        <div class="upload-icon">⬆</div>
        <div class="upload-text"><strong>Click or drag & drop</strong> to upload files</div>
        <div style="font-size:11px;color:var(--muted);margin-top:6px">Max 50 MB per file</div>
      </div>
      <div id="uploadProgress" class="upload-progress-wrap" style="display:none">
        <div class="upload-progress-bar"><div class="upload-progress-fill" id="progressFill"></div></div>
        <div class="upload-progress-text" id="progressText">Uploading...</div>
      </div>`;

    if (currentUser.role === 'student') {
      h += `<div class="upload-notice"><div class="upload-notice-dot"></div>Files you upload will be reviewed by an admin before becoming visible</div>`;
    }

    h += '<div class="file-list">';

    if (!approved.length && !pending.length) {
      h += `<div class="empty"><div class="empty-icon">📂</div><div class="empty-text">No files in this folder yet</div></div>`;
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
          ${currentUser.role === 'admin' ? `
            <button class="btn btn-ghost btn-sm" onclick="renameFile('${f.id}','${f.name.replace(/'/g, "\\'")}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="deleteFile('${f.id}')">✕</button>` : ''}
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

const debouncedSearch = debounce(async (q) => {
  if (!q) { if (view === 'subjects' || !currentSubject) renderSubjects(); return; }
  setTitle('Search Results', [{ label: 'CS Portal', action: 'goHome()' }, { label: 'Search', action: null }]);
  id('statsRow').style.display = 'none';
  id('content').innerHTML = skeletonList(4);
  try {
    const files = await api(`/files?semester=${currentSemester}`);
    const results = files.filter(f => f.name.toLowerCase().includes(q.toLowerCase()) && f.status === 'approved');
    let h = '<div class="file-list">';
    if (!results.length) {
      h += `<div class="empty"><div class="empty-icon">🔍</div><div class="empty-text">No results for "${q}"</div></div>`;
    }
    results.forEach((f, i) => {
      h += `
        <div class="file-row" style="animation-delay:${i * 40}ms">
          <div class="file-type-icon" style="background:${fileColor(f.name)}">${fileIcon(f.name)}</div>
          <div class="file-info">
            <div class="file-name">${f.name}</div>
            <div class="file-meta">${f.subject} / ${f.folder} · ${f.section === 'exam' ? '📝 Exam' : '📚 Course'} · ${formatSize(f.file_size)}</div>
          </div>
          <a href="${f.drive_url}" target="_blank" class="btn btn-ghost btn-sm file-view-btn">View ↗</a>
        </div>`;
    });
    id('content').innerHTML = h + '</div>';
  } catch (err) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}, 350);

function searchFiles(q) { debouncedSearch(q); }
