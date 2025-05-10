import { Transform } from 'class-transformer';
import { AccountTransactionType } from '../enums/account-transaction-type.enum';

export class LedgerAccountTransaction {
  id: string;
  parent_transaction_id: string;
  customer_transaction_id: string;
  user_id: string;
  account_id: string;
  class?: string;
  type: AccountTransactionType;

  @Transform(({ value }) => String(value))
  amount: string;

  @Transform(({ value }) => String(value))
  post_balance: string;

  comment: string;
  created_at: string;
  created_by?: string;
}
