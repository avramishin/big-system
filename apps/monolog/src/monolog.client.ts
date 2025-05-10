import {
  ClusterRestClient,
  ClusterRestClientCredentials,
} from '../../common/cluster-rest.client';
import { MonologLog } from './database/entities/monolog-log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';

import debug from 'debug';

export class MonologClient extends ClusterRestClient {
  private logger = debug(MonologClient.name);

  constructor(credentials: ClusterRestClientCredentials, timeout?: number) {
    super(credentials, timeout);
  }

  async register(log: CreateLogDto) {
    this.logger(`%s %o`, log.msg, log.ctx);
    if (this.credentials.baseUrl && this.credentials.clusterClientKey) {
      try {
        return await this.request<string>('/logs', {
          method: 'POST',
          data: { ...log },
        });
      } catch (e) {
        this.logger('MONOLOG_REGISTER_ERROR %s', e.message);
      }
    }
  }

  async search(searchLogsDto: SearchLogsDto) {
    return await this.request<MonologLog[]>('/logs/search', {
      method: 'GET',
      params: searchLogsDto,
    });
  }

  /**
   * Delete expired logs
   *
   * @returns Number of logs deleted
   */
  async deleteExpired() {
    if (!this.credentials.clusterAdminKey) {
      throw new Error('ADMIN_KEY_IS_REQUIRED');
    }

    return await this.request<number>('/logs/delete-expired', {
      method: 'DELETE',
    });
  }

  /**
   * Delete all logs
   *
   * @returns Number of logs deleted
   */
  async deleteAll() {
    if (!this.credentials.clusterAdminKey) {
      throw new Error('ADMIN_KEY_IS_REQUIRED');
    }
    return await this.request<number>('/logs/delete-all', {
      method: 'DELETE',
    });
  }
}
