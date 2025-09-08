require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { createLogger } = require('../logging_middleware/loggingMiddleware');
const authRoutes = require('./src/routes/authRoutes');
const shortRoutes = require('./src/routes/shorturlRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const authOptional = require('./src/middleware/authOptional');

const app = express();
const PORT = process.env.PORT || 4000;

// Ensure critical envs
if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.error('FATAL: JWT_SECRET is not set. Set it in .env and restart.');
  process.exit(1);
}

app.use(helmet());
// Support multiple allowed origins via FRONTEND_ORIGINS=comma,separated or single FRONTEND_ORIGIN
const allowedOrigins = (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow same-origin/non-browser clients
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true
}));
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 200 }));

const loggingMiddleware = createLogger(process.env.LOG_DIR || path.join(__dirname, '../logging_middleware/logs'));
app.use(loggingMiddleware);

app.use('/auth', authRoutes);
app.use('/shorturls', authOptional, shortRoutes);

// Dev-only reset for in-memory storage to allow fresh registration
if (process.env.USE_MEMORY_STORE === 'true' && process.env.NODE_ENV !== 'production') {
  app.post('/__reset', (req, res) => {
    try {
      const { memoryUsers, memoryShortUrls } = require('./src/utils/memoryStore');
      memoryUsers.users = [];
      memoryShortUrls.docs = [];
      return res.json({ ok: true, store: 'memory', users: 0, shortUrls: 0 });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  });
}

// Ignore favicon requests
app.get(['/favicon.ico', '/shorturls/favicon.ico'], (req, res) => res.status(204).end());

// Health check at root
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'url-shortener', memoryStore: process.env.USE_MEMORY_STORE === 'true' });
});

app.get('/:shortcode', async (req, res) => {
  return res.redirect(`/shorturls/${req.params.shortcode}`);
});

app.use(errorHandler);

if (process.env.NODE_ENV === 'test') {
  module.exports = app;
} else if (process.env.USE_MEMORY_STORE === 'true') {
  app.listen(PORT, () => {});
} else {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      app.listen(PORT, () => {});
    })
    .catch(err => {
      process.exit(1);
    });
}


