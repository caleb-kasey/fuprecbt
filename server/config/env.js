const dotenv = require('dotenv');
const path = require('path');

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Validates and exports environment configuration
 */
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fupre-cbt-db',
  JWT_SECRET: process.env.JWT_SECRET || 'fupre_cbt_jwt_super_secret_key_2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  isProduction: process.env.NODE_ENV === 'production',
};

// Validate critical variables in production
if (env.isProduction) {
  if (!process.env.MONGO_URI) {
    console.warn('⚠️ WARNING: MONGO_URI is not set in production environment variables.');
  }
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️ WARNING: JWT_SECRET is not set in production environment variables.');
  }
}

module.exports = env;
