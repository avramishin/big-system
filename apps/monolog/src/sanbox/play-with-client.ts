import { MonologClient } from '../monolog.client';

const monologClient = new MonologClient(
  'http://localhost:3001/v1',
  '124567890',
);

async function main() {
  const log = await monologClient.register({
    svc: 'test',
    msg: 'test',
    ctx: { d: 1 },
    exp: 3000,
  });

  console.log(log);

  const logs = await monologClient.searchLogs({
    pager: {
      limit: 10,
      offset: 0,
    },
    dateRange: {
      from: new Date().getTime(),
      to: new Date().getTime(),
    },
    msg: 'test',
  });

  console.log(logs);

  const deleted = await monologClient.deleteExpiredLogs();
  console.log(deleted);

  const deletedAll = await monologClient.deleteAllLogs();
  console.log(deletedAll);
}

main();
