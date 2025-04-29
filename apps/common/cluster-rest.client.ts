import axios, { AxiosRequestConfig } from 'axios';

export abstract class ClusterRestClient {
  constructor(
    protected baseUrl: string,
    protected clusterClientKey: string,
    protected clusterClientName: string,
    protected timeout?: number,
  ) {}

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setClusterClientKey(clusterClientKey: string) {
    this.clusterClientKey = clusterClientKey;
  }

  setClusterClientName(clusterClientName: string) {
    this.clusterClientName = clusterClientName;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  protected async request<T>(
    path: string,
    config: AxiosRequestConfig,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'X-CCK': this.clusterClientKey,
      'X-CCN': this.clusterClientName || 'UNKNOWN',
    };

    try {
      const response = await axios<T>({
        headers,
        timeout: this.timeout,
        url: `${this.baseUrl}${path}`,
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
