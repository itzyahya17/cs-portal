// ─────────────────────────────────────────────────────────────
// NAVIGATION — routing, breadcrumbs, sidebar, semesters
// ─────────────────────────────────────────────────────────────

function goHome() {
  currentSubject = null;
  currentFolder  = null;
  view = 'subjects';
  id('statsRow').style.display = 'grid';
  id('backBtn').style.display  = 'none';
  setActive('navHome');
  renderSubjects();
}

function goBack() {
  if (view === 'files')        { currentFolder = null; view = 'folders'; openSubject(getSubjects().find(s => s.name === currentSubject)?.code); }
  else if (view === 'folders') { goHome(); }
  else if (view === 'exam-files')   { const sub = getSubjects().find(s => s.name === currentSubject); openExamSubject(sub?.code); }
  else if (view === 'exam-folders') { showExamCentre(); }
  else { goHome(); }
}

function setActive(elId) {
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  const el = id(elId);
  if (el) el.classList.add('active');
}

function toggleUserMenu() {
  const m = id('userMenu');
  const open = m.style.display === 'block';
  m.style.display = open ? 'none' : 'block';
  id('menuArrow').textContent = open ? '▲' : '▼';
}

function buildBreadcrumb(crumbs) {
  let html = '';
  crumbs.forEach((c, i) => {
    if (i > 0) html += '<span class="bc-sep">/</span>';
    html += c.action
      ? `<span class="bc-link" onclick="${c.action}">${c.label}</span>`
      : `<span class="bc-current">${c.label}</span>`;
  });
  id('breadcrumb').innerHTML = html;
}

function setTitle(t, crumbs) {
  id('pageTitle').textContent = t;
  buildBreadcrumb(crumbs);
}

// ─── Semester Selector ───────────────────────────────────────

function renderSemesterSelector() {
  let h = '<div class="semester-selector">';
  h += '<div class="semester-label">Semesters</div>';
  h += '<div class="semester-pills">';
  semesters.forEach(s => {
    const isCurrent = s.id === currentSemester;
    const locked = !s.active;
    h += `
      <div class="semester-pill ${isCurrent ? 'active' : ''} ${locked ? 'locked' : ''}"
           ${!locked ? `onclick="switchSemester(${s.id})"` : ''}
           title="${s.name} · ${s.period}${locked ? ' (Coming Soon)' : ''}">
        <span class="semester-num">${s.id}</span>
        ${locked ? '<span class="semester-lock">🔒</span>' : ''}
      </div>`;
  });
  h += '</div></div>';
  return h;
}

function switchSemester(semId) {
  const sem = getSemester(semId);
  if (!sem || !sem.active) {
    showToast('This semester is not available yet', 'warning');
    return;
  }
  currentSemester = semId;
  goHome();
}

// ─── Mobile Sidebar ──────────────────────────────────────────

function toggleMobileSidebar() {
  document.querySelector('.sidebar').classList.toggle('open');
  const overlay = id('sidebarOverlay');
  overlay.classList.toggle('show');
}

function closeMobileSidebar() {
  document.querySelector('.sidebar').classList.remove('open');
  const o = id('sidebarOverlay');
  if (o) o.classList.remove('show');
}

// ─── Keyboard Shortcuts ─────────────────────────────────────

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = id('confirmModal');
    if (modal && modal.classList.contains('show')) { modal.classList.remove('show'); }
    else if (view !== 'subjects') { goBack(); }
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const s = document.querySelector('.search-bar input');
    if (s) s.focus();
    return;
  }
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if (active && active.classList.contains('inp')) {
      const page = active.closest('.auth-page');
      if (page) {
        if (page.id === 'loginPage') login();
        else if (page.id === 'signupPage') signup();
        else if (page.id === 'forgotPage') sendReset();
      }
    }
  }
});

// ─── My Uploads ──────────────────────────────────────────────

async function showMyUploads() {
  view = 'myuploads';
  id('statsRow').style.display = 'none';
  id('backBtn').style.display  = 'block';
  setActive('navUploads');
  setTitle('My Uploads', [
    { label: 'CS Portal',   action: 'goHome()' },
    { label: 'My Uploads',  action: null },
  ]);

  id('content').innerHTML = skeletonList(5);

  try {
    const files = await api('/files');
    const myFiles = files.filter(f => f.uploaded_by === currentUser.id);

    let h = '';
    if (!myFiles.length) {
      h = `<div class="empty"><div class="empty-icon">📂</div><div class="empty-text">You haven't uploaded anything yet</div></div>`;
    } else {
      h = '<div class="file-list">';
      myFiles.forEach(f => {
        h += `
          <div class="file-row" style="animation: cardIn .3s cubic-bezier(0.16,1,0.3,1) both">
            <div class="file-type-icon" style="background:${fileColor(f.name)}">${fileIcon(f.name)}</div>
            <div class="file-info">
              <div class="file-name">${f.name}</div>
              <div class="file-meta">${f.subject} / ${f.folder} · ${f.section === 'exam' ? '📝 Exam' : '📚 Course'} · ${formatSize(f.file_size)} · ${timeAgo(f.created_at)}</div>
            </div>
            ${statusBadge(f.status)}
          </div>`;
      });
      h += '</div>';
    }
    id('content').innerHTML = h;
  } catch (err) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}
