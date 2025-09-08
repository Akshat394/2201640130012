function errorHandler(err, req, res, next) {
  if (req && req.logError) req.logError(err);
  const status = err.status || 500;
  const payload = { error: err.message || 'Internal Server Error', status };
  res.status(status).json(payload);
}

module.exports = errorHandler;


