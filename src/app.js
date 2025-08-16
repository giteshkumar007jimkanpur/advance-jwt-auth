require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middlewares/error.handler.middleware');
const router = require('./routes/index');

const app = express();
app.disable('x-powered-by');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(helmet());

const limit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limit);

app.use('/', router);

app.use(errorHandler);

module.exports = app;
