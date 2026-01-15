/**
 * E2E Test Setup
 *
 * This file sets up environment variables for E2E tests.
 * It ensures that:
 * - Firebase is disabled (uses mocks)
 * - External services use test configurations
 * - Real ConfigService can be used with proper env values
 */

// Set default test environment variables if not already set
if (!process.env.FIREBASE_ENABLED) {
  process.env.FIREBASE_ENABLED = 'false';
}

// Database config (use defaults if not set)
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost';
}
if (!process.env.DB_PORT) {
  process.env.DB_PORT = '5432';
}
if (!process.env.DB_USERNAME) {
  process.env.DB_USERNAME = 'postgres';
}
if (!process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = '';
}
if (!process.env.DB_NAME) {
  process.env.DB_NAME = 'madafacker-autotests';
}

// Redis config (use defaults if not set)
if (!process.env.REDIS_HOST) {
  process.env.REDIS_HOST = 'localhost';
}
if (!process.env.REDIS_PORT) {
  process.env.REDIS_PORT = '6379';
}
if (!process.env.REDIS_PASSWORD) {
  process.env.REDIS_PASSWORD = '';
}

// API Key (use test value if not set)
if (!process.env.API_KEY) {
  process.env.API_KEY = 'test-api-key';
}

// Port (use default if not set)
if (!process.env.PORT) {
  process.env.PORT = '4000';
}

// Moderation thresholds (use defaults if not set - these can be overridden in tests via spy)
if (!process.env.MODERATION_THRESHOLD_LIGHT) {
  process.env.MODERATION_THRESHOLD_LIGHT = '0.01';
}
if (!process.env.MODERATION_THRESHOLD_DARK) {
  process.env.MODERATION_THRESHOLD_DARK = '0.4';
}
