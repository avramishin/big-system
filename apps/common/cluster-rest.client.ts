import axios, { AxiosRequestConfig } from 'axios';

export abstract class ClusterRestClient {
  constructor(
    private baseUrl: string,
    private cluster_sercurity_key: string,
    private source?: string,
    private timeout?: number,
  ) {}

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setClusterSecurityKey(cluster_sercurity_key: string) {
    this.cluster_sercurity_key = cluster_sercurity_key;
  }

  setSource(source: string) {
    this.source = source;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  protected async request<T>(
    path: string,
    config: AxiosRequestConfig,
  ): Promise<T> {
    const headers = {
      'X-Cluster-Security-Key': this.cluster_sercurity_key,
      'X-Cluster-Source': this.source,
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
