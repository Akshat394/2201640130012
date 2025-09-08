const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createLogger(logDir) {
  ensureDir(logDir);

  const requestsFile = path.join(logDir, 'requests.log');
  const errorsFile = path.join(logDir, 'errors.log');

  function writeRequestLog(entry) {
    try { fs.appendFileSync(requestsFile, JSON.stringify(entry) + '\n'); } catch (_) {}
  }
  function writeErrorLog(entry) {
    try { fs.appendFileSync(errorsFile, JSON.stringify(entry) + '\n'); } catch (_) {}
  }

  return function loggingMiddleware(req, res, next) {
    const start = Date.now();
    const reqBody = req.body;

    const originalSend = res.send.bind(res);
    let responseBody;
    res.send = function (body) {
      responseBody = body;
      return originalSend(body);
    };

    res.on('finish', () => {
      const entry = {
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - start,
        method: req.method,
        path: req.originalUrl,
        clientIP: req.ip,
        statusCode: res.statusCode,
        requestBody: reqBody,
        responseBody: (typeof responseBody === 'string' && responseBody.length > 1000) ? responseBody.slice(0, 1000) + '...[truncated]' : responseBody
      };
      writeRequestLog(entry);
    });

    req.logError = (err) => {
      const errEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        message: err.message || String(err),
        stack: err.stack || null
      };
      writeErrorLog(errEntry);
    };

    next();
  };
}

module.exports = { createLogger };


