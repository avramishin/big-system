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
    limit: 10,
    offset: 0,
    time_from: new Date().getTime() + 1000,
    time_to: new Date().getTime() + 10000,
    msg: 'test',
  });

  console.log(logs);

  const deleted = await monologClient.deleteExpiredLogs();
  console.log(deleted);

  const deletedAll = await monologClient.deleteAllLogs();
  console.log(deletedAll);
}

main();
