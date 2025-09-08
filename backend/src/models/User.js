if (process.env.USE_MEMORY_STORE === 'true') {
  const { v4: uuidv4 } = require('uuid');
  class UserMem {
    constructor(doc) { Object.assign(this, doc); this._id = this._id || uuidv4(); }
    async save() { const { memoryUsers } = require('../utils/memoryStore'); return memoryUsers.save(this) }
    static async findOne(query) { const { memoryUsers } = require('../utils/memoryStore'); return memoryUsers.findOne(query) }
    static async findById(id) { const { memoryUsers } = require('../utils/memoryStore'); return memoryUsers.findById(id) }
  }
  module.exports = UserMem;
} else {
  const mongoose = require('mongoose');
  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobileNo: { type: String, required: true },
    githubUsername: { type: String, required: true },
    rollNo: { type: String, required: true, unique: true },
    clientID: { type: String, required: true, unique: true },
    clientSecretHash: { type: String, required: true },
    accessCodeUsed: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  module.exports = require('mongoose').model('User', UserSchema);
}


