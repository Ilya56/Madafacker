/**
 * Custom config file. Is created to separate different config in groups
 */
export default () =>
  ({
    port: numberValue('PORT', '4000'),
    apiKey: stringValue('API_KEY', ''),
    database: {
      dialect: 'postgres',
      host: stringValue('DB_HOST', 'localhost'),
      port: numberValue('DB_PORT', '5432'),
      username: stringValue('DB_USERNAME', 'postgres'),
      password: stringValue('DB_PASSWORD', ''),
      database: stringValue('DB_NAME', 'postgres'),
    },
    redis: {
      host: stringValue('REDIS_HOST', 'localhost'),
      port: numberValue('REDIS_PORT', '6379'),
      password: stringValue('REDIS_PASSWORD', ''),
    },
    firebase: {
      projectId: stringValue('FIREBASE_PROJECT_ID', ''),
      clientEmail: stringValue('FIREBASE_CLIENT_EMAIL', ''),
      privateKey: stringValue('FIREBASE_PRIVATE_KEY', ''),
      isFirebaseEnabled: booleanValue('FIREBASE_ENABLED', 'true'),
    },
  } as const);

/**
 * Retrieves string value from process env.
 * If no value in the env file, it returns default value
 * @param name key of the property to retrieve
 * @param defaultValue default value if env value not found
 */
function stringValue(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

/**
 * Retrieves numeric value from process env.
 * If no value in the env file, it returns parsed to number default value
 * @param name key of the property to retrieve
 * @param defaultValue default value if env value not found
 */
function numberValue(name: string, defaultValue: string): number {
  return +stringValue(name, defaultValue);
}

/**
 * Retrieves boolean value from process env.
 * It's true only when value is 'true', otherwise it's false
 * @param name key of the property to retrieve
 * @param defaultValue default value if env value not found
 */
function booleanValue(name: string, defaultValue: string): boolean {
  return stringValue(name, defaultValue) === 'true';
}
