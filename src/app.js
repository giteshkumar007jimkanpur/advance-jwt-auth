/**
 * Express app bootstrap: security, parsing, rate limit, routes, error
 */

const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const { nodeEnv } = require('./config/env');
const errorHandler = require('./middlewares/error.handler.middleware');
const router = require('./routes');
const logger = require('./utils/logger');

const app = express();

/** Hide tech stack */
app.disable('x-powered-by');

/**
 * When behind a reverse proxy (Nginx, Render, Heroku), trust proxy for correct
 * IPs in rate-limiting and logs. Safe for single proxy
 */
app.set('trust proxy', 1);

/** Request logging -> pipes to winston in production, dev-friendly otherwise */
/**
 * You need logs of every request for debugging and auditing.
 * morgan is a request logger middleware (it logs method, URL, response time).
 * Normally it prints to console,
 * but you connected it to Winston (logger) → now logs can be structured
 * (JSON in prod, colorful in dev).
 */
const morganFormat = nodeEnv === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (msg) =>
        logger.http ? logger.http(msg.trim()) : logger.info(msg.trim()),
    },
  }),
);

/** Body parsers */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/** Security headers */
/**
 * Express by default doesn’t set many security headers.
 * Attackers can exploit this (XSS, clickjacking, etc.).
 * helmet sets a collection of HTTP security headers automatically.
 */
app.use(
  helmet({
    /** allows Authorization headers for APIs via CORS; other defaults kept */
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

/** CORS: allow common frontend origins, tweak as needed */
/** tells browsers which external origins are allowed to talk to your API. */
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }),
);

/** Basic rate limit (per IP) */
/**
 * Without limits, an attacker (or buggy client) can spam your API
 * with thousands of requests per second → DoS (Denial of Service).
 * rateLimit restricts how many requests each IP can make in a window of time.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

/** Health check (useful for uptime monitors) */
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

/** Mount API routes */
app.use('/', router);

/** 404 handler for unknown routes */
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

/** Central error handler */
app.use(errorHandler);

module.exports = app;
