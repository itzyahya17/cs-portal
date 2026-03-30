// ─────────────────────────────────────────────────────────────
// ANNOUNCEMENTS — deadline board, notices, reminders
// ─────────────────────────────────────────────────────────────

async function showAnnouncements() {
  view = 'announcements';
  id('statsRow').style.display = 'none';
  id('backBtn').style.display  = 'block';
  setActive('navAnnounce');
  setTitle('Announcements', [
    { label: 'CS Portal',       action: 'goHome()' },
    { label: 'Announcements',   action: null },
  ]);

  id('content').innerHTML = skeletonList(4);

  try {
    const announcements = await api(`/announcements?semester=${currentSemester}`);

    let h = '';

    // Create announcement button
    h += `
      <div class="announce-header">
        <div>
          <div class="section-title">📢 Announcements</div>
          <div class="section-sub">${getSemester().name} · ${getSemester().period}</div>
        </div>
        <button class="btn btn-ghost" onclick="showCreateAnnouncement()">+ New Announcement</button>
      </div>`;

    // Deadline banner — upcoming deadlines
    const upcoming = announcements.filter(a => a.deadline && new Date(a.deadline) > new Date()).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (upcoming.length) {
      h += '<div class="deadline-banner">';
      h += '<div class="deadline-banner-title">⏰ Upcoming Deadlines</div>';
      upcoming.slice(0, 3).forEach(a => {
        h += `
          <div class="deadline-item ${a.priority}">
            <div class="deadline-dot priority-${a.priority}"></div>
            <div class="deadline-info">
              <div class="deadline-name">${a.title}</div>
              <div class="deadline-meta">${a.subject || 'General'} · ${categoryLabel(a.category)}</div>
            </div>
            <div class="deadline-countdown">${countdown(a.deadline)}</div>
          </div>`;
      });
      h += '</div>';
    }

    // All announcements
    if (!announcements.length) {
      h += `<div class="empty"><div class="empty-icon">📢</div><div class="empty-text">No announcements yet</div><div style="margin-top:8px;font-size:12px;color:var(--muted)">Post an announcement to keep everyone informed!</div></div>`;
    } else {
      h += '<div class="announce-list">';
      announcements.forEach((a, i) => {
        const authorName = a.author?.full_name || 'Unknown';
        const authorRole = a.author?.role || 'student';
        h += `
          <div class="announce-card ${a.priority}" style="animation-delay:${i * 40}ms">
            ${a.pinned ? '<div class="announce-pin">📌 Pinned</div>' : ''}
            <div class="announce-top">
              <span class="announce-cat cat-${a.category}">${categoryLabel(a.category)}</span>
              ${a.priority !== 'normal' ? `<span class="announce-priority priority-${a.priority}">${a.priority === 'urgent' ? '🔴 Urgent' : '🟡 Important'}</span>` : ''}
            </div>
            <div class="announce-title">${a.title}</div>
            ${a.body ? `<div class="announce-body">${a.body}</div>` : ''}
            ${a.subject ? `<div class="announce-subject">${a.subject}</div>` : ''}
            ${a.deadline ? `<div class="announce-deadline">⏰ Deadline: ${new Date(a.deadline).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · ${countdown(a.deadline)}</div>` : ''}
            <div class="announce-footer">
              <span>${authorName} (${authorRole})</span>
              <span>${timeAgo(a.created_at)}</span>
            </div>
            ${currentUser.role === 'admin' ? `
              <div class="announce-actions">
                ${a.pinned ? `<button class="btn btn-ghost btn-sm" onclick="unpinAnnouncement('${a.id}')">Unpin</button>` : `<button class="btn btn-ghost btn-sm" onclick="pinAnnouncement('${a.id}')">📌 Pin</button>`}
                <button class="btn btn-danger btn-sm" onclick="deleteAnnouncement('${a.id}')">Delete</button>
              </div>` : ''}
          </div>`;
      });
      h += '</div>';
    }

    id('content').innerHTML = h;
  } catch (err) {
    id('content').innerHTML = `<div class="empty"><div class="empty-icon">⚠️</div><div class="empty-text">${err.message}</div></div>`;
  }
}

// ─── Create Announcement Form ────────────────────────────────

function showCreateAnnouncement() {
  const subjects = getSubjects();
  let subjectOptions = '<option value="">General (no specific subject)</option>';
  subjects.forEach(s => { subjectOptions += `<option value="${s.name}">${s.code} — ${s.name}</option>`; });

  id('content').innerHTML = `
    <div class="announce-form">
      <div class="section-title" style="margin-bottom:20px">📢 New Announcement</div>

      <div class="field-label">Title *</div>
      <div class="field"><span class="field-icon">📌</span><input class="inp" id="annTitle" placeholder="Assignment 2 deadline extended"></div>

      <div class="field-label">Details</div>
      <textarea class="inp announce-textarea" id="annBody" placeholder="Add a description or instructions..." style="padding-left:14px;min-height:80px;resize:vertical"></textarea>

      <div class="form-row">
        <div class="form-col">
          <div class="field-label">Category</div>
          <select class="inp" id="annCategory" style="padding-left:14px">
            <option value="general">📢 General</option>
            <option value="assignment">📋 Assignment</option>
            <option value="exam">📝 Exam</option>
            <option value="event">🎉 Event</option>
          </select>
        </div>
        <div class="form-col">
          <div class="field-label">Priority</div>
          <select class="inp" id="annPriority" style="padding-left:14px">
            <option value="normal">Normal</option>
            <option value="important">🟡 Important</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>
      </div>

      <div class="field-label">Subject (optional)</div>
      <select class="inp" id="annSubject" style="padding-left:14px">${subjectOptions}</select>

      <div class="field-label">Deadline (optional)</div>
      <div class="field"><span class="field-icon">⏰</span><input class="inp" id="annDeadline" type="datetime-local"></div>

      <div style="display:flex;gap:10px;margin-top:24px">
        <button class="login-btn" style="flex:1" onclick="submitAnnouncement()">Post Announcement</button>
        <button class="btn btn-ghost" onclick="showAnnouncements()">Cancel</button>
      </div>
    </div>`;
}

async function submitAnnouncement() {
  const title    = id('annTitle').value.trim();
  const body     = id('annBody').value.trim();
  const category = id('annCategory').value;
  const priority = id('annPriority').value;
  const subject  = id('annSubject').value;
  const deadline = id('annDeadline').value;

  if (!title) return showToast('Please enter a title', 'warning');

  try {
    const data = await api('/announcements', {
      method: 'POST',
      body: JSON.stringify({
        title, body, category, priority,
        subject: subject || null,
        semester: currentSemester,
        deadline: deadline || null,
      }),
    });
    showToast(data.message, 'success');
    showAnnouncements();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

// ─── Announcement Admin Actions ──────────────────────────────

async function pinAnnouncement(annId) {
  try {
    await api(`/announcements/${annId}`, { method: 'PATCH', body: JSON.stringify({ pinned: true }) });
    showToast('Pinned!', 'success');
    showAnnouncements();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function unpinAnnouncement(annId) {
  try {
    await api(`/announcements/${annId}`, { method: 'PATCH', body: JSON.stringify({ pinned: false }) });
    showToast('Unpinned', 'info');
    showAnnouncements();
  } catch (err) { showToast(err.message, 'danger'); }
}

async function deleteAnnouncement(annId) {
  const yes = await showModal('Delete Announcement', 'Permanently delete this announcement?', 'Delete', true);
  if (!yes) return;
  try {
    await api(`/announcements/${annId}`, { method: 'DELETE' });
    showToast('Deleted', 'warning');
    showAnnouncements();
  } catch (err) { showToast(err.message, 'danger'); }
}

// ─── Helpers ─────────────────────────────────────────────────

function categoryLabel(cat) {
  const map = { assignment: '📋 Assignment', exam: '📝 Exam', general: '📢 General', event: '🎉 Event' };
  return map[cat] || map.general;
}

function countdown(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return '⏰ Passed';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

// ─── Dashboard Announcement Widget ──────────────────────────

async function renderAnnouncementWidget() {
  try {
    const anns = await api(`/announcements?semester=${currentSemester}`);
    const urgent = anns.filter(a => a.priority === 'urgent' || (a.deadline && new Date(a.deadline) > new Date() && new Date(a.deadline) - new Date() < 3 * 86400000));

    if (!urgent.length) return '';

    let h = '<div class="announce-widget">';
    h += '<div class="announce-widget-title">🔔 Important Notices</div>';
    urgent.slice(0, 3).forEach(a => {
      h += `
        <div class="announce-widget-item priority-${a.priority}">
          <div class="announce-widget-text">${a.title}</div>
          ${a.deadline ? `<div class="announce-widget-deadline">${countdown(a.deadline)}</div>` : ''}
        </div>`;
    });
    h += '</div>';
    return h;
  } catch {
    return '';
  }
}
