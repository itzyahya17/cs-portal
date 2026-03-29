// ─────────────────────────────────────────────────────────────
// AUTH
// Login, logout, forgot password, reset password
//
// NOTE FOR BACKEND INTEGRATION:
// Replace the login() body with a fetch() POST to /api/auth/login
// Replace logout() with a fetch() to /api/auth/logout + redirect
// ─────────────────────────────────────────────────────────────

/** Show login page, hide all other auth pages */
function showLogin() {
  id("loginPage").classList.remove("hidden");
  id("forgotPage").classList.add("hidden");
  id("resetPage").classList.add("hidden");
}

/** Show forgot-password page, reset it back to Step 1 */
function showForgot() {
  id("loginPage").classList.add("hidden");
  id("forgotPage").classList.remove("hidden");
  id("resetPage").classList.add("hidden");
  id("forgotStep1").style.display = "block";
  id("forgotStep2").style.display = "none";
  id("resetEmail").value = "";
  hideMsg("forgotMsg");
}

/**
 * sendReset — validates email on forgot-password page,
 * advances to confirmation step (Step 2).
 * TODO: replace with POST /api/auth/forgot-password
 */
function sendReset() {
  const email = id("resetEmail").value.trim();
  if (!email || !email.includes("@")) {
    showMsg("forgotMsg", "Please enter a valid email address.", "error");
    return;
  }
  id("sentToEmail").textContent     = email;
  id("resetAccount").value          = email;
  id("forgotStep1").style.display   = "none";
  id("forgotStep2").style.display   = "block";
}

/**
 * doReset — validates new password fields.
 * Redirects to login after success.
 * TODO: replace with POST /api/auth/reset-password
 */
function doReset() {
  const np = id("newPass").value;
  const cp = id("confirmPass").value;
  if (np.length < 8) {
    showMsg("resetMsg", "Password must be at least 8 characters.", "error");
    return;
  }
  if (np !== cp) {
    showMsg("resetMsg", "Passwords don't match.", "error");
    return;
  }
  showMsg("resetMsg", "Password updated! Redirecting...", "success");
  setTimeout(() => showLogin(), 1800);
}

/**
 * login — reads email field, sets role, populates sidebar,
 * transitions from auth overlay to dashboard.
 *
 * Admin: admin@gmail.com (any password)
 * Student: any other email
 *
 * TODO: replace with POST /api/auth/login → JWT stored in httpOnly cookie
 */
function login() {
  user = id("loginEmail").value.trim();
  if (!user) return;

  isAdmin = (user === "admin@gmail.com");

  id("avatarEl").textContent    = user[0].toUpperCase();
  id("userNameEl").textContent  = user.split("@")[0];
  id("userRoleEl").textContent  = isAdmin ? "Administrator" : "Student";
  id("userEmailEl").textContent = user;

  if (isAdmin) id("navAdmin").classList.remove("hidden");

  id("loginPage").classList.add("hidden");
  id("dashboard").classList.remove("hidden");

  renderSubjects();
}

/** logout — full page reload returns user to login screen
 *  TODO: replace with POST /api/auth/logout then reload
 */
function logout() { location.reload(); }
