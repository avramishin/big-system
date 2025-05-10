import { AccountTransactionType } from '../enums/account-transaction-type.enum';

export class LedgerAccountTransaction {
  id: string;
  parent_transaction_id: string;
  customer_transaction_id: string;
  user_id: string;
  account_id: string;
  class?: string;
  type: AccountTransactionType;
  amount: number;
  post_balance: number;
  comment: string;
  created_at: string;
  created_by?: string;
}
