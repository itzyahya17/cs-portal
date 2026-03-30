// ─────────────────────────────────────────────────────────────
// AUTH — signup, login, session persistence, page transitions
// ─────────────────────────────────────────────────────────────

// ─── Page Visibility ─────────────────────────────────────────

function showLogin() {
  hideAllAuth();
  id('loginPage').classList.remove('hidden');
  id('loginEmail').value = '';
  id('loginPass').value = '';
  Particles.init('particleCanvas');
}

function showSignup() {
  hideAllAuth();
  id('signupPage').classList.remove('hidden');
}

function showForgot() {
  hideAllAuth();
  id('forgotPage').classList.remove('hidden');
  id('forgotStep1').style.display = 'block';
  id('forgotStep2').style.display = 'none';
  id('resetEmail').value = '';
  hideMsg('forgotMsg');
}

function hideAllAuth() {
  ['loginPage', 'signupPage', 'forgotPage', 'resetPage'].forEach(p => {
    const el = id(p);
    if (el) el.classList.add('hidden');
  });
}

// ─── Signup ──────────────────────────────────────────────────

async function signup() {
  const fullName = id('signupName').value.trim();
  const email    = id('signupEmail').value.trim();
  const password = id('signupPass').value;
  const confirm  = id('signupConfirm').value;

  if (!fullName) return showMsg('signupMsg', 'Please enter your full name', 'error');
  if (!email || !email.includes('@')) return showMsg('signupMsg', 'Please enter a valid email', 'error');
  if (password.length < 6) return showMsg('signupMsg', 'Password must be at least 6 characters', 'error');
  if (password !== confirm) return showMsg('signupMsg', 'Passwords do not match', 'error');

  const btn = id('signupBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner"></span> Creating Account...';

  try {
    const res = await fetch(API_URL + '/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    showMsg('signupMsg', '✓ Account created! Wait for admin approval, then log in.', 'success');
    setTimeout(() => showLogin(), 3000);
  } catch (err) {
    showMsg('signupMsg', err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Create Account';
  }
}

// ─── Login ───────────────────────────────────────────────────

async function login() {
  const email    = id('loginEmail').value.trim();
  const password = id('loginPass').value;

  if (!email) return showToast('Please enter your email', 'warning');
  if (!password) return showToast('Please enter your password', 'warning');

  const btn = id('loginBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-spinner"></span> Signing In...';

  try {
    const res = await fetch(API_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    // Save session
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('cs_token', token);
    localStorage.setItem('cs_user', JSON.stringify(currentUser));

    enterDashboard();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Sign In';
  }
}

// ─── Session Restore ─────────────────────────────────────────

async function checkSession() {
  const savedToken = localStorage.getItem('cs_token');
  const savedUser  = localStorage.getItem('cs_user');

  if (!savedToken || !savedUser) {
    showLogin();
    hideSplash();
    return;
  }

  token = savedToken;
  currentUser = JSON.parse(savedUser);

  try {
    // Verify token is still valid
    const data = await api('/auth/me');
    currentUser = data.user;
    localStorage.setItem('cs_user', JSON.stringify(currentUser));
    enterDashboard();
  } catch {
    // Token expired or invalid
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    token = null;
    currentUser = null;
    showLogin();
  }

  hideSplash();
}

function hideSplash() {
  setTimeout(() => {
    const splash = id('splashScreen');
    if (splash) {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 500);
    }
  }, 400);
}

// ─── Enter Dashboard ─────────────────────────────────────────

function enterDashboard() {
  Particles.stop();
  hideAllAuth();
  id('dashboard').classList.remove('hidden');

  // Populate sidebar user info
  id('avatarEl').textContent    = (currentUser.full_name || 'U')[0].toUpperCase();
  id('userNameEl').textContent  = currentUser.full_name;
  id('userRoleEl').textContent  = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  id('userEmailEl').textContent = currentUser.email;

  // Show admin nav if admin
  if (currentUser.role === 'admin') {
    id('navAdmin').classList.remove('hidden');
    loadPendingBadge();
  }

  goHome();
  hideSplash();
}

// ─── Pending Badge (Admin) ───────────────────────────────────

async function loadPendingBadge() {
  try {
    const [users, stats] = await Promise.all([
      api('/auth/users?status=pending'),
      api('/files/stats'),
    ]);
    const total = users.length + stats.pending;
    const badge = id('adminBadge');
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  } catch { /* silent */ }
}

// ─── Logout ──────────────────────────────────────────────────

function logout() {
  localStorage.removeItem('cs_token');
  localStorage.removeItem('cs_user');
  token = null;
  currentUser = null;
  location.reload();
}

// ─── Forgot Password (Simple flow) ──────────────────────────

async function sendReset() {
  const email = id('resetEmail').value.trim();
  if (!email || !email.includes('@')) {
    showMsg('forgotMsg', 'Please enter a valid email address.', 'error');
    return;
  }
  
  try {
    const res = await fetch(API_URL + '/auth/request-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    
    id('sentToEmail').textContent     = email;
    id('forgotStep1').style.display   = 'none';
    id('forgotStep2').style.display   = 'block';
  } catch (err) {
    showMsg('forgotMsg', 'Failed to send request. Try again later.', 'error');
  }
}

// ─── Init on page load ──────────────────────────────────────

window.addEventListener('DOMContentLoaded', checkSession);
