export default () => {
  return {
    CLUSTER_CLIENT_KEY: process.env.ECHO_CLUSTER_CLIENT_KEY,
    ECHO_PORT: parseInt(process.env.ECHO_PORT, 10) || 3002,
    ECHO_MONOLOG_URL: process.env.ECHO_MONOLOG_URL,
  };
};
