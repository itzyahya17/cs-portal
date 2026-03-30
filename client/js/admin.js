// ─────────────────────────────────────────────────────────────
// ADMIN PANEL — user management, file management, announcements,
// create users, inspect users, full controls
// ─────────────────────────────────────────────────────────────

let adminTab = 'users';

async function showAdmin() {
  view = 'admin';
  id('statsRow').style.display = 'none';
  id('backBtn').style.display  = 'block';
  setActive('navAdmin');
  setTitle('Admin Panel', [
    { label: 'CS Portal',    action: 'goHome()' },
    { label: 'Admin Panel',  action: null },
  ]);

  let pendingUsers = 0, pendingFiles = 0, pendingAnns = 0, totalUsers = 0;
  try {
    const [users, stats, allUsers, anns] = await Promise.all([
      api('/auth/users?status=pending'),
      api('/files/stats'),
      api('/auth/users'),
      api('/announcements?status=pending'),
    ]);
    pendingUsers = users.length;
    pendingFiles = stats.pending;
    pendingAnns  = anns.length;
    totalUsers   = allUsers.length;
  } catch { /* silent */ }

  let h = `
    <div class="admin-tabs">
      <button class="admin-tab ${adminTab === 'users' ? 'active' : ''}" onclick="switchAdminTab('users')">
        👤 User Requests ${pendingUsers > 0 ? `<span class="tab-badge">${pendingUsers}</span>` : ''}
      </button>
      <button class="admin-tab ${adminTab === 'files' ? 'active' : ''}" onclick="switchAdminTab('files')">
        📄 File Approvals ${pendingFiles > 0 ? `<span class="tab-badge">${pendingFiles}</span>` : ''}
      </button>
      <button class="admin-tab ${adminTab === 'announcements' ? 'active' : ''}" onclick="switchAdminTab('announcements')">
        📢 Announce Approvals ${pendingAnns > 0 ? `<span class="tab-badge">${pendingAnns}</span>` : ''}
      </button>
      <button class="admin-tab ${adminTab === 'all-users' ? 'active' : ''}" onclick="switchAdminTab('all-users')">
        👥 All Users <span class="tab-badge tab-badge-muted">${totalUsers}</span>
      </button>
      <button class="admin-tab ${adminTab === 'create-user' ? 'active' : ''}" onclick="switchAdminTab('create-user')">
        ➕ Add User
      </button>
    </div>
    <div id="adminContent"></div>`;

  id('content').innerHTML = h;
  renderAdminTab();
}

function switchAdminTab(tab) {
  adminTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  event.target.closest('.admin-tab').classList.add('active');
  renderAdminTab();
}

async function renderAdminTab() {
  const c = id('adminContent');
  if (!c) return;
  if (adminTab === 'users') await renderPendingUsers(c);
  else if (adminTab === 'files') await renderPendingFiles(c);
  else if (adminTab === 'announcements') await renderPendingAnnouncements(c);
  else if (adminTab === 'all-users') await renderAllUsers(c);
  else if (adminTab === 'create-user') renderCreateUser(c);
}

// ─── Pending Users ───────────────────────────────────────────

