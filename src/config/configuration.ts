/**
 * Custom config file. Is created to separate different config in groups
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '', 10) || 4000,
  database: {
    dialect: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: process.env.DB_PORT ?? '5432',
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'postgres',
  },
});
