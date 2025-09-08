class MemoryUsers {
  constructor() { this.users = []; }
  async findOne(query) {
    return this.users.find(u => Object.keys(query).some(k => {
      if (query[k] && query[k].$or) {
        return query[k].$or.some(cond => this._match(u, cond))
      }
      return this._match(u, query)
    })) || null
  }
  _match(obj, q) {
    return Object.keys(q).every(k => obj[k] === q[k])
  }
  async findById(id) { return this.users.find(u => u._id === id) || null }
  async save(user) { this.users.push(user); return user }
}

class MemoryShortUrls {
  constructor() { this.docs = []; }
  async findOne(query) { return this.docs.find(d => d.shortcode === query.shortcode) || null }
  async findByIdAndUpdate(id, update) {
    const d = this.docs.find(x => x._id === id); if (!d) return null
    if (update.$inc && typeof update.$inc.redirects === 'number') d.redirects += update.$inc.redirects
    if (update.$push && update.$push.clicks) d.clicks.push({ ...update.$push.clicks, ts: new Date() })
    return d
  }
  async save(doc) { this.docs.push(doc); return doc }
  async find(query) { return this.docs.filter(d => !query.owner || String(d.owner) === String(query.owner)) }
}

const memoryUsers = new MemoryUsers()
const memoryShortUrls = new MemoryShortUrls()

module.exports = { memoryUsers, memoryShortUrls }


