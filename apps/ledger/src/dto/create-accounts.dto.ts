import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';

export class CreateAccountItem {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @Length(1, 36)
  wallet: string;

  @IsNotEmpty()
  @Length(1, 16)
  currency: string;
}

export class CreateAccountsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @Type(() => CreateAccountItem)
  items: CreateAccountItem[];

  @IsOptional()
  @IsBoolean()
  ignoreExistingAccounts?: boolean = true;
}
