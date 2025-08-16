const Joi = require('joi');

const passwordRules = Joi.string().min(8).max(128).required().messages({
  'string.min': 'Password must be at least 8 characters long',
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: passwordRules,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password',
  }),
  name: Joi.string().allow('').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
};
