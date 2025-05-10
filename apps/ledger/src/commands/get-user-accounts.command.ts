import { GetUserAccountsDto } from '../dto/get-user-accounts.dto';
import { LedgerAccountsService } from '../ledger-accounts.service';

export class GetUserAccountsCommand {
  constructor(private ledgerAccountsService: LedgerAccountsService) {}

  execute(dto: GetUserAccountsDto) {
    const accounts = this.ledgerAccountsService.getByUserThruIndex(dto.user_id);
    return accounts.filter((account) => {
      if (dto.currency && account.currency != dto.currency) {
        return false;
      }

      if (dto.wallet && account.wallet != dto.wallet) {
        return false;
      }

      return true;
    });
  }
}
