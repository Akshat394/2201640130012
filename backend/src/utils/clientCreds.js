const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function genClientID() {
  return uuidv4();
}

function genClientSecret(length = 24) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = { genClientID, genClientSecret };
