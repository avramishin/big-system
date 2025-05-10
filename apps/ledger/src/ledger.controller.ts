import { Controller, Get } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller()
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get()
  getHello(): string {
    return this.ledgerService.getHello();
  }
}
