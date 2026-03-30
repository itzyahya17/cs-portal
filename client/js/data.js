// ─────────────────────────────────────────────────────────────
// GLOBAL STATE & SEMESTER/SUBJECT DATA
// COMSATS University Islamabad · BCS · 4 Years / 8 Semesters
// ─────────────────────────────────────────────────────────────

let currentUser    = null;
let token          = null;
let view           = 'subjects';
let currentSubject = null;
let currentFolder  = null;
let currentSemester = 1;    // default: Semester 1

const PROGRAM = 'BCS — Computer Science';

const semesters = [
  {
    id: 1, name: 'Semester 1', period: 'Spring 2026', year: 1, active: true,
    subjects: [
      { code: 'CSC103', name: 'Programming Fundamentals', credits: 4, teacher: 'Bushra Naz', icon: '💻', color: 'rgba(99,102,241,0.15)', accent: '#6366f1' },
      { code: 'CSC101', name: 'Applications of Information & Communication Technologies', credits: 3, teacher: 'Umar Iqbal', icon: '🌐', color: 'rgba(34,211,238,0.15)', accent: '#22d3ee' },
      { code: 'HUM104', name: 'Functional English', credits: 3, teacher: 'Maria Khan', icon: '📝', color: 'rgba(167,139,250,0.15)', accent: '#a78bfa' },
      { code: 'HUM222', name: 'Fundamentals of International Relations', credits: 2, teacher: 'Muhammad Younas', icon: '🌍', color: 'rgba(16,185,129,0.15)', accent: '#10b981' },
      { code: 'HUM208', name: 'Civics and Community Engagement', credits: 2, teacher: 'Jasmeen Bangash', icon: '⚖️', color: 'rgba(251,146,60,0.15)', accent: '#fb923c' },
      { code: 'HUM112', name: 'Islamic Studies', credits: 2, teacher: 'Sana', icon: '☪️', color: 'rgba(20,184,166,0.15)', accent: '#14b8a6' },
      { code: 'HUM161', name: 'Understanding of Holy Quran – I (Fehm-e-Quran-I)', credits: 1, teacher: 'Dr. Zainab Sadiq', icon: '📖', color: 'rgba(168,85,247,0.15)', accent: '#a855f7' },
      { code: 'MTH104', name: 'Pre-Calculus', credits: 2, teacher: 'TBA', icon: '∑', color: 'rgba(244,63,94,0.12)', accent: '#f43f5e' },
    ],
  },
  { id: 2, name: 'Semester 2', period: 'Fall 2026',   year: 1, active: false, subjects: [] },
  { id: 3, name: 'Semester 3', period: 'Spring 2027', year: 2, active: false, subjects: [] },
  { id: 4, name: 'Semester 4', period: 'Fall 2027',   year: 2, active: false, subjects: [] },
  { id: 5, name: 'Semester 5', period: 'Spring 2028', year: 3, active: false, subjects: [] },
  { id: 6, name: 'Semester 6', period: 'Fall 2028',   year: 3, active: false, subjects: [] },
  { id: 7, name: 'Semester 7', period: 'Spring 2029', year: 4, active: false, subjects: [] },
  { id: 8, name: 'Semester 8', period: 'Fall 2029',   year: 4, active: false, subjects: [] },
];

// Helpers to get current semester data
function getSemester(id) { return semesters.find(s => s.id === (id || currentSemester)); }
function getSubjects()   { return getSemester().subjects; }
function getTotalCredits(){ return getSubjects().reduce((a, s) => a + s.credits, 0); }

// Course material folders
const folders = [
  { name: 'Lecture Slides',      icon: '🖥️' },
  { name: 'Assignments',         icon: '📋' },
  { name: 'Books & Notes',       icon: '📚' },
  { name: 'Quizzes',             icon: '❓' },
  { name: 'Important Material',  icon: '⭐' },
];

// Exam centre folders (separate from course materials)
const examFolders = [
  { name: 'Mid-Term Papers',     icon: '📋' },
  { name: 'Final Papers',        icon: '📋' },
  { name: 'Quiz Papers',         icon: '📝' },
  { name: 'Solved Papers',       icon: '✅' },
  { name: 'Important Questions', icon: '⭐' },
];
