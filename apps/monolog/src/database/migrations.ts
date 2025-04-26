import { Knex } from 'knex';

export class MigrationSource {
  getMigrations() {
    return Promise.resolve(['init']);
  }

  getMigrationName(migration: string) {
    return migration;
  }

  async getMigration(migration: string) {
    switch (migration) {
      case 'init':
        return {
          up(knex: Knex) {
            return knex.schema.createTable('monolog_logs', function (table) {
              // Columns
              table.increments('id').unsigned().notNullable().primary();
              table.string('name', 255).notNullable();
              table.text('data').nullable();
              table.timestamp('created_at').notNullable();
              table.string('rrn', 8).nullable();
              table.timestamp('expires_at').notNullable();

              // Keyword columns
              for (let i = 1; i <= 10; i++) {
                table.integer(`kw_${i}`).unsigned().nullable();
              }

              // Indexes
              table.index('name', 'logs_name_index');
              table.index('created_at', 'logs_created_at_index');
              table.index('rrn', 'logs_rrn_index');
              table.index('expires_at', 'logs_expires_at_index');

              // Keyword indexes
              for (let i = 1; i <= 10; i++) {
                table.index(`kw_${i}`, `logs_kw_${i}_index`);
              }
            });
          },
          down(knex: Knex) {
            return knex.schema.dropTable('monolog_logs');
          },
        };
    }
  }
}
