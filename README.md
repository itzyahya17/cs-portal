# CS Portal — COMSATS University
### BCS Program · Spring 2026

A student academic resource portal for browsing, uploading, and managing course materials with an admin approval workflow.

---

## Folder Structure

```
cs-portal/
├── index.html          ← main HTML (markup only)
├── css/
│   └── main.css        ← all styles + design tokens
├── js/
│   ├── data.js         ← global state + subjects/folders data
│   ├── utils.js        ← id(), showToast(), updateCount()
│   ├── nav.js          ← goHome(), goBack(), breadcrumbs
│   ├── render.js       ← renderSubjects(), renderFiles(), searchFiles()
│   ├── files.js        ← upload(), approve(), reject()
│   ├── admin.js        ← showAdmin(), approveAdmin(), rejectAdmin()
│   └── auth.js         ← login(), logout(), forgot/reset password
└── .gitignore
```

---

## Current Credentials (frontend-only / demo)

| Role    | Email             | Password   |
|---------|-------------------|------------|
| Admin   | admin@gmail.com   | anything   |
| Student | any other email   | anything   |

---

## How to Run (Frontend Only)

Just open `index.html` in a browser. No build tools needed.

For local development with live reload:
```bash
npx serve .
# or
npx live-server
```

---

## Backend Integration Points

Each JS file has `TODO` comments marking exactly where API calls replace the current in-memory logic:

| File       | What to replace                          | Endpoint (planned)             |
|------------|------------------------------------------|--------------------------------|
| `auth.js`  | `login()` — hardcoded role check         | `POST /api/auth/login`         |
| `auth.js`  | `logout()` — page reload                 | `POST /api/auth/logout`        |
| `auth.js`  | `sendReset()` — simulated email          | `POST /api/auth/forgot-password` |
| `files.js` | `upload()` — push to in-memory array     | `POST /api/files/upload`       |
| `files.js` | `approve/reject()` — mutate array        | `PATCH /api/files/:id/status`  |
| `render.js`| `renderFiles()` — filter `files[]`       | `GET /api/files?subject=&folder=` |
| `render.js`| `searchFiles()` — client-side filter     | `GET /api/files/search?q=`     |

---

## Adding a New Subject

In `js/data.js`, push to the `subjects` array:

```js
{ name: "Your Subject", icon: "🎯", color: "rgba(99,102,241,0.15)" }
```

No other changes needed.

---

## Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | Vanilla HTML + CSS + JS     |
| Hosting  | Vercel                      |
| Backend  | Node.js + Express (planned) |
| Database | PostgreSQL (planned)        |
| Storage  | TBD                         |
