export default () => ({
  MONOLOG_PORT: parseInt(process.env.MONOLOG_PORT, 10) || 3001,
  MONOLOG_DB_TYPE: process.env.MONOLOG_DB_TYPE,
  MONOLOG_CLUSTER_SECURITY_KEY: process.env.MONOLOG_CLUSTER_SECURITY_KEY,
});
