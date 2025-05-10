import { Injectable, OnModuleInit } from '@nestjs/common';
import { MomoryDatabaseCollection } from '../../common/database/memory-database-collection';
import { MemoryDatabaseSyncService } from '../../common/database/memory-database-sync.service';
import { LedgerAccountTransaction } from './models/ledger-account-transaction.model';

import debug from 'debug';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LedgerAccountsTransactionsService
  extends MomoryDatabaseCollection<LedgerAccountTransaction>
  implements OnModuleInit
{
  protected tableName = 'ledger_accounts_transactions';
  protected immutable = true;
  private _d = debug(LedgerAccountsTransactionsService.name);

  constructor(private databaseSyncService: MemoryDatabaseSyncService) {
    super();
    this.databaseSyncService.addCollection(this);
  }

  async onModuleInit() {
    try {
      const data = await this.databaseSyncService.getAllDataFromDatabase(this);
      this.setData(plainToInstance(LedgerAccountTransaction, data));
      this._d('LOADED %d RECORDS FROM %s', data.length, this.tableName);
    } catch (e) {
      this._d('MODULE_INIT_ERROR: %s TABLE: $s', e.message, this.tableName);
      throw e;
    }
  }
}
