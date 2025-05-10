import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { MomoryDatabaseCollection } from '../../common/database/memory-database-collection';
import { MemoryDatabaseSyncService } from '../../common/database/memory-database-sync.service';
import { LedgerAccount } from './models/ledger-account.model';

import debug from 'debug';
import assert from 'assert';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class LedgerAccountsService
  extends MomoryDatabaseCollection<LedgerAccount>
  implements OnModuleInit
{
  protected tableName = 'ledger_accounts';
  protected userWalletCurrencyIndex = new Map<string, string>();
  protected userIndex = new Map<string, string[]>();

  private _d = debug(LedgerAccountsService.name);

  constructor(private databaseSyncService: MemoryDatabaseSyncService) {
    super();
    this.databaseSyncService.addCollection(this);
  }

  async onModuleInit() {
    try {
      const data = await this.databaseSyncService.getAllDataFromDatabase(this);
      this.setData(plainToInstance(LedgerAccount, data));
      this._d('LOADED %d RECORDS FROM %s', data.length, this.tableName);
    } catch (e) {
      this._d('MODULE_INIT_ERROR: %s TABLE: $s', e.message, this.tableName);
      throw e;
    }
  }

  getByUserWalletCurrencyThruIndex(
    user_id: string,
    wallet: string,
    currency: string,
  ) {
    let result: LedgerAccount;

    const indexKey = `${user_id}-${wallet}-${currency}`;
    const accountId = this.userWalletCurrencyIndex.get(indexKey);

    if (accountId) {
      result = this.getById(accountId);
    } else {
      result = this.findOne({ user_id, wallet, currency });
      if (result) {
        this.userWalletCurrencyIndex.set(indexKey, result.id);
      }
    }

    return result;
  }

  getByUserThruIndex(user_id: string) {
    let result: LedgerAccount[] = [];

    const indexKey = user_id;
    const accountIds = this.userIndex.get(indexKey);
    if (Array.isArray(accountIds)) {
      assert(accountIds.length, 'EMPTY_ARRAY_IN_INDEX');
      result = accountIds.map((accountId) => this.getById(accountId));
    } else {
      result = this.find({ user_id });
      if (result.length > 0) {
        this.userIndex.set(
          user_id,
          result.map((account) => account.id),
        );
      }
    }

    return result;
  }

  invalidateUserIndexItem(user_id: string) {
    this.userIndex.delete(user_id);
  }
}
