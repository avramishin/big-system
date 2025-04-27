export default () => ({
  API_PORT: parseInt(process.env.API_PORT, 10) || 3000,
  CLUSTER_SECURITY_KEY: process.env.CLUSTER_SECURITY_KEY,
});
