import { Knex } from 'knex';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { MonologLog } from './database/entities/monolog-log.entity';
import { integerHash } from '../../common/integer-hash';
import { SearchLogsDto } from './dto/search-logs.dto';

import crypto from 'crypto';
import debug from 'debug';

@Injectable()
export class MonologService {
  private TABLE_LOGS = 'monolog_logs';
  private _d = debug(MonologService.name);

  constructor(@Inject('db') private db: Knex) {}

  async searchLogs(dto: SearchLogsDto) {
    let result: Pick<
      MonologLog,
      'id' | 'svc' | 'msg' | 'ctx' | 'rrn' | 'created_at'
    >[] = [];

    try {
      const query = this.db<MonologLog>(this.TABLE_LOGS)
        .select('id', 'svc', 'msg', 'ctx', 'rrn', 'created_at')
        .limit(dto.limit || 50)
        .offset(dto.offset || 0)
        .orderBy('id', 'desc');

      if (dto.time_from) {
        query.where('created_at', '>=', dto.time_from);
      }

      if (dto.time_to) {
        query.where('created_at', '<=', dto.time_to);
      }

      if (dto.msg) {
        query.whereLike('msg', dto.msg + '%');
      }

      if (dto.rrn) {
        query.where('rrn', dto.rrn);
      }

      if (dto.svc) {
        query.where('svc', dto.svc);
      }

      if (dto.keyword) {
        query.where(function () {
          for (let i = 1; i <= 10; i++) {
            this.orWhere(
              `kw_${i}`,
              integerHash(String(dto.keyword).trim().toLowerCase()),
            );
          }
        });
      }

      result = await query;
    } catch (e) {
      this._d('SEARCH_ERROR %s %o', e.message, dto);
    }

    return result;
  }

  async createLog(dto: CreateLogDto, ccn: string) {
    let ctx: string = null;

    if (dto.ctx) {
      ctx = JSON.stringify(dto.ctx);
      if (ctx.length > 65536) {
        throw new BadRequestException('CTX_DATA_TOO_LARGE');
      }
    }

    const rrn = crypto.randomBytes(4).toString('hex').toUpperCase();

    const record: MonologLog = {
      msg: dto.msg,
      svc: ccn,
      rrn,
      ctx,
      created_at: new Date().valueOf(),
      expires_at: new Date().valueOf() + dto.exp * 1000,
    };

    if (dto.keywords) {
      for (let i = 1; i <= 10; i++) {
        const kw = dto.keywords[i - 1];

        if (!kw) {
          break;
        }

        record[`kw_${i}`] = integerHash(String(kw).toLowerCase());
      }
    }

    try {
      await this.db<MonologLog>(this.TABLE_LOGS).insert(record);
    } catch (e) {
      this._d('INSERT_ERROR %s', e.message);
    }

    return rrn;
  }

  /**
   * Delete expired logs from the database
   * @returns Promise<number> Number of rows deleted
   */
  async deleteExpired() {
    let affectedRows = 0;
    try {
      affectedRows = await this.db<MonologLog>(this.TABLE_LOGS)
        .where('expires_at', '<', new Date().valueOf())
        .delete();
    } catch (e) {
      this._d('DELETE_EXP_ERROR %s', e.message);
    }

    return affectedRows;
  }

  async deleteAll() {
    let affectedRows = 0;
    try {
      affectedRows = await this.db<MonologLog>(this.TABLE_LOGS).delete();
    } catch (e) {
      this._d('DELETE_ALL_ERROR %s', e.message);
    }
  }
}
