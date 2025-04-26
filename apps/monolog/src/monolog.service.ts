import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { MonologLog } from './database/entities/monolog_log.entity';
import { integerHash } from '../../common/integer-hash';
import { Knex } from 'knex';

@Injectable()
export class MonologService {
  private TABLE_LOGS = 'monolog_logs';

  constructor(@Inject('db') private db: Knex) {}

  async createLog(dto: CreateLogDto) {
    let ctx: string = null;

    if (dto.ctx) {
      ctx = JSON.stringify(dto.ctx);
      if (ctx.length > 65536) {
        throw new BadRequestException(
          'Context data is to large, must be less than 65536 when strigified',
        );
      }
    }

    const record: MonologLog = {
      msg: dto.msg,
      svc: dto.svc,
      rrn: dto.rrn,
      ctx,
      created_at: new Date().valueOf(),
      expires_at: new Date().valueOf() + dto.exp * 1000,
    };

    for (let i = 1; i <= 10; i++) {
      const kw = dto.keywords[i - 1];

      if (!kw) {
        break;
      }

      record[`kw_${i}`] = integerHash(String(kw).toLowerCase());
    }

    return await this.db<MonologLog>(this.TABLE_LOGS).insert(record);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
