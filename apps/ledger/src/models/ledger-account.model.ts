import { Transform } from 'class-transformer';

export class LedgerAccount {
  id: string;
  user_id: string;
  wallet: string;
  currency: string;

  @Transform(({ value }) => String(value))
  balance: string;

  version: number;
  created_at: string;
}
