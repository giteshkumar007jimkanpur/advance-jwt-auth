/**
 * Express app bootstrap: security, headers, rate limit, parsing, logging, routes, errorHandling
 */
const compression = require('compression');
//const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const morgan = require('morgan');

const { isProd } = require('./config/env');
const errorHandler = require('./middlewares/error.handler.middleware');
const requestContext = require('./middlewares/request.context.middleware');
const router = require('./routes/index');
const logger = require('./utils/logger');

const app = express();

/** Hide tech stack */
app.disabled('x-powered-by');

/**
 * When behind a reverse proxy (Nginx, Render, Heroku), trust proxy for correct
 * IPs in rate-limiting and logs. Safe for single proxy
 */
app.set('trust proxy', 1);

// 2. Request context (request ID)
app.use(requestContext);

/** Security */

/** Security headers */
/** express by default does not set many security headers */
/** Attackers can exploit this (XSS, clickjacking etc) */
/** helmet sets a collection of HTTP security headers automatically. */
app.use(
  helmet({
    /** allows Authorization headers for APIs via CORS; other defaults kept */
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/** CORS: allows commonfrontend origins, tweak as needed */
/** tells browser which external origins are allowed to talk to your API */
app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 600,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: true,
  })
);

/**
 * Protect against HTTP Parameter Pollution (HPP) attacks.
 * sanitizes the request query/body
 * so that each parameter has only one value (last one wins by default).
 */
app.use(hpp());

/** Basic rate limiting per IP */
/** Without limiting, an attacker can span your API
 * with thousand of requests per second -> DDOS atack
 * rateLimit restricts how many requests each IP can make in a window of time.
 */

const limiter = rateLimit({
  legacyHeaders: false,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});
app.use(limiter);

/** Body Parsers */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Cookie parser is available but intentionally disabled
// app.use(cookieParser());

/** Request logging -> pipes to winston in production, dev-friendly otherwise */
/**
 * You need logs of every request for debugging and auditing.
 * Morgan is request logger middleware (Its logs method, url, response time).
 * Normally it prints in console
 * but connected with winston (logger) -> now logs can be structured
 * JSON in prod, colorful in dev
 */
const morganFormat = isProd ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (msg) =>
        logger.http ? logger.http(msg.trim()) : logger.info(msg.trim()),
    },
  })
);

/**
 * Compress HTTP responses before sending them to the client.
 * Reduces bandwidth: saves server costs and speeds up response time.
 * Note: Avoid compressing already-compressed formats (images, videos, zips).
 */
app.use(compression());

/** Health check (useful for uptime monitors) */
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

/** Mount APIs */
app.use('/', router);

/** 404 handler for unknown routes */
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found ${req.method} ${req.originalUrl}`,
  });
});

/** Central error handler */
app.use(errorHandler);

module.exports = app;
