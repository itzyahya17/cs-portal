require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const announcementRoutes = require('./routes/announcements');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, message: { error: 'Too many requests' } }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'client')));

// API Routes
app.use('/api/auth',          authRoutes);
app.use('/api/files',         fileRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CS Portal Backend v3.0 🚀' });
});

// SPA fallback
app.get('{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n  ╔═══════════════════════════════════════╗`);
  console.log(`  ║   CS Portal Server v3.0 · Port ${PORT}  ║`);
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log(`  ╚═══════════════════════════════════════╝\n`);
});
