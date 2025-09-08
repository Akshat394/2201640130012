const express = require('express');
const Joi = require('joi');
const ShortUrl = require('../models/ShortUrl');
const generateShortcode = require('../utils/generateShortcode');
const validator = require('validator');

const router = express.Router();

const createSchema = Joi.object({
  url: Joi.string().required(),
  validity: Joi.number().integer().min(1).max(60*24*365).optional(),
  shortcode: Joi.string().alphanum().min(4).max(12).optional()
});

router.post('/', async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message, status: 400 });

    const { url, validity = 30, shortcode } = value;

    if (!validator.isURL(url, { require_protocol: true })) {
      return res.status(400).json({ error: 'Invalid URL format. Include http(s)://', status: 400 });
    }

    let code = shortcode;
    if (code) {
      const exists = await ShortUrl.findOne({ shortcode: code });
      if (exists) return res.status(409).json({ error: 'Shortcode already in use', status: 409 });
    } else {
      let tries = 0;
      do {
        code = generateShortcode(6);
        const exists = await ShortUrl.findOne({ shortcode: code });
        if (!exists) break;
        tries++;
      } while (tries < 6);
      if (!code) return res.status(500).json({ error: 'Failed to generate unique shortcode', status: 500 });
    }

    const expiry = new Date(Date.now() + validity * 60 * 1000);

    const doc = new ShortUrl({
      shortcode: code,
      url,
      expiry,
      owner: req.user ? req.user._id : null
    });

    await doc.save();

    return res.status(201).json({
      shortLink: `${process.env.BASE_URL || ''}/${code}`,
      expiry: expiry.toISOString()
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:shortcode', async (req, res, next) => {
  try {
    const { shortcode } = req.params;
    const doc = await ShortUrl.findOne({ shortcode });
    if (!doc) {
      return res.status(404).json({ error: 'Shortcode not found or link expired', status: 404 });
    }
    if (new Date() > doc.expiry) {
      return res.status(404).json({ error: 'Shortcode not found or link expired', status: 404 });
    }

    await ShortUrl.findByIdAndUpdate(doc._id, {
      $inc: { redirects: 1 },
      $push: { clicks: { ip: req.ip, userAgent: req.get('User-Agent') || '', referrer: req.get('Referer') || '' } }
    });

    return res.redirect(doc.url);
  } catch (err) {
    next(err);
  }
});

router.get('/:shortcode/stats', async (req, res, next) => {
  try {
    const { shortcode } = req.params;
    const doc = await ShortUrl.findOne({ shortcode });
    if (!doc) return res.status(404).json({ error: 'Shortcode not found', status: 404 });

    return res.json({
      shortcode: doc.shortcode,
      redirects: doc.redirects,
      expiry: doc.expiry.toISOString(),
      clicks: (doc.clicks || []).slice(-50).map(c => ({ ts: c.ts ? new Date(c.ts).toISOString() : undefined, ip: c.ip, userAgent: c.userAgent, referrer: c.referrer }))
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(403).json({ error: 'Auth required to list user links', status: 403 });
    const docs = await ShortUrl.find({ owner: req.user._id }).sort({ createdAt: -1 });
    const out = docs.map(d => ({
      shortcode: d.shortcode, url: d.url, expiry: d.expiry.toISOString(), redirects: d.redirects
    }));
    res.json({ links: out });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


