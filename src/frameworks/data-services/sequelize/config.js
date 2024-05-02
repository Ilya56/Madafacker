/**
 * This file is .js to be able to run in sequelize-cli.
 * Here is a copy of the config from src/config/configuration because I don't know how to do it better
 * Because of it TODO: merge config from src/config/configuration and this file
 */
const connectionData = {
  dialect: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: process.env.DB_PORT ?? '5432',
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'postgres',
};

module.exports = {
  development: connectionData,
  test: connectionData,
  production: connectionData,
};
