import {
  ClusterRestClient,
  ClusterRestClientCredentials,
} from '../../common/cluster-rest.client';
import { MonologLog } from './database/entities/monolog_log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';

export class MonologClient extends ClusterRestClient {
  constructor(credentials: ClusterRestClientCredentials, timeout?: number) {
    super(credentials, timeout);
  }

  async register(log: CreateLogDto) {
    // Always write to console log
    console.log(
      JSON.stringify({
        message: log.msg,
        ctx: log.ctx,
      }),
    );

    if (this.credentials.baseUrl && this.credentials.clusterClientKey) {
      try {
        return await this.request<string>('/logs', {
          method: 'POST',
          data: { ...log },
        });
      } catch (e) {
        console.error(
          JSON.stringify({
            message: 'MONOLOG_REGISTER_ERROR',
            error: e.message,
          }),
        );
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
