import { MonologLogTtl } from '../enums/monolog-log-ttl.enum';
import { MonologClient } from '../monolog.client';

const monolog = new MonologClient('http://localhost:3001/v1', '124567890');

async function main() {
  const log = await monolog.register({
    msg: 'test',
    ctx: { d: 1 },
    exp: MonologLogTtl.day_1,
  });

  console.log(log);

  const logs = await monolog.search({
    limit: 10,
    offset: 0,
    msg: 'test',
  });

  console.log(logs);

  const deleted = await monolog.deleteExpired();
  console.log(deleted);

  // const deletedAll = await monolog.deleteAll();
  // console.log(deletedAll);
}

main();
