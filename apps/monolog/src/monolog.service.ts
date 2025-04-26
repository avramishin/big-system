import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { MonologLog } from './database/entities/monolog_log.entity';
import { integerHash } from '../../common/integer-hash';
import { Knex } from 'knex';
import { SearchLogsDto } from './dto/search-logs.dto';

@Injectable()
export class MonologService {
  private TABLE_LOGS = 'monolog_logs';

  constructor(@Inject('db') private db: Knex) {}

  /**
   * Search logs based on provided search criteria
   * @param dto SearchLogsDto containing search parameters:
   *   - limit: optional limit for pagination
   *   - offset: offset for pagination
   *   - time_from: optional from/to timestamp milliseconds to filter by
   *   - time_to: optional from/to timestamp milliseconds to filter by
   *   - msg: optional message prefix to filter by
   *   - rrn: optional reference number to filter by
   *   - svc: optional service name to filter by
   *   - keyword: optional keyword to search across kw_1 through kw_10 fields
   * @returns Promise<MonologLog[]> Array of matching log entries
   */
  async searchLogs(dto: SearchLogsDto) {
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

    return await query;
  }

  /**
   * Create a new log entry in the database
   * @param dto CreateLogDto containing log details:
   *   - msg: log message
   *   - svc: service name
   *   - rrn: reference number
   *   - ctx: context data
   *   - exp: expiration time in seconds
   *   - keywords: array of keywords to search across
   * @returns Promise<number> ID of the newly created log entry
   */
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

    if (dto.keywords) {
      for (let i = 1; i <= 10; i++) {
        const kw = dto.keywords[i - 1];

        if (!kw) {
          break;
        }

        record[`kw_${i}`] = integerHash(String(kw).toLowerCase());
      }
    }

    return await this.db<MonologLog>(this.TABLE_LOGS).insert(record);
  }

  /**
   * Delete expired logs from the database
   * @returns Promise<number> Number of rows deleted
   */
  async deleteExpiredLogs() {
    return await this.db<MonologLog>(this.TABLE_LOGS)
      .where('expires_at', '<', new Date().valueOf())
      .delete();
  }

  /**
   * Delete all logs from the database
   * @returns Promise<number> Number of rows deleted
   */
  async deleteAllLogs() {
    return await this.db<MonologLog>(this.TABLE_LOGS).delete();
  }
}
