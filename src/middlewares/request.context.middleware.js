const { v4: uuidv4 } = require('uuid');

const { setContext } = require('../utils/request-context');

function requestContext(req, res, next) {
  // If upstream service or client already sent X-Request-ID, use it
  const incomingId = req.headers['x-request-id'];

  // Otherwise generate a new one
  const requestId = incomingId || uuidv4();

  // Store in AsyncLocalStorage for downstream logger access
  setContext({ requestId });

  // Attach to request object for app-level handlers
  req.requestId = requestId;

  // Always expose in response headers
  res.setHeader('X-Request-ID', requestId);

  next();
}

module.exports = requestContext;
