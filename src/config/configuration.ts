/**
 * Custom config file. Is created to separate different config in groups
 */
export default () =>
  ({
    port: numberValue('PORT', '4000'),
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
