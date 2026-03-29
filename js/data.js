// ─────────────────────────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────────────────────────

let user           = "";         // signed-in user's email
let isAdmin        = false;      // true if user === "admin@gmail.com"
let view           = "subjects"; // "subjects" | "folders" | "files" | "admin"
let currentSubject = null;
let currentFolder  = null;
let files          = [];
// Each file entry: { name, user, subject, folder, status }
// status: "pending" | "approved" | "rejected"


// ─────────────────────────────────────────────────────────────
// SUBJECTS DATA
// To add a subject: push a new object to this array.
// name is also used as the unique key throughout the app.
// ─────────────────────────────────────────────────────────────

const subjects = [
  { name: "Programming Fundamentals", icon: "💻", color: "rgba(99,102,241,0.15)"  },
  { name: "ICT",                      icon: "🌐", color: "rgba(34,211,238,0.15)"  },
  { name: "Functional English",       icon: "📝", color: "rgba(167,139,250,0.15)" },
  { name: "International Relations",  icon: "🌍", color: "rgba(16,185,129,0.15)"  },
  { name: "Civics",                   icon: "⚖️", color: "rgba(251,146,60,0.15)"  },
  { name: "Islamic Studies",          icon: "☪️", color: "rgba(20,184,166,0.15)"  },
  { name: "Fehm-Ul-Quran",            icon: "📖", color: "rgba(168,85,247,0.15)"  },
  { name: "Pre-Calculus",             icon: "∑",  color: "rgba(244,63,94,0.12)"   }
];


// ─────────────────────────────────────────────────────────────
// FOLDERS DATA
// Same six folders appear inside every subject.
// ─────────────────────────────────────────────────────────────

const folders = [
  { name: "Assignments",        icon: "📋" },
  { name: "Past Papers",        icon: "📄" },
  { name: "Books & Syllabus",   icon: "📚" },
  { name: "Slides",             icon: "🖥️" },
  { name: "Important Material", icon: "⭐" },
  { name: "Notes",              icon: "📓" }
];
