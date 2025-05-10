import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MigrationSource } from './migrations';
import { resolve as resolvePath } from 'path';
import { MemoryDatabaseSyncService } from '../../../common/database/memory-database-sync.service';
import { waitFor } from '../../../common/wait-for';

import knex, { Knex } from 'knex';
import debug from 'debug';

@Global()
@Module({
  providers: [
    MemoryDatabaseSyncService,

    {
      provide: 'db',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let instance: Knex;
        let _d = debug('DatabaseModule:useFactory');

        if (configService.get<string>('LEDGER_DB_TYPE') == 'sqlite') {
          const filename = resolvePath(
            `${__dirname}/../../../storage/ledger.sqlite`,
          );
          _d('SQLITE_DB_FILE: %s', filename);
          instance = knex({
            client: 'better-sqlite3',
            asyncStackTraces: true,
            compileSqlOnError: true,
            useNullAsDefault: true,
            connection: {
              filename,
            },
            pool: {
              afterCreate: function (conn, cb) {
                conn.pragma('synchronous = OFF');
                conn.pragma('journal_mode = WAL');
                conn.pragma('foreign_keys = OFF');
                cb();
              },
            },
          });
        }

        try {
          await instance.migrate.latest({
            migrationSource: new MigrationSource(),
          });
        } catch (e) {
          if (
            e.message.match('MigrationLocked') ||
            e.message.match('Migration table is already locked')
          ) {
            _d('WAIT_MIGRATIONS_OTHER_PROCESS');
            await waitFor(15_000);
            process.exit(0);
          } else {
            _d('MIGRATIONS_ERROR: %s', e.message);
            throw new Error(e.message);
          }
        }

        return instance;
      },
    },
  ],
  exports: ['db', MemoryDatabaseSyncService],
})
export class DatabaseModule {}
