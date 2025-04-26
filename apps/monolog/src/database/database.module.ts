import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MigrationSource } from './migrations';
import { resolve as resolvePath } from 'path';
import knex, { Knex } from 'knex';

@Global()
@Module({
  providers: [
    {
      provide: 'db',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let instance: Knex;

        if (configService.get<string>('MONOLOG_DB_TYPE') == 'sqlite') {
          const filename = resolvePath(
            `${__dirname}/../../../storage/monolog.sqlite`,
          );
          console.log(`DB: ${filename}`);
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
            console.log('Wait for migrations in other process ...');
            await new Promise((resolve) => setTimeout(resolve, 15_000));
            process.exit(0);
          } else {
            console.error(e);
            throw new Error(e.message);
          }
        }

        return instance;
      },
    },
  ],
  exports: ['db'],
})
export class DatabaseModule {}
