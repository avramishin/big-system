export default () => ({
  API_PORT: parseInt(process.env.API_PORT, 10) || 3000,
  CLUSTER_CLIENT_KEY: process.env.API_CLUSTER_CLIENT_KEY,
});
