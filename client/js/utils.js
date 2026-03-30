// ─────────────────────────────────────────────────────────────
// UTILITIES — helpers used throughout the app
// ─────────────────────────────────────────────────────────────

const API_URL = '/api';

/** Shorthand for getElementById */
function id(x) { return document.getElementById(x); }

// ─── Authenticated API helper ────────────────────────────────

/**
 * api — fetches from the backend, automatically attaching the
 * JWT token.  On 401 it forces a logout.
 * @param {string} path      e.g. '/files?subject=ICT'
 * @param {object} options   fetch options (method, body, headers …)
 * @returns {Promise<any>}   parsed JSON
 */
async function api(path, options = {}) {
  const headers = options.headers || {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  options.headers = headers;

  const res = await fetch(API_URL + path, options);

  if (res.status === 401) {
    // Session expired — force re-login
    logout();
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─── Toast Notifications ─────────────────────────────────────

let toastTimer = null;

/**
 * showToast — shows the bottom-right notification.
 * @param {string} msg
 * @param {'success'|'danger'|'warning'|'info'} type
 */
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  const t = id('toast');
  id('toastMsg').textContent = msg;
  const colors = {
    success: 'var(--success)',
    danger:  'var(--danger)',
    warning: '#fbbf24',
    info:    'var(--accent)',
  };
  id('toastDot').style.background = colors[type] || colors.success;
  t.classList.add('show');
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

// ─── Inline Messages ─────────────────────────────────────────

function showMsg(elId, text, type) {
  const e = id(elId);
  e.textContent   = text;
  e.className     = 'info-box ' + type;
  e.style.display = 'block';
}
function hideMsg(elId) {
  const e = id(elId);
  if (e) e.style.display = 'none';
}

// ─── Debounce ────────────────────────────────────────────────

function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// ─── File Helpers ────────────────────────────────────────────

/** Human-readable file size */
function formatSize(bytes) {
  if (!bytes || bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

/** Relative timestamp */
function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  if (s < 604800) return Math.floor(s / 86400) + 'd ago';
  return new Date(dateStr).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

/** File extension → icon mapping */
function fileIcon(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  const map = {
    pdf: '📕', doc: '📘', docx: '📘', odt: '📘',
    ppt: '📙', pptx: '📙', odp: '📙',
    xls: '📗', xlsx: '📗', csv: '📗',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', svg: '🖼️',
    mp4: '🎬', mkv: '🎬', avi: '🎬', mov: '🎬',
    mp3: '🎵', wav: '🎵', ogg: '🎵',
    zip: '📦', rar: '📦', '7z': '📦', tar: '📦',
    py: '🐍', js: '⚡', c: '⚙️', cpp: '⚙️', java: '☕', html: '🌐', css: '🎨',
    txt: '📄', md: '📄',
  };
  return map[ext] || '📄';
}

/** File extension → color class */
function fileColor(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'rgba(244,63,94,0.12)';
  if (['doc','docx','odt'].includes(ext)) return 'rgba(59,130,246,0.12)';
  if (['ppt','pptx','odp'].includes(ext)) return 'rgba(251,146,60,0.12)';
  if (['xls','xlsx','csv'].includes(ext)) return 'rgba(16,185,129,0.12)';
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return 'rgba(168,85,247,0.12)';
  if (['mp4','mkv','avi','mov'].includes(ext)) return 'rgba(236,72,153,0.12)';
  if (['zip','rar','7z'].includes(ext)) return 'rgba(251,191,36,0.12)';
  return 'rgba(99,102,241,0.12)';
}

// ─── Animated Counter ────────────────────────────────────────

function animateCounter(el, target, duration = 800) {
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  if (start === target) return;
  const diff = target - start;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(start + diff * ease);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── Modal ───────────────────────────────────────────────────

/**
 * showModal — displays a confirmation modal.
 * Returns a Promise that resolves true (confirm) or false (cancel).
 */
function showModal(title, message, confirmText = 'Confirm', danger = false) {
  return new Promise(resolve => {
    id('modalTitle').textContent = title;
    id('modalMessage').textContent = message;
    const confirmBtn = id('modalConfirm');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = 'login-btn' + (danger ? ' btn-modal-danger' : '');
    id('confirmModal').classList.add('show');

    const onConfirm = () => { cleanup(); resolve(true); };
    const onCancel  = () => { cleanup(); resolve(false); };
    const cleanup   = () => {
      id('confirmModal').classList.remove('show');
      confirmBtn.removeEventListener('click', onConfirm);
      id('modalCancel').removeEventListener('click', onCancel);
      id('modalOverlay').removeEventListener('click', onCancel);
    };

    confirmBtn.addEventListener('click', onConfirm);
    id('modalCancel').addEventListener('click', onCancel);
    id('modalOverlay').addEventListener('click', onCancel);
  });
}

// ─── Skeleton Loaders ────────────────────────────────────────

function skeletonCards(count = 8) {
  let h = '<div class="grid">';
  for (let i = 0; i < count; i++) {
    h += `<div class="skeleton-card" style="animation-delay:${i * 60}ms">
      <div class="skel skel-icon"></div>
      <div class="skel skel-text" style="width:75%"></div>
      <div class="skel skel-text" style="width:50%"></div>
    </div>`;
  }
  return h + '</div>';
}

function skeletonList(count = 5) {
  let h = '<div class="file-list">';
  for (let i = 0; i < count; i++) {
    h += `<div class="skeleton-row" style="animation-delay:${i * 60}ms">
      <div class="skel skel-icon-sm"></div>
      <div style="flex:1">
        <div class="skel skel-text" style="width:60%"></div>
        <div class="skel skel-text" style="width:35%;margin-top:6px"></div>
      </div>
      <div class="skel skel-badge"></div>
    </div>`;
  }
  return h + '</div>';
}

// ─── Role badge helper ───────────────────────────────────────

function roleBadge(role) {
  const map = {
    admin:   { cls: 'badge-danger',  label: 'Admin' },
    teacher: { cls: 'badge-blue',    label: 'Teacher' },
    student: { cls: 'badge-green',   label: 'Student' },
  };
  const r = map[role] || map.student;
  return `<span class="stat-badge ${r.cls}">${r.label}</span>`;
}

function statusBadge(status) {
  const map = {
    pending:  { cls: 'status-pending',  label: '⏳ Pending' },
    approved: { cls: 'status-approved', label: '✓ Approved' },
    rejected: { cls: 'status-rejected', label: '✕ Rejected' },
  };
  const s = map[status] || map.pending;
  return `<span class="file-status ${s.cls}">${s.label}</span>`;
}
