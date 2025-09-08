const crypto = require('crypto');

function generateShortcode(length = 6) {
  const id = crypto
    .randomBytes(Math.ceil(length * 0.6))
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
  return id || Math.random().toString(36).substr(2, length);
}

module.exports = generateShortcode;


