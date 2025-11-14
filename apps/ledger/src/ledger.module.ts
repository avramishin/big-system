import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { LedgerAccountsService } from './ledger-accounts.service';

import { LedgerAccountsTransactionsService } from './ledger-accounts-transactions.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [LedgerController],
  providers: [
    LedgerService,
    LedgerAccountsService,
    LedgerAccountsTransactionsService,
  ],
})
export class LedgerModule {}
