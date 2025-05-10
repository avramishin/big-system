import { Knex } from 'knex';
import { AccountTransactionType } from '../enums/account-transaction-type.enum';

import config from '../config/configuration';

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
          async up(knex: Knex) {
            await knex.schema.createTable('ledger_accounts', function (table) {
              table.uuid('id').primary();
              table.uuid('user_id').notNullable().index();
              table.string('wallet', 36).notNullable().index();
              table.string('currency', 16).notNullable();
              table
                .decimal(
                  'balance',
                  config().LEDGER_PRECISION,
                  config().LEDGER_SCALE,
                )
                .notNullable()
                .defaultTo(0);
              table.bigInteger('version').notNullable().unsigned().defaultTo(1);
              table
                .timestamp('created_at')
                .notNullable()
                .defaultTo(knex.fn.now());
            });

            await knex.schema.createTable(
              'ledger_accounts_transactions',
              (table) => {
                table.uuid('id').primary();
                table.uuid('parent_transaction_id').nullable().index();
                table.uuid('customer_transaction_id').nullable().index();
                table.uuid('user_id').notNullable().index();
                table.uuid('account_id').notNullable().index();
                table
                  .enum('type', Object.values(AccountTransactionType))
                  .notNullable();
                table
                  .string('class', 36)
                  .notNullable()
                  .comment(
                    'any string to identify transaction class: payment, trade, manual ...',
                  );
                table
                  .decimal(
                    'amount',
                    config().LEDGER_PRECISION,
                    config().LEDGER_SCALE,
                  )
                  .notNullable();
                table
                  .decimal(
                    'post_balance',
                    config().LEDGER_PRECISION,
                    config().LEDGER_SCALE,
                  )
                  .notNullable();
                table.text('comment').nullable();
                table
                  .timestamp('created_at')
                  .notNullable()
                  .defaultTo(knex.fn.now())
                  .index();
                table.string('created_by', 36).nullable().index();
              },
            );
          },
          async down(knex: Knex) {
            await knex.schema.dropTable('ledger_accounts');
            await knex.schema.dropTable('ledger_accounts_transactions');
          },
        };
    }
  }
}
