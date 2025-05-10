// Misc
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

// Services
import { LedgerService } from './ledger.service';
import { LedgerAccountsTransactionsService } from './ledger-accounts-transactions.service';
import { LedgerAccountsService } from './ledger-accounts.service';

// Dto
import { CreateAccountsDto } from './dto/create-accounts.dto';
import { GetUserAccountsDto } from './dto/get-user-accounts.dto';

// Commands
import { CreateAccountsCommand } from './commands/create-accounts.command';
import { GetUserAccountsCommand } from './commands/get-user-accounts.command';
import { CreateAccountsTransactionDto } from './dto/create-accounts-transaction.dto';
import { CreateAccountsTransactionCommand } from './commands/create-accounts-transaction.command';

@Controller()
export class LedgerController {
  constructor(
    private ledgerService: LedgerService,
    private ledgerAccountsService: LedgerAccountsService,
    private ledgerAccountsTransactionsService: LedgerAccountsTransactionsService,
  ) {}

  @Get()
  getHello(): string {
    return this.ledgerService.getHello();
  }

  @Get('v1/user/accounts')
  getUserAccounts(@Query() dto: GetUserAccountsDto) {
    return new GetUserAccountsCommand(this.ledgerAccountsService).execute(dto);
  }

  @Post('v1/accounts')
  createAccounts(@Body() dto: CreateAccountsDto) {
    return new CreateAccountsCommand(this.ledgerAccountsService).execute(dto);
  }

  @Post('v1/accounts/transaction')
  createAccountsTransaction(@Body() dto: CreateAccountsTransactionDto) {
    return new CreateAccountsTransactionCommand(
      this.ledgerAccountsService,
      this.ledgerAccountsTransactionsService,
    ).execute(dto);
  }
}