async function renderPendingUsers(container) {
  container.innerHTML = skeletonList(3);
  try {
    const users = await api('/auth/users?status=pending');
    if (!users.length) {
      container.innerHTML = `<div class="empty"><div class="empty-icon">✓</div><div class="empty-text">No pending user requests</div></div>`;
      return;
    }
    let h = `<div class="pending-header"><div class="section-title">Pending Registrations</div><span class="pending-count">${users.length} awaiting</span></div><div class="file-list">`;
    users.forEach((u, i) => {
      h += `
        <div class="file-row" style="animation-delay:${i * 50}ms">
          <div class="user-avatar-sm">${(u.full_name || 'U')[0].toUpperCase()}</div>
          <div class="file-info">
            <div class="file-name">${u.full_name}</div>
            <div class="file-meta">${u.email} · ${timeAgo(u.created_at)}</div>
          </div>
          <div class="file-actions">
            <select class="role-select" id="role-${u.id}">
              <option value="student" selected>Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <button class="btn btn-success btn-sm" onclick="approveUser('${u.id}')">✓ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectUser('${u.id}')">✕ Reject</button>
          </div>
        </div>`;
    });
    container.innerHTML = h + '</div>';
  } catch (err) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

// ─── Pending Files ───────────────────────────────────────────

async function renderPendingFiles(container) {
  container.innerHTML = skeletonList(3);
  try {
    const files = await api('/files?status=pending');
    if (!files.length) {
      container.innerHTML = `<div class="empty"><div class="empty-icon">✓</div><div class="empty-text">No pending file uploads</div></div>`;
      return;
    }
    let h = `<div class="pending-header"><div class="section-title">Pending Uploads</div><span class="pending-count">${files.length} to review</span></div><div class="file-list">`;
    files.forEach((f, i) => {
      const uploaderName = f.uploader?.full_name || 'Unknown';
      h += `
        <div class="file-row" style="animation-delay:${i * 50}ms">
          <div class="file-type-icon" style="background:${fileColor(f.name)}">${fileIcon(f.name)}</div>
          <div class="file-info">
            <div class="file-name">${f.name}</div>
            <div class="file-meta">
              <a href="${f.drive_url}" target="_blank" style="color:var(--accent2);text-decoration:none">Preview ↗</a>
              · ${f.subject} / ${f.folder} · ${f.section === 'exam' ? '📝 Exam' : '📚 Course'}
              · ${formatSize(f.file_size)} · by ${uploaderName} · ${timeAgo(f.created_at)}
            </div>
          </div>
          <div class="file-actions">
            <button class="btn btn-success btn-sm" onclick="approveFile('${f.id}')">✓ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectFile('${f.id}')">✕ Reject</button>
          </div>
        </div>`;
    });
    container.innerHTML = h + '</div>';
  } catch (err) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

// ─── Pending Announcements ───────────────────────────────────

async function renderPendingAnnouncements(container) {
  container.innerHTML = skeletonList(3);
  try {
    const anns = await api('/announcements?status=pending');
    if (!anns.length) {
      container.innerHTML = `<div class="empty"><div class="empty-icon">✓</div><div class="empty-text">No pending announcements</div></div>`;
      return;
    }
    let h = `<div class="pending-header"><div class="section-title">Pending Announcements</div><span class="pending-count">${anns.length} to review</span></div><div class="file-list">`;
    anns.forEach((a, i) => {
      const authorName = a.author?.full_name || 'Unknown';
      h += `
        <div class="file-row" style="animation-delay:${i * 50}ms">
          <div class="file-type-icon" style="background:rgba(99,102,241,0.12)">📢</div>
          <div class="file-info">
            <div class="file-name">${a.title}</div>
            <div class="file-meta">
              ${categoryLabel(a.category)} · by ${authorName} · ${timeAgo(a.created_at)}
              ${a.body ? ` · "${a.body.slice(0, 60)}${a.body.length > 60 ? '...' : ''}"` : ''}
            </div>
          </div>
          <div class="file-actions">
            <button class="btn btn-success btn-sm" onclick="approveAnnouncement('${a.id}')">✓ Approve</button>
            <button class="btn btn-danger btn-sm" onclick="rejectAnnouncement('${a.id}')">✕ Reject</button>
          </div>
        </div>`;
    });
    container.innerHTML = h + '</div>';
  } catch (err) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

async function approveAnnouncement(annId) {
  try {
    await api(`/announcements/${annId}`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) });
    showToast('Announcement approved!', 'success');
    showAdmin();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function rejectAnnouncement(annId) {
  try {
    await api(`/announcements/${annId}`, { method: 'DELETE' });
    showToast('Announcement rejected and deleted', 'warning');
    showAdmin();
  } catch (err) { showToast(err.message, 'danger'); }
}

// ─── All Users ───────────────────────────────────────────────

async function renderAllUsers(container) {
  container.innerHTML = skeletonList(5);
  try {
    const users = await api('/auth/users');
    let h = `<div class="pending-header"><div class="section-title">All Registered Users</div><span class="pending-count">${users.length} total</span></div><div class="file-list">`;
    users.forEach((u, i) => {
      const isMe = u.id === currentUser.id;
      h += `
        <div class="file-row" style="animation-delay:${i * 40}ms">
          <div class="user-avatar-sm">${(u.full_name || 'U')[0].toUpperCase()}</div>
          <div class="file-info">
            <div class="file-name">${u.full_name} ${isMe ? '<span style="color:var(--accent2);font-size:11px">(you)</span>' : ''}</div>
            <div class="file-meta">${u.email} · Joined ${timeAgo(u.created_at)}</div>
          </div>
          ${statusBadge(u.status)}
          ${roleBadge(u.role)}
          ${!isMe ? `
            <div class="file-actions">
              <select class="role-select" onchange="changeUserRole('${u.id}', this.value)">
                <option value="student" ${u.role === 'student' ? 'selected' : ''}>Student</option>
                <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>Teacher</option>
                <option value="admin"   ${u.role === 'admin'   ? 'selected' : ''}>Admin</option>
              </select>
              <button class="btn btn-ghost btn-sm" onclick="inspectUser('${u.id}')">🔍</button>
              <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}', '${u.full_name.replace(/'/g, "\\'")}')">🗑️</button>
            </div>` : ''}
        </div>`;
    });
    container.innerHTML = h + '</div>';
  } catch (err) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

// ─── Create User ─────────────────────────────────────────────

function renderCreateUser(container) {
  container.innerHTML = `
    <div class="announce-form" style="max-width:500px">
      <div class="section-title" style="margin-bottom:20px">➕ Create New User</div>
      <div class="section-sub" style="margin-bottom:20px;margin-top:-12px">Directly create an approved user with any role</div>

      <div class="field-label">Full Name *</div>
      <div class="field"><span class="field-icon">👤</span><input class="inp" id="createName" placeholder="Full name"></div>

      <div class="field-label">Email *</div>
      <div class="field"><span class="field-icon">✉</span><input class="inp" id="createEmail" type="email" placeholder="user@university.edu"></div>

      <div class="field-label">Password *</div>
      <div class="field"><span class="field-icon">🔒</span><input class="inp" id="createPassword" type="password" placeholder="Min 6 characters"></div>

      <div class="field-label">Role</div>
      <select class="inp" id="createRole" style="padding-left:14px">
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>

      <div class="info-box" id="createMsg"></div>
      <button class="login-btn" style="margin-top:20px" onclick="adminCreateUser()">Create User</button>
    </div>`;
}

async function adminCreateUser() {
  const fullName = id('createName').value.trim();
  const email    = id('createEmail').value.trim();
  const password = id('createPassword').value;
  const role     = id('createRole').value;

  if (!fullName || !email || !password) return showMsg('createMsg', 'All fields are required', 'error');
  if (password.length < 6) return showMsg('createMsg', 'Password must be at least 6 characters', 'error');

  try {
    const data = await api('/auth/users/create', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password, role }),
    });
    showMsg('createMsg', `✓ ${data.user.full_name} created as ${role}!`, 'success');
    id('createName').value = '';
    id('createEmail').value = '';
    id('createPassword').value = '';
  } catch (err) {
    showMsg('createMsg', err.message, 'error');
  }
}

// ─── Inspect User ────────────────────────────────────────────

async function inspectUser(userId) {
  const c = id('adminContent');
  c.innerHTML = skeletonList(4);

  try {
    const data = await api(`/auth/users/${userId}/inspect`);
    const u = data.user;

    let h = `
      <div class="inspect-header">
        <button class="btn btn-ghost" onclick="adminTab='all-users';renderAdminTab()">← Back to Users</button>
      </div>
      <div class="inspect-card">
        <div class="inspect-avatar">${(u.full_name || 'U')[0].toUpperCase()}</div>
        <div>
          <div class="inspect-name">${u.full_name}</div>
          <div class="inspect-email">${u.email}</div>
          <div style="margin-top:6px">${roleBadge(u.role)} ${statusBadge(u.status)}</div>
          <div class="inspect-meta">Joined ${new Date(u.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div class="section-title" style="margin-top:28px;margin-bottom:12px">📤 Uploads (${data.files.length})</div>`;

    if (data.files.length) {
      h += '<div class="file-list">';
      data.files.forEach(f => {
        h += `
          <div class="file-row">
            <div class="file-type-icon" style="background:${fileColor(f.name)}">${fileIcon(f.name)}</div>
            <div class="file-info">
              <div class="file-name">${f.name}</div>
              <div class="file-meta">${f.subject} / ${f.folder} · ${timeAgo(f.created_at)}</div>
            </div>
            ${statusBadge(f.status)}
          </div>`;
      });
      h += '</div>';
    } else {
      h += '<div style="color:var(--muted);font-size:13px;padding:12px 0">No uploads yet</div>';
    }

    h += `<div class="section-title" style="margin-top:28px;margin-bottom:12px">📢 Announcements (${data.announcements.length})</div>`;

    if (data.announcements.length) {
      h += '<div class="file-list">';
      data.announcements.forEach(a => {
        h += `
          <div class="file-row">
            <div class="file-type-icon" style="background:rgba(99,102,241,0.12)">📢</div>
            <div class="file-info">
              <div class="file-name">${a.title}</div>
              <div class="file-meta">${a.category} · ${timeAgo(a.created_at)}</div>
            </div>
            ${statusBadge(a.status)}
          </div>`;
      });
      h += '</div>';
    } else {
      h += '<div style="color:var(--muted);font-size:13px;padding:12px 0">No announcements</div>';
    }

    c.innerHTML = h;
  } catch (err) {
    c.innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

// ─── Admin Actions ───────────────────────────────────────────

async function approveUser(userId) {
  try {
    const roleSelect = id(`role-${userId}`);
    const role = roleSelect ? roleSelect.value : 'student';
    if (role !== 'student') {
      await api(`/auth/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
    }
    await api(`/auth/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'approved' }) });
    showToast(`User approved as ${role}!`, 'success');
    showAdmin();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function rejectUser(userId) {
  const yes = await showModal('Reject User', 'Reject this registration request?', 'Reject', true);
  if (!yes) return;
  try {
    await api(`/auth/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'rejected' }) });
    showToast('User rejected', 'warning');
    showAdmin();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function changeUserRole(userId, newRole) {
  try {
    await api(`/auth/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role: newRole }) });
    showToast(`Role updated to ${newRole}`, 'success');
  } catch (err) { showToast(err.message, 'danger'); }
}

async function deleteUser(userId, name) {
  const yes = await showModal('Delete User', `Permanently delete ${name}'s account?`, 'Delete Account', true);
  if (!yes) return;
  try {
    await api(`/auth/users/${userId}`, { method: 'DELETE' });
    showToast('Account deleted', 'warning');
    showAdmin();
  } catch (err) { showToast(err.message, 'danger'); }
}
