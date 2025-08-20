const express = require('express');
const { default: rateLimit } = require('express-rate-limit');

const { authController } = require('../controllers');
const authenticate = require('../middlewares/authentication.middleware');
const validateRequest = require('../middlewares/request.validation.middleware');
const {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} = require('../validations/auth.validation');

const router = express.Router();

// Stricter limiter for sensitive endpoints

const loginLimiter = rateLimit({
  legacyHeaders: false,
  max: 10,
  message: { message: 'Too many login attempts. Please try again later.' },

  // 10 attempts / 15 min per IP
  standardHeaders: true,

  windowMs: 15 * 60 * 1000,
});

const refreshLimiter = rateLimit({
  legacyHeaders: false,
  max: 30,

  message: { message: 'Too many refresh attempts. Slow down.' },

  // refresh can be more frequent but still bounded
  standardHeaders: true,
  windowMs: 5 * 60 * 1000,
});

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  authController.login
);

router.post(
  '/refresh',
  refreshLimiter,
  validateRequest(refreshTokenSchema),
  authController.refreshTokens
);

router.post(
  '/logout',
  validateRequest(refreshTokenSchema),
  authController.logout
);

router.post('/logout-all', authenticate, authController.logoutAll);

module.exports = router;
