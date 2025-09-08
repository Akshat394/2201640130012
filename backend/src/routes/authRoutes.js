const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { genClientID, genClientSecret } = require('../utils/clientCreds');
const User = require('../models/User');

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  mobileNo: Joi.string().pattern(/^[0-9]{7,15}$/).required(),
  githubUsername: Joi.string().required(),
  rollNo: Joi.string().required(),
  accessCode: Joi.string().required()
});

router.post('/register', async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message, status: 400 });

    // normalize/trim inputs to avoid trailing-space issues
    const email = value.email.trim();
    const name = value.name.trim();
    const mobileNo = value.mobileNo.trim();
    const githubUsername = value.githubUsername.trim();
    const rollNo = value.rollNo.trim();
    const accessCode = value.accessCode.trim();

    const existing = await User.findOne({ $or: [{ email }, { rollNo }] });
    if (existing) {
      return res.status(409).json({
        error: 'User already registered. If you lost client credentials contact admin to reset or re-register.',
        status: 409
      });
    }

    const allowed = (process.env.ACCESS_CODES || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (!allowed.includes(accessCode.toLowerCase())) {
      return res.status(403).json({ error: 'Invalid access code', status: 403 });
    }

    const clientID = genClientID();
    const clientSecret = genClientSecret(16);
    const clientSecretHash = await bcrypt.hash(clientSecret, 10);

    const user = new User({
      name, email, mobileNo, githubUsername, rollNo,
      clientID, clientSecretHash, accessCodeUsed: accessCode
    });

    await user.save();

    return res.status(201).json({
      clientID,
      clientSecret,
      message: 'Save clientSecret securely — it cannot be retrieved later.'
    });
  } catch (err) {
    next(err);
  }
});

const tokenSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  rollNo: Joi.string().required(),
  accessCode: Joi.string().required(),
  clientID: Joi.string().required(),
  clientSecret: Joi.string().required()
});

router.post('/token', async (req, res, next) => {
  try {
    const { error, value } = tokenSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message, status: 400 });

    // trim all fields
    const email = value.email.trim();
    const name = value.name.trim();
    const rollNo = value.rollNo.trim();
    const accessCode = value.accessCode.trim();
    const clientID = value.clientID.trim();
    const clientSecret = value.clientSecret.trim();

    // Find by clientID first, then verify email/rollNo to be resilient to case/spacing
    const user = await User.findOne({ clientID });
    if (!user) return res.status(401).json({ error: 'Invalid credentials', status: 401 });

    // Optional checks (skip strict matching to avoid false negatives due to spacing/case)

    if ((user.accessCodeUsed || '').toLowerCase() !== accessCode.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid access code for this user', status: 401 });
    }

    const match = await bcrypt.compare(clientSecret, user.clientSecretHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials', status: 401 });

    const token = jwt.sign({ userId: user._id, clientID: user.clientID }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token, expiresIn: 3600 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


