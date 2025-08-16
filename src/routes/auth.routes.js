const express = require('express');

const router = express.Router();
const { authController } = require('../controllers/index');
const validateRequest = require('../middlewares/validate.request.middleware');
const {
  loginSchema,
  refreshSchema,
  registerSchema,
} = require('../validations/auth.validation');

router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshSchema), authController.refresh);
router.post('/logout', validateRequest(refreshSchema), authController.logout);

module.exports = router;
