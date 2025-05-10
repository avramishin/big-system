import { Knex } from 'knex';
import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { MomoryDatabaseCollection } from './memory-database-collection';

import assert from 'assert';
import debug from 'debug';

@Injectable()
export class MemoryDatabaseSyncService implements OnModuleInit {
  private _d = debug(MemoryDatabaseSyncService.name);

  constructor(@Inject('db') protected db: Knex) {}

  private collections: MomoryDatabaseCollection<any>[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private batchSize = 100;
  private syncIntervalMs = 200;
  private isSyncing: boolean = false;

  async onModuleInit() {
    this.startSync();
  }

  getAllDataFromDatabase(collection: MomoryDatabaseCollection<any>) {
    this._d('GET_ALL_DATA_FROM_DB %s', collection.getTableName());
    return this.db(collection.getTableName()).select('*');
  }

  addCollection(collection: MomoryDatabaseCollection<any>) {
    this._d('ADD_COLLECTION %s', collection.getTableName());
    this.collections.push(collection);
  }

  startSync() {
    this._d('START_SYNC_INTERVAL %d', this.syncIntervalMs);

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(
      () => this.safeSyncCollections(),
      this.syncIntervalMs,
    );
  }

  stopSync() {
    this._d('STOP_SYNC_CLEAR_INTERVAL');

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async safeSyncCollections() {
    if (this.isSyncing) {
      this._d('SYNC_IN_PROGRESS_SKIP_CYCLE');
      return;
    }

    this.isSyncing = true;

    try {
      await this.syncCollections();
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncCollections() {
    let trx: Knex.Transaction;

    let updatesCount = 0;
    let deletesCount = 0;
    let insertsCount = 0;

    try {
      trx = await this.db.transaction();

      for (const collection of this.collections) {
        const changes = collection.getChanges();

        if (changes.length > 0) {
          const inserts = changes
            .filter((item) => item.action === 'INSERT')
            .map((item) => item.data);

          const updates = changes
            .filter((item) => item.action === 'UPDATE')
            .map((item) => item.data);

          const deletes = changes
            .filter((item) => item.action === 'DELETE')
            .map((item) => item.data);

          if (collection.isImmutable()) {
            assert(
              updates.length === 0,
              'IMMUTABLE_COLLECTION_UPDATES_DETECTED',
            );

            assert(
              deletes.length === 0,
              'IMMUTABLE_COLLECTION_DELETES_DETECTED',
            );
          }

          if (inserts.length > 0) {
            /** Immutable collections can be cleared before inserts */
            if (collection.isImmutable()) {
              collection.setData([]);
            }

            insertsCount += inserts.length;
            while (inserts.length > 0) {
              await this.db(collection.getTableName())
                .transacting(trx)
                .insert(inserts.splice(0, this.batchSize));
            }
          }

          for (const updateItem of updates) {
            updatesCount += 1;
            await this.db(collection.getTableName())
              .transacting(trx)
              .where('id', updateItem.id)
              .update(updateItem);
          }

          for (const deleteItem of deletes) {
            deletesCount += 1;
            await this.db(collection.getTableName())
              .transacting(trx)
              .where('id', deleteItem.id)
              .delete();
          }
        }
      }

      await trx.commit();
      if (updatesCount > 0 || deletesCount > 0 || insertsCount > 0) {
        this._d(
          'SYNC_SUCCESS I:%d, U:%d, D:%d',
          insertsCount,
          updatesCount,
          deletesCount,
        );
      }
    } catch (e) {
      this._d('SYNC_ERROR: %s', e.message);
      if (trx) {
        await trx.rollback();
      }
    }
  }
}
