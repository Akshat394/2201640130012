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

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 200 }));

const loggingMiddleware = createLogger(process.env.LOG_DIR || path.join(__dirname, '../logging_middleware/logs'));
app.use(loggingMiddleware);

app.use('/auth', authRoutes);
app.use('/shorturls', authOptional, shortRoutes);

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


