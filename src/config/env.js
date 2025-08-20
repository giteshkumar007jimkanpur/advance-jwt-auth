/**
 * Centralized env loader with required/optional and default values.
 * Validation with JOI.
 */

require('dotenv').config();
const Joi = require('joi');

const envSchema = Joi.object({
  ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
  ACCESS_TOKEN_SECRET: Joi.string().min(32).required(),
  AUDIENCE: Joi.string().default('myapp-users'),

  ISSUER: Joi.string().default('myapp'),
  MONGO_URI: Joi.string().uri().required(),

  NODE_ENV: Joi.string()
    .valid('production', 'development', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),
  REFRESH_TOKEN_SECRET: Joi.string().min(32).required(),
}).unknown(); // allow extra vars

const { error, value: envVars } = envSchema.validate(process.env, {
  abortEarly: false,
  allowUnknown: true,
  stripUnknown: true,
});

if (error) {
  throw new Error(`❌ Env validation error: ${error.message}`);
}

const isProd = envVars.NODE_ENV === 'production';
const secretMin = isProd ? 64 : 32;
Joi.assert(envVars.ACCESS_TOKEN_SECRET, Joi.string().min(secretMin));
Joi.assert(envVars.REFRESH_TOKEN_SECRET, Joi.string().min(secretMin));

module.exports = {
  accessTokenExpiry: envVars.ACCESS_TOKEN_EXPIRY,
  accessTokenSecret: envVars.ACCESS_TOKEN_SECRET,
  audience: envVars.AUDIENCE,
  isProd,
  issuer: envVars.ISSUER,
  mongoUri: envVars.MONGO_URI,
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  refreshTokenExpiry: envVars.REFRESH_TOKEN_EXPIRY,
  refreshTokenSecret: envVars.REFRESH_TOKEN_SECRET,
};
