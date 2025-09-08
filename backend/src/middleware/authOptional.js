const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authOptional(req, res, next) {
  const auth = req.header('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return next();
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select('-clientSecretHash');
    if (user) req.user = user;
  } catch (e) {}
  next();
}

module.exports = authOptional;


