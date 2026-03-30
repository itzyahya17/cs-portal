# 🎓 CS Portal — COMSATS University Islamabad
### BCS Program · 8 Semesters
**Developed by YAHYA AND NUMAN**

A robust, full-stack academic resource portal for browsing, uploading, and managing course materials, exam past papers, and announcements. It features a role-based approval workflow, Google Drive integration for scalable storage, and a modern glassmorphism UI.

---

## 🚀 Key Features

*   📅 **8-Semester Architecture**: Easily switch between semesters. Analytics and content update dynamically based on the active semester.
*   📝 **Dedicated Exam Centre**: Completely decoupled from regular course materials. Includes specific categories for Mid-Term Papers, Final Papers, Quizzes, and Solved Papers.
*   📢 **Announcement Board**: Priority-based notifications (Urgent, Important, Normal) with deadline countdown timers and pinning functionality.
*   🛡️ **Advanced Admin Panel**: 5-tab control center to manage user registration requests, file upload approvals, announcement moderation, and full user inspection (view their uploads/activity).
*   ☁️ **Google Drive Integration**: 15GB of scalable, free cloud storage. Uploads are streamed directly to Drive while metadata is tracked safely in Supabase.
*   ✨ **Premium UI/UX**: Dark mode by default, glassmorphic cards, seamless XHR progress bars, dynamic particle canvases, and mobile-responsive drawer navigation.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Vanilla HTML, CSS, JavaScript (No frameworks) |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **Storage** | Google Drive API |
| **Authentication** | Custom JWT + bcryptjs (Manual Admin Approval) |
| **Security** | Helmet, Express Rate Limiting |

---

## 📂 Folder Structure

```text
cs-portal/
├── client/                     ← Frontend Assets
│   ├── css/
│   │   └── main.css            ← All styles, design tokens, glassmorphism
│   ├── js/
│   │   ├── admin.js            ← Admin panel logic (users, files, roles, inspect)
│   │   ├── announcements.js    ← Deadlines, creation, pinning, dashboard widgets
│   │   ├── auth.js             ← Login, signup, JWT session management
│   │   ├── data.js             ← Global state (8 Semesters, Subjects, Folders)
│   │   ├── exam.js             ← Exam centre specific logic
│   │   ├── files.js            ← Drag & drop uploads, Drive XHR progress
│   │   ├── nav.js              ← Semester switching, routing, mobile sidebar
│   │   ├── particles.js        ← Canvas background animations
│   │   ├── render.js           ← UI generation, search logic, dynamic views
│   │   └── utils.js            ← Helpers, toast notifications, formatting
│   └── index.html              ← Single Page Application layout
│
└── server/                     ← Backend API
    ├── middleware/
    │   └── auth.js             ← JWT verification & Role guards
    ├── routes/
    │   ├── announcements.js    ← REST API for broadcasts
    │   ├── auth.js             ← Registration, Authentication, User Management
    │   └── files.js            ← File uploads, listing, stats, deletion
    ├── utils/
    │   ├── drive.js            ← Google Drive OAuth2 & File API
    │   └── supabase.js         ← PostgreSQL connection pool
    ├── index.js                ← Express server setup & routing
    └── schema.sql              ← Database structure (Tables, Enums, Indexes)
```

---

## 🔧 Installation & Setup

### 1. Database (Supabase)
1. Create a new Supabase project.
2. Go to the SQL Editor and execute the entire contents of `server/schema.sql` to generate the new `users`, `files`, and `announcements` tables.

### 2. Environment Variables
Create a `.env` file in the `server/` directory:
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Drive API
GOOGLE_CLIENT_ID=your_gcp_client_id
GOOGLE_CLIENT_SECRET=your_gcp_client_secret
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=your_oauth_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_target_folder_id

# Security
JWT_SECRET=your_super_secret_jwt_string
PORT=5000
```

### 3. Run the App

Install backend dependencies and run the server:
```bash
cd server
npm install
npm run dev
```

The server will start at `http://localhost:5000` and automatically serve the frontend client.

---

## 👑 Bootstrapping the First Admin

Because the application relies on an approval-based registration system, your first account will be stuck in a "pending" state. To grant yourself admin access:

1. Go to `http://localhost:5000` and click "Sign Up".
2. Register your account.
3. Open your **Supabase SQL Editor** and run:
```sql
UPDATE users SET role = 'admin', status = 'approved' WHERE email = 'YOUR_EMAIL_HERE';
```
4. Log in! You will now see the Admin Panel in the sidebar.

---

## 🎓 Managing Semesters

To update courses or activate a new semester, simply edit the `semesters` array located in `client/js/data.js`. Change `active: false` to `active: true` and populate the `subjects` array!

