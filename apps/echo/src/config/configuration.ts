export default () => {
  return {
    ECHO_PORT: parseInt(process.env.ECHO_PORT, 10) || 3002,
    ECHO_CLUSTER_SECURITY_KEY: process.env.ECHO_CLUSTER_SECURITY_KEY,
    ECHO_MONOLOG_URL: process.env.ECHO_MONOLOG_URL,
  };
};
