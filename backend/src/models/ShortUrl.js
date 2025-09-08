if (process.env.USE_MEMORY_STORE === 'true') {
  const { v4: uuidv4 } = require('uuid');
  class ShortUrlMem {
    constructor(doc) { Object.assign(this, doc); this._id = this._id || uuidv4(); this.redirects = this.redirects || 0; this.clicks = this.clicks || []; this.createdAt = this.createdAt || new Date(); }
    async save() { const { memoryShortUrls } = require('../utils/memoryStore'); return memoryShortUrls.save(this) }
    static async findOne(query) { const { memoryShortUrls } = require('../utils/memoryStore'); return memoryShortUrls.findOne(query) }
    static async findByIdAndUpdate(id, update) { const { memoryShortUrls } = require('../utils/memoryStore'); return memoryShortUrls.findByIdAndUpdate(id, update) }
    static async find(query) { const { memoryShortUrls } = require('../utils/memoryStore'); return memoryShortUrls.find(query) }
  }
  module.exports = ShortUrlMem;
} else {
  const mongoose = require('mongoose');
  const ClickSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    referrer: String,
    ts: { type: Date, default: Date.now }
  }, { _id: false });
  const ShortUrlSchema = new mongoose.Schema({
    shortcode: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    expiry: { type: Date, required: true },
    redirects: { type: Number, default: 0 },
    clicks: { type: [ClickSchema], default: [] },
    createdAt: { type: Date, default: Date.now }
  });
  module.exports = require('mongoose').model('ShortUrl', ShortUrlSchema);
}


