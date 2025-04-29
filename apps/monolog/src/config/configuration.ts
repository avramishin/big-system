export default () => {
  return {
    CLUSTER_CLIENT_KEY: process.env.MONOLOG_CLUSTER_CLIENT_KEY,
    MONOLOG_PORT: parseInt(process.env.MONOLOG_PORT, 10) || 3001,
    MONOLOG_DB_TYPE: process.env.MONOLOG_DB_TYPE,
  };
};
