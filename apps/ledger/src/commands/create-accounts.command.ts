import { plainToInstance } from 'class-transformer';
import { CreateAccountsDto } from '../dto/create-accounts.dto';
import { LedgerAccountsService } from '../ledger-accounts.service';
import { LedgerAccount } from '../models/ledger-account.model';
import { v4 as uuid } from 'uuid';
import debug from 'debug';

export class CreateAccountsCommand {
  private _d = debug(CreateAccountsCommand.name);

  private createdAccounts: LedgerAccount[] = [];

  constructor(private ledgerAccountsService: LedgerAccountsService) {}

  execute(dto: CreateAccountsDto) {
    for (const item of dto.items) {
      const accountExists =
        this.ledgerAccountsService.getByUserWalletCurrencyThruIndex(
          item.user_id,
          item.wallet,
          item.currency,
        );

      if (accountExists) {
        this._d('ACCOUNT_EXIST %o', accountExists);

        if (dto.ignoreExistingAccounts) {
          continue;
        }

        throw new Error(
          `ACCOUNT_EXISTS[${item.user_id}-${item.wallet}-${item.currency}]`,
        );
      }

      const account = plainToInstance(LedgerAccount, {
        id: uuid(),
        balance: '0',
        created_at: new Date().toISOString(),
        currency: item.currency,
        user_id: item.user_id,
        wallet: item.wallet,
      });

      this.createdAccounts.push(this.ledgerAccountsService.insert(account));
      this.ledgerAccountsService.invalidateUserIndexItem(account.user_id);
      this._d('SUCCESS %o', account);
    }

    return this.createdAccounts;
  }
}
