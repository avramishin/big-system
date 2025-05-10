import {
  CreateAccountsTransactionDto,
  CreateAccountsTransactionItem,
} from '../dto/create-accounts-transaction.dto';

import { LedgerAccountsTransactionsService } from '../ledger-accounts-transactions.service';
import { LedgerAccountsService } from '../ledger-accounts.service';
import { LedgerAccount } from '../models/ledger-account.model';
import { LedgerAccountTransaction } from '../models/ledger-account-transaction.model';
import { AccountTransactionType } from '../enums/account-transaction-type.enum';
import { v4 as uuid } from 'uuid';

import debug from 'debug';
import assert from 'assert';
import BigNumber from 'bignumber.js';

export class CreateAccountsTransactionCommand {
  private _d = debug(CreateAccountsTransactionCommand.name);

  private parentTransactionId = uuid();
  private accountsSnapshot: Map<string, LedgerAccount> = new Map();
  private accountTransactions: LedgerAccountTransaction[] = [];
  private dto: CreateAccountsTransactionDto;

  constructor(
    private ledgerAccountsService: LedgerAccountsService,
    private ledgerAccountsTransactionsService: LedgerAccountsTransactionsService,
  ) {}

  execute(dto: CreateAccountsTransactionDto) {
    this._d('START: %o', dto);
    this.dto = dto;
    try {
      this.createSnapshot();
      this.applyOperations();
      this.mergeSnapshot();
      this._d('OK, ITEMS %d', this.accountTransactions.length);
      return this.accountTransactions;
    } catch (e) {
      this._d('ERROR: %s', e.message);
      throw e;
    }
  }

  applyOperations() {
    for (const item of this.dto.items) {
      assert(
        Object.keys(AccountTransactionType).includes(item.type),
        'CREATE_ACCOUNT_TRANSACTIONS_TYPE',
      );

      const account = this.getSnapshotAccountForItem(item);

      assert(account.balance?.length, 'CREATE_ACCOUNT_TRANSACTIONS_BALANCE');

      let newBalance: BigNumber;

      if (item.type === AccountTransactionType.credit) {
        newBalance = new BigNumber(account.balance).plus(item.amount);
      } else {
        newBalance = new BigNumber(account.balance).minus(item.amount);
      }

      if (!this.dto.allow_negative_balances && newBalance.lt(0)) {
        throw new Error(
          `NEGATIVE_BALANCE_DETECTED[${account.user_id}-${account.wallet}-${account.currency}-${newBalance.toString()}]`,
        );
      }

      account.balance = newBalance.toString();

      const at = new LedgerAccountTransaction();
      at.id = uuid();
      at.account_id = account.id;
      at.user_id = account.user_id;
      at.amount = item.amount;
      at.post_balance = account.balance;
      at.type = item.type;
      at.class = item.class || null;
      at.comment = item.comment || null;
      at.created_at = new Date().toISOString();
      at.created_by = item.created_by || null;
      at.customer_transaction_id = this.dto.customer_transaction_id || null;
      at.parent_transaction_id = this.parentTransactionId;

      this.accountTransactions.push(at);
    }
  }

  mergeSnapshot() {
    assert(
      this.accountsSnapshot.size,
      'CREATE_ACCOUNT_TRANSACTIONS_EMPTY_SNAPSHOT',
    );

    assert(
      this.accountTransactions.length,
      'CREATE_ACCOUNT_TRANSACTIONS_EMPTY_HISTORY',
    );

    // Update accounts
    Array.from(this.accountsSnapshot, ([_, account]) => {
      this.ledgerAccountsService.update(account.id, {
        balance: account.balance,
        version: account.version + 1,
      });
    });

    // Insert accounts transactions
    for (const accountTransaction of this.accountTransactions) {
      this.ledgerAccountsTransactionsService.insert(accountTransaction);
    }
  }

  // Collect accounts to accountsSnapshot
  private createSnapshot() {
    for (const item of this.dto.items) {
      const account =
        this.ledgerAccountsService.getByUserWalletCurrencyThruIndex(
          item.user_id,
          item.wallet,
          item.currency,
        );

      if (!account) {
        throw new Error(
          `ACCOUNT_NOT_FOUND[${item.user_id}-${item.wallet}-${item.currency}]`,
        );
      }

      this.accountsSnapshot.set(
        `${item.user_id}-${item.wallet}-${item.currency}`,
        { ...account },
      );
    }
  }

  getSnapshotAccountForItem(item: CreateAccountsTransactionItem) {
    const account = this.accountsSnapshot.get(
      `${item.user_id}-${item.wallet}-${item.currency}`,
    );

    assert(account?.id, 'NO_ITEM_RETURNED_FROM_SNAPSHOT');

    return account;
  }
}
