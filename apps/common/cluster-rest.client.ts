import axios, { AxiosRequestConfig } from 'axios';

export class ClusterRestClientCredentials {
  baseUrl: string;
  clusterClientName: string;
  clusterClientKey: string;
  clusterAdminKey?: string;
}

export abstract class ClusterRestClient {
  constructor(
    protected credentials: ClusterRestClientCredentials,
    protected timeout?: number,
  ) {}

  setBaseUrl(baseUrl: string) {
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
    this.timeout = timeout;
  }

  protected async request<T>(
    path: string,
    config: AxiosRequestConfig,
  ): Promise<T> {
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
      const message =
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
      throw new Error(message);
    }
  }
}
