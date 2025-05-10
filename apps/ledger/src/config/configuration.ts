export default () => {
  return {
    CLUSTER_CLIENT_KEY: process.env.LEDGER_CLUSTER_CLIENT_KEY,
    LEDGER_PORT: parseInt(process.env.LEDGER_PORT, 10) || 3003,
    LEDGER_DB_TYPE: process.env.LEDGER_DB_TYPE,
    LEDGER_PRECISION: parseInt(process.env.LEDGER_PRECISION) || 26,
    LEDGER_SCALE: parseInt(process.env.LEDGER_SCALE) || 12,
  };
};
