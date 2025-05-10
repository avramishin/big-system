import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

import { AccountTransactionType } from '../enums/account-transaction-type.enum';
import { Type } from 'class-transformer';

export class CreateAccountsTransactionItem {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @Length(1, 36)
  wallet: string;

  @IsNotEmpty()
  @Length(1, 16)
  currency: string;

  @IsIn(Object.keys(AccountTransactionType))
  type: AccountTransactionType;

  @IsNotEmpty()
  amount: string;

  @IsOptional()
  @IsNotEmpty()
  @Length(1, 36)
  class?: string;

  @IsOptional()
  @Length(1, 65535)
  comment?: string;

  @IsOptional()
  @IsNotEmpty()
  @Length(1, 36)
  created_by?: string;
}

export class CreateAccountsTransactionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @Type(() => CreateAccountsTransactionItem)
  items: CreateAccountsTransactionItem[];

  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  customer_transaction_id: string;

  @IsOptional()
  @IsBoolean()
  allow_negative_balances?: boolean = true;
}
