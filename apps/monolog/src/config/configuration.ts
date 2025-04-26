export default () => ({
  API_PORT: parseInt(process.env.MONOLOG_PORT, 10) || 3001,
  MONOLOG_DB_TYPE: process.env.MONOLOG_DB_TYPE,
});
