import axios, { AxiosRequestConfig } from 'axios';
import debug from 'debug';
import assert from 'assert';

export class ClusterRestClientCredentials {
  baseUrl: string;
  clusterClientName: string;
  clusterClientKey: string;
  clusterAdminKey?: string;
}

export abstract class ClusterRestClient {
  private _d = debug(ClusterRestClient.name);

  constructor(
    protected credentials: ClusterRestClientCredentials,
    protected timeout?: number,
  ) {}

  setBaseUrl(baseUrl: string) {
    assert(baseUrl, 'BASE_URL_SHOULD_NOT_BE_EMPTY');
    this.credentials.baseUrl = baseUrl;
  }

  setClusterClientKey(clusterClientKey: string) {
    this.credentials.clusterClientKey = clusterClientKey;
  }

  setClusterAdminKey(clusterAminKey: string) {
    this.credentials.clusterAdminKey = clusterAminKey;
  }

  setClusterClientName(clusterClientName: string) {
    this.credentials.clusterClientName = clusterClientName;
  }

  setTimeout(timeout: number) {
    assert(timeout, 'TIMEOUT_SHOULD_NOT_BE_EMPTY');
    this.timeout = timeout;
  }

  protected async request<T>(
    path: string,
    config: AxiosRequestConfig,
  ): Promise<T> {
    assert(this.credentials.baseUrl, 'BASE_URL_NOT_SET');

    const headers: Record<string, string> = {
      'X-CCK': this.credentials?.clusterClientKey || 'UNKNOWN',
      'X-CCN': this.credentials?.clusterClientName || 'UNKNOWN',
    };

    if (this.credentials.clusterAdminKey) {
      headers['X-CAK'] = this.credentials?.clusterAdminKey || 'UNKNOWN';
    }

    try {
      const response = await axios<T>({
        headers,
        timeout: this.timeout,
        url: `${this.credentials.baseUrl}${path}`,
        ...config,
      });
      return response.data;
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        `HTTP: ${e.message}`;

      let res = String(e.response?.data || 'NO_DATA');
      if (res.includes('<html')) {
        res = res
          .replace(/(<([^>]+)>)/gi, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 1024);
      }

      this._d('ERROR: %s', msg);

      throw new Error(msg);
    }
  }
}
