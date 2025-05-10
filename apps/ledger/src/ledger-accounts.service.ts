import { Injectable, OnModuleInit } from '@nestjs/common';
import { MomoryDatabaseCollection } from '../../common/database/memory-database-collection';
import { MemoryDatabaseSyncService } from '../../common/database/memory-database-sync.service';
import { LedgerAccount } from './models/ledger-account.model';

import debug from 'debug';

@Injectable()
export class LedgerAccountsService
  extends MomoryDatabaseCollection<LedgerAccount>
  implements OnModuleInit
{
  protected tableName = 'accounts';
  protected userWalletCurrencyIndex = new Map<string, string>();

  private _d = debug(LedgerAccountsService.name);

  constructor(private databaseSyncService: MemoryDatabaseSyncService) {
    super();
    this.databaseSyncService.addCollection(this);
  }

  async onModuleInit() {
    const data = await this.databaseSyncService.getAllDataFromDatabase(this);
    this.setData(data);
    this._d('LOADED %d RECORDS FROM %s', data.length, this.tableName);
  }

  getByUserWalletCurrencyOrFail(
    user_id: string,
    wallet: string,
    currency: string,
  ) {
    let account: LedgerAccount;

    const key = `${user_id}-${wallet}-${currency}`;
    const account_id = this.userWalletCurrencyIndex.get(key);

    if (account_id) {
      account = this.getById(account_id);
    } else {
      account = this.findOne({ user_id, wallet, currency });
      if (account) {
        this.userWalletCurrencyIndex.set(key, account.id);
      }
    }

    if (!account) {
      throw new Error('ACCOUNT_NOT_FOUND');
    }

    return account;
  }
}
