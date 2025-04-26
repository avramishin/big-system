import { ClusterRestClient } from '../../common/cluster-rest.client';
import { MonologLog } from './database/entities/monolog_log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { SearchLogsDto } from './dto/search-logs.dto';

export class MonologClient extends ClusterRestClient {
  /**
   * Client for interacting with the Monolog service
   * Provides methods to create, search and delete logs
   *
   * @param baseUrl - Base URL of the Monolog service
   * @param cluster_sercurity_key - Security key for cluster authentication
   * @param source - Optional source identifier
   * @param timeout - Optional request timeout in milliseconds
   */
  constructor(
    baseUrl: string,
    cluster_sercurity_key: string,
    source?: string,
    timeout?: number,
  ) {
    super(baseUrl, cluster_sercurity_key, source, timeout);
  }

  /**
   * Create a new log entry
   *
   * @param log - Log data containing:
   *   - svc: service name generating the log
   *   - msg: log message text
   *   - ctx: optional context object
   *   - rrn: optional reference number
   *   - keywords: optional keywords to search across kw_1 through kw_10 fields
   * @returns Number of logs created
   */
  async register(log: CreateLogDto) {
    return await this.request<number[]>('/logs', {
      method: 'POST',
      data: log,
    });
  }

  /**
   * Search for logs based on provided criteria
   *
   * @param searchLogsDto - Search criteria containing:
   *   - limit: limit for pagination
   *   - offset: offset for pagination
   *   - time_from: optional from/to timestamp milliseconds to filter by
   *   - time_to: optional from/to timestamp milliseconds to filter by
   *   - msg: optional message prefix to filter by
   *   - rrn: optional reference number to filter by
   *   - svc: optional service name to filter by
   *   - keyword: optional keyword to search across kw_1 through kw_10 fields
   * @returns Array of logs matching the search criteria
   */
  async searchLogs(searchLogsDto: SearchLogsDto) {
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
  async deleteExpiredLogs() {
    return await this.request<number>('/logs/delete-expired', {
      method: 'DELETE',
    });
  }

  /**
   * Delete all logs
   *
   * @returns Number of logs deleted
   */
  async deleteAllLogs() {
    return await this.request<number>('/logs/delete-all', {
      method: 'DELETE',
    });
  }
}
